// Hydroponics Playground test rig (ESP8266)
// Four breadboard LEDs stand in for the actuators. Commands arrive over MQTT from the
// playground backend; every pulse is timed with millis() (no delay() in the control path).
//
// Libraries (Library Manager): PubSubClient 2.8+, ArduinoJson 7.x
// Board package: "esp8266" by ESP8266 Community
//
// Wiring (each LED: GPIO -> 220 ohm resistor -> LED anode, cathode -> GND)
//   CIRCULATION_PUMP  GPIO5  (D1 on NodeMCU)
//   PH_DOWN           GPIO4  (D2)
//   NUTRIENT_A        GPIO14 (D5)
//   NUTRIENT_B        GPIO12 (D6)
// The onboard LED is solid ON while WiFi is not connected.

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <time.h>

// ===================== Configuration =====================
const char*    WIFI_SSID    = "Realme S";
const char*    WIFI_PASS    = "1234567891";
const char*    MQTT_HOST    = "10.99.25.52";  // LAN IP of the broker (NOT localhost)
const uint16_t MQTT_PORT    = 1883;
const char*    MQTT_USER    = "";                // leave empty if the broker has no auth
const char*    MQTT_PASS    = "";

const char*    RIG_ID       = "rig01";           // must match PLAYGROUND_RIG_ID on the backend
const char*    TOPIC_PREFIX = "hydro/playground";// must match PLAYGROUND_TOPIC_PREFIX

const uint32_t MAX_PULSE_MS         = 30000;     // hard clamp for any timed pulse
const uint32_t DEFAULT_PULSE_MS     = 2000;      // used if a dosing ON arrives without a duration
const unsigned long COMMS_FAILSAFE_MS   = 10000; // all LEDs off if MQTT is down this long
const unsigned long RECHECK_INTERVAL_MS = 10000; // every 10 s: verify WiFi + MQTT, send a heartbeat, blink the LED
const unsigned long BLINK_ON_MS         = 120;   // onboard LED blink timing (non-blocking)
const unsigned long BLINK_GAP_MS        = 180;
const uint16_t      MQTT_KEEPALIVE_S    = 10;    // broker declares the rig dead after ~1.5x this and publishes the last-will

// Every command carries `expires_at` (the SERVER's clock). The MQTT session is clean, so the broker never replays
// old commands: enforcing the expiry protects nothing, while a server clock that is off by more than the TTL
// (common on laptops/WSL) makes the rig silently ignore EVERY command. Leave it 0 unless both clocks are NTP-synced.
#ifndef ENFORCE_COMMAND_EXPIRY
#define ENFORCE_COMMAND_EXPIRY 0
#endif
const unsigned long MQTT_RETRY_MS       = 5000;

// ===================== Actuators =====================
enum ActuatorIndex : uint8_t { IDX_CIRCULATION = 0, IDX_PH_DOWN, IDX_NUTRIENT_A, IDX_NUTRIENT_B, ACTUATOR_COUNT };

struct Actuator {
  const char*   name;
  uint8_t       pin;
  bool          latching;     // true: may stay on until an explicit OFF (circulation pump)
  bool          on;
  unsigned long startedAt;
  unsigned long durationMs;   // 0 = no timeout
};

Actuator actuators[ACTUATOR_COUNT] = {
  {"CIRCULATION_PUMP", 5,  true,  false, 0, 0},
  {"PH_DOWN",          4,  false, false, 0, 0},
  {"NUTRIENT_A",       14, false, false, 0, 0},
  {"NUTRIENT_B",       12, false, false, 0, 0},
};

// ===================== State =====================
WiFiClient   espClient;
PubSubClient client(espClient);

char topicCommand[80];
char topicStatus[80];

