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
const char*    WIFI_SSID    = "YOUR_WIFI_NAME";
const char*    WIFI_PASS    = "YOUR_WIFI_PASSWORD";
const char*    MQTT_HOST    = "192.168.1.100";   // LAN IP of the broker (NOT localhost)
const uint16_t MQTT_PORT    = 1883;
const char*    MQTT_USER    = "";                // leave empty if the broker has no auth
const char*    MQTT_PASS    = "";

const char*    RIG_ID       = "rig01";           // must match PLAYGROUND_RIG_ID on the backend
const char*    TOPIC_PREFIX = "hydro/playground";// must match PLAYGROUND_TOPIC_PREFIX

const uint32_t MAX_PULSE_MS         = 30000;     // hard clamp for any timed pulse
const uint32_t DEFAULT_PULSE_MS     = 2000;      // used if a dosing ON arrives without a duration
const unsigned long COMMS_FAILSAFE_MS   = 10000; // all LEDs off if MQTT is down this long
const unsigned long STATUS_HEARTBEAT_MS = 15000;
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
unsigned long lastStatusMs    = 0;
unsigned long lastMqttAttempt = 0;
unsigned long mqttDownSince   = 0;

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
void publishStatus() {
  if (!client.connected()) return;

  JsonDocument doc;
  doc["online"] = true;
  doc["rig"] = RIG_ID;
  doc["uptime_ms"] = millis();
  JsonObject acts = doc["actuators"].to<JsonObject>();
  for (uint8_t i = 0; i < ACTUATOR_COUNT; i++) acts[actuators[i].name] = actuators[i].on;

  char buf[320];
  serializeJson(doc, buf, sizeof(buf));
  if (client.publish(topicStatus, buf, true)) {   // retained
    statusDirty = false;
    lastStatusMs = millis();
  }
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

  // Drop stale commands once the clock is synced (NTP)
  int64_t expiresAt = doc["expires_at"].as<int64_t>();
  time_t nowSec = time(nullptr);
  if (expiresAt > 0 && nowSec > 1700000000 && (int64_t)nowSec * 1000 > expiresAt) {
    Serial.println("[CMD] Ignored: command expired");
    return;
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
  client.setCallback(mqttCallback);
}

void loop() {
  digitalWrite(LED_BUILTIN, WiFi.status() == WL_CONNECTED ? HIGH : LOW);

  updateActuators();     // non-blocking pulse timeouts
  ensureMqtt();
  if (client.connected()) client.loop();
  checkFailsafe();

  const unsigned long now = millis();
  if (client.connected() && (statusDirty || now - lastStatusMs >= STATUS_HEARTBEAT_MS)) {
    publishStatus();
  }
}