String        lastCommandId   = "";
bool          statusDirty     = true;
bool          failsafeFired   = false;
unsigned long lastRecheckMs   = 0;
unsigned long lastMqttAttempt = 0;
unsigned long mqttDownSince   = 0;
uint32_t      mqttConnectCount = 0;   // successful MQTT connects since boot (reconnects = this - 1)

// ===================== Actuator control =====================
int findActuator(const char* name) {
  for (uint8_t i = 0; i < ACTUATOR_COUNT; i++) {
    if (strcmp(actuators[i].name, name) == 0) return i;
  }
  return -1;
}

void setActuator(uint8_t i, bool on, uint32_t durationMs) {
  Actuator& a = actuators[i];
  a.on = on;
  a.startedAt = millis();
  a.durationMs = on ? durationMs : 0;
  digitalWrite(a.pin, on ? HIGH : LOW);
  statusDirty = true;
  Serial.printf("[ACT] %s -> %s", a.name, on ? "ON" : "OFF");
  if (on && durationMs > 0) Serial.printf(" (%u ms)", (unsigned)durationMs);
  Serial.println();
}

void stopAll() {
  for (uint8_t i = 0; i < ACTUATOR_COUNT; i++) {
    if (actuators[i].on) setActuator(i, false, 0);
  }
}

// Non-blocking timeouts: called every loop() iteration
void updateActuators() {
  const unsigned long now = millis();
  for (uint8_t i = 0; i < ACTUATOR_COUNT; i++) {
    Actuator& a = actuators[i];
    if (a.on && a.durationMs > 0 && now - a.startedAt >= a.durationMs) {
      setActuator(i, false, 0);
    }
  }
}

// ===================== Status =====================
bool publishStatus() {
  if (!client.connected()) return false;

  JsonDocument doc;
  doc["online"] = true;
  doc["rig"] = RIG_ID;
  doc["uptime_ms"] = millis();
  doc["rssi"] = WiFi.RSSI();   // weak WiFi (below about -75 dBm) is a classic cause of late or missed commands
  doc["reconnects"] = mqttConnectCount > 0 ? mqttConnectCount - 1 : 0;
  JsonObject acts = doc["actuators"].to<JsonObject>();
  for (uint8_t i = 0; i < ACTUATOR_COUNT; i++) acts[actuators[i].name] = actuators[i].on;

  char buf[320];
  serializeJson(doc, buf, sizeof(buf));
  const bool ok = client.publish(topicStatus, buf, true);   // retained
  if (ok) statusDirty = false;
  return ok;
}

// ===================== Onboard LED + periodic recheck =====================
// The LED is active-low on ESP8266.
//   solid ON  = WiFi is down
//   1 blink   = recheck ran, WiFi and broker are fine, heartbeat sent
//   3 blinks  = recheck ran, WiFi is up but the broker is unreachable
// Blinking is a tiny state machine driven from loop(), so it never blocks.
uint8_t       blinkPulsesLeft = 0;
bool          blinkLedOn      = false;
unsigned long blinkChangedAt  = 0;

void startBlink(uint8_t pulses) {
  blinkPulsesLeft = pulses;
  blinkLedOn = false;
  blinkChangedAt = millis() - BLINK_GAP_MS;   // first pulse starts immediately
}

void updateStatusLed() {
  if (WiFi.status() != WL_CONNECTED) {
    blinkPulsesLeft = 0;
    digitalWrite(LED_BUILTIN, LOW);           // solid ON while WiFi is down
    return;
  }

  const unsigned long now = millis();
  if (blinkPulsesLeft > 0) {
    if (!blinkLedOn && now - blinkChangedAt >= BLINK_GAP_MS) {
      blinkLedOn = true;
      blinkChangedAt = now;
      digitalWrite(LED_BUILTIN, LOW);         // LED on
    } else if (blinkLedOn && now - blinkChangedAt >= BLINK_ON_MS) {
      blinkLedOn = false;
      blinkChangedAt = now;
      digitalWrite(LED_BUILTIN, HIGH);        // LED off
      blinkPulsesLeft--;
    }
    return;
  }
  digitalWrite(LED_BUILTIN, HIGH);            // idle: off
}

// Runs every RECHECK_INTERVAL_MS: confirm the node is really online, prove it to the backend, show it on the LED.
void recheckNode() {
  const bool wifiOk = WiFi.status() == WL_CONNECTED;
  bool heartbeatSent = false;

  if (wifiOk && client.connected()) {
    heartbeatSent = publishStatus();          // the backend marks the rig offline if these stop arriving
  } else if (wifiOk) {
    lastMqttAttempt = 0;                      // broker link is down: retry now instead of waiting for the next retry slot
  }

  Serial.printf("[RECHECK] WiFi %s (%d dBm) | MQTT %s | heartbeat %s | reconnects %lu | uptime %lus\n",
                wifiOk ? "ok" : "DOWN",
                (int)WiFi.RSSI(),
                client.connected() ? "ok" : "DOWN",
                heartbeatSent ? "sent" : "not sent",
                (unsigned long)(mqttConnectCount > 0 ? mqttConnectCount - 1 : 0),
                millis() / 1000);

  if (wifiOk) startBlink(heartbeatSent ? 1 : 3);   // WiFi down is shown by the solid LED instead
}

// ===================== Command handling =====================
void handleCommand(const char* payload, unsigned int length) {
  JsonDocument doc;
  if (deserializeJson(doc, payload, length)) {
    Serial.println("[CMD] Ignored: bad JSON");
    return;
  }

  String commandId = doc["command_id"] | "";
  if (commandId.length() && commandId == lastCommandId) {
    Serial.println("[CMD] Ignored: duplicate command_id");
    return;
  }

  // Command age check (needs an NTP-synced rig clock AND a correct server clock; see ENFORCE_COMMAND_EXPIRY)
  int64_t expiresAt = doc["expires_at"].as<int64_t>();
  time_t nowSec = time(nullptr);
  if (expiresAt > 0 && nowSec > 1700000000) {
    int64_t lateByMs = (int64_t)nowSec * 1000 - expiresAt;   // > 0 means the command is already past its expiry
    if (lateByMs > 0) {
      const long shown = lateByMs > 2000000000LL ? 2000000000L : (long)lateByMs;
#if ENFORCE_COMMAND_EXPIRY
      Serial.printf("[CMD] Ignored: command expired %ld ms ago (server and rig clocks may disagree)\n", shown);
      return;
#else
      Serial.printf("[CMD] WARNING: command is %ld ms past its expiry. Executing anyway. A large value means the server clock and the rig clock disagree.\n", shown);
#endif
    }
  }

  const char* type = doc["type"] | "";

  if (strcmp(type, "STOP_ALL") == 0) {
    lastCommandId = commandId;
    Serial.println("[CMD] STOP_ALL");
    stopAll();
    return;
  }

  if (strcmp(type, "SET") == 0) {
    const char* name  = doc["actuator"] | "";
    const char* state = doc["state"] | "";
    int idx = findActuator(name);
    if (idx < 0) {
      Serial.printf("[CMD] Ignored: unknown actuator '%s'\n", name);
      return;
    }

    if (strcmp(state, "OFF") == 0) {
      lastCommandId = commandId;
      setActuator(idx, false, 0);
      return;
    }

    if (strcmp(state, "ON") == 0) {
      uint32_t durationMs = doc["duration_ms"] | 0;
      if (durationMs > MAX_PULSE_MS) durationMs = MAX_PULSE_MS;
      // Dosing LEDs must always be timed; only the circulation pump may latch on.
      if (!actuators[idx].latching && durationMs == 0) durationMs = DEFAULT_PULSE_MS;
      lastCommandId = commandId;
      setActuator(idx, true, durationMs);
      return;
    }

    Serial.printf("[CMD] Ignored: unknown state '%s'\n", state);
    return;
  }

  Serial.printf("[CMD] Ignored: unknown type '%s'\n", type);
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  if (strcmp(topic, topicCommand) == 0) handleCommand((const char*)payload, length);
}

// ===================== Connectivity =====================
void connectWifiBlocking() {
  WiFi.mode(WIFI_STA);
  WiFi.setSleepMode(WIFI_NONE_SLEEP);   // the default modem-sleep dozes the radio between beacons: commands arrive 100-300+ ms late or are missed
  WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.printf("[WiFi] Connecting to %s", WIFI_SSID);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    delay(250);
    Serial.print(".");
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WiFi] Connected, IP %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n[WiFi] Not connected yet; the core keeps retrying in the background");
  }
}

// Non-blocking beyond PubSubClient's short socket timeout; retries every MQTT_RETRY_MS
void ensureMqtt() {
  if (client.connected()) {
    mqttDownSince = 0;
    failsafeFired = false;
    return;
  }

  if (mqttDownSince == 0) mqttDownSince = millis();

  if (WiFi.status() != WL_CONNECTED) return;
  if (millis() - lastMqttAttempt < MQTT_RETRY_MS) return;
  lastMqttAttempt = millis();

  String clientId = String("playground-") + RIG_ID + "-" + String(ESP.getChipId(), HEX);
  const char* willMessage = "{\"online\":false}";

  Serial.printf("[MQTT] Connecting to %s:%u... ", MQTT_HOST, MQTT_PORT);
  bool ok = strlen(MQTT_USER)
              ? client.connect(clientId.c_str(), MQTT_USER, MQTT_PASS, topicStatus, 1, true, willMessage)
              : client.connect(clientId.c_str(), topicStatus, 1, true, willMessage);

  if (ok) {
    Serial.println("connected");
    mqttConnectCount++;
    client.subscribe(topicCommand, 1);
    Serial.printf("[MQTT] Subscribed to %s\n", topicCommand);
    statusDirty = true;
  } else {
    Serial.printf("failed, rc=%d\n", client.state());
  }
}

// If the broker link is lost for too long, nothing may stay energised.
void checkFailsafe() {
  if (mqttDownSince != 0 && !failsafeFired && millis() - mqttDownSince >= COMMS_FAILSAFE_MS) {
    Serial.println("[FAILSAFE] MQTT down too long: stopping all actuators");
    stopAll();
    failsafeFired = true;
  }
}

// ===================== Arduino entry points =====================
void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.println("\n[BOOT] Hydroponics playground rig (ESP8266)");

  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);   // on until WiFi is up
  for (uint8_t i = 0; i < ACTUATOR_COUNT; i++) {
    pinMode(actuators[i].pin, OUTPUT);
    digitalWrite(actuators[i].pin, LOW);
  }

  snprintf(topicCommand, sizeof(topicCommand), "%s/%s/cmd",    TOPIC_PREFIX, RIG_ID);
  snprintf(topicStatus,  sizeof(topicStatus),  "%s/%s/status", TOPIC_PREFIX, RIG_ID);

  connectWifiBlocking();
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");

  client.setServer(MQTT_HOST, MQTT_PORT);
  client.setBufferSize(512);
  client.setSocketTimeout(3);
  client.setKeepAlive(MQTT_KEEPALIVE_S);
  client.setCallback(mqttCallback);
}

void loop() {
  updateStatusLed();     // solid ON = no WiFi, short blinks = recheck results

  updateActuators();     // non-blocking pulse timeouts
  ensureMqtt();
  if (client.connected()) client.loop();
  checkFailsafe();

  const unsigned long now = millis();
  if (now - lastRecheckMs >= RECHECK_INTERVAL_MS) {
    lastRecheckMs = now;
    recheckNode();                              // every 10 s: verify, heartbeat, blink
  }
  if (client.connected() && statusDirty) publishStatus();   // push actuator changes immediately
}
