// Hydroponic node: WiFi pairing portal, MQTT telemetry/commands, and real pump outputs.
// Runs on ESP32 or ESP8266 (the board is detected automatically).
//
// Libraries (Library Manager): WiFiManager by tzapu (2.0.x), PubSubClient 2.8+, ArduinoJson 7.x
// Board package: "esp32" by Espressif, or "esp8266" by ESP8266 Community
// ESP8266 only: Tools > Flash Size must include a filesystem, e.g. "4MB (FS:2MB OTA:~1MB)"
//
// ----------------------------------------------------------------------------------------------
// PIN CONFIGURATION (change the numbers in the "Pin configuration" block below if you wire differently)
//
//   Function            ESP8266 (NodeMCU / D1 mini)    ESP32 (DevKit)     Notes
//   ------------------  -----------------------------  -----------------  -------------------------------
//   Circulation pump    GPIO5  (D1)                    GPIO25             latched ON/OFF, no timeout
//   pH Down pump        GPIO4  (D2)                    GPIO26             timed pulse
//   Nutrient A pump     GPIO14 (D5)                    GPIO27             timed pulse
//   Nutrient B pump     GPIO12 (D6)                    GPIO33             timed pulse
//   Re-pair button      GPIO0  (FLASH, D3)             GPIO0 (BOOT)       hold 5 s while running
//   Status LED          GPIO2  (D4, active LOW)        GPIO2 (active HIGH) built in
//
//   Every pump output drives a relay module or MOSFET board, never a pump directly. Give the pumps their own
//   supply and tie its ground to the board's ground. These pins are safe at boot (no strapping pins).
//   Sensors are simulated in this sketch, so no sensor pins are used.
// ----------------------------------------------------------------------------------------------

#if defined(ARDUINO_ARCH_ESP32)
  #include <WiFi.h>
  #define BOARD_NAME "ESP32"
#elif defined(ARDUINO_ARCH_ESP8266)
  #include <ESP8266WiFi.h>
  #define BOARD_NAME "ESP8266"
#else
  #error "This sketch supports ESP32 and ESP8266 boards only"
#endif

#include <WiFiManager.h>
#include <LittleFS.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <time.h>

// ===================== Pin configuration =====================
#ifndef LED_BUILTIN
  #define LED_BUILTIN 2
#endif

#if defined(ARDUINO_ARCH_ESP32)
  const uint8_t PIN_CIRCULATION = 25;
  const uint8_t PIN_PH_DOWN     = 26;
  const uint8_t PIN_NUTRIENT_A  = 27;
  const uint8_t PIN_NUTRIENT_B  = 33;
  const uint8_t BUTTON_PIN      = 0;     // BOOT button
  #define STATUS_LED_ON_LEVEL  HIGH      // ESP32 built-in LED is active HIGH
  #define STATUS_LED_OFF_LEVEL LOW
#else
  const uint8_t PIN_CIRCULATION = 5;     // D1
  const uint8_t PIN_PH_DOWN     = 4;     // D2
  const uint8_t PIN_NUTRIENT_A  = 14;    // D5
  const uint8_t PIN_NUTRIENT_B  = 12;    // D6
  const uint8_t BUTTON_PIN      = 0;     // FLASH button (D3)
  #define STATUS_LED_ON_LEVEL  LOW       // ESP8266 built-in LED is active LOW
  #define STATUS_LED_OFF_LEVEL HIGH
#endif

// Relay polarity. 1 = the relay/driver switches ON when the pin is LOW (the common "low level trigger" 4-channel
// relay boards). 0 = ON when the pin is HIGH (MOSFET modules, "high level trigger" relays).
// !! Get this right BEFORE connecting a pump: test with the pump supply disconnected, or with LEDs, first. !!
#ifndef PUMP_ACTIVE_LOW
  #define PUMP_ACTIVE_LOW 1
#endif

// ===================== Fixed configuration =====================
// Keep this equal to the Device id in your database.
const char* DEVICE_ID = "esp32_node_01";

const char*   AP_NAME         = "Hydro-Setup";   // WiFi network the board creates for pairing
const char*   AP_PASS         = "hydro1234";     // at least 8 characters (use nullptr for an open AP)
const unsigned long BUTTON_HOLD_MS = 5000;       // hold this long while running to re-open the portal
const unsigned long TELEMETRY_INTERVAL_MS = 10000;

// ===================== Settings entered in the portal (saved to flash) =====================
char mqttHost[40] = "192.168.1.100";   // LAN IP of the machine running the broker (NOT localhost)
char mqttPort[6]  = "1883";
char mqttUser[32] = "";
char mqttPass[32] = "";

// ===================== Simulation tuning =====================
const float TICKS_PER_DAY         = 8640.0f;  // 86400 s / 10 s per tick
const float DRIFT_SPEEDUP         = 4.0f;     // 1.0 = realistic; raise to see dosing sooner
const float PH_DRIFT_PER_DAY      = 0.25f;
const float EC_DRIFT_PER_DAY      = -0.20f;
const float WATER_USE_PER_DAY     = 15.0f;
const bool  AUTO_REFILL           = true;
const float REFILL_BELOW_PCT      = 40.0f;
const float REFILL_TO_PCT         = 95.0f;

const float PH_DROP_PER_PUMP_SEC  = 0.04f;
const float EC_RISE_PER_PUMP_SEC  = 0.04f;    // matches the server's EC-rise estimate
const float MIXING_RATE_PER_TICK  = 0.10f;
const uint32_t MAX_PUMP_MS        = 10000;    // hard clamp on any single dosing pulse

// ===================== State =====================
WiFiClient   espClient;
PubSubClient client(espClient);
WiFiManager  wm;

WiFiManagerParameter* pHost;
WiFiManagerParameter* pPort;
WiFiManagerParameter* pUser;
WiFiManagerParameter* pPass;
bool shouldSaveConfig = false;

char topicTelemetry[64];
char topicCommands[64];

uint32_t simSeconds      = 6UL * 3600UL;
float    sim_ph          = 6.2f;
float    sim_ec          = 1.6f;
float    sim_water_level = 95.0f;

float  pendingPhDelta = 0.0f;
float  pendingEcDelta = 0.0f;
String lastCommandId  = "";

unsigned long lastTelemetryMs = 0;
unsigned long lastMqttAttempt = 0;
unsigned long buttonDownSince = 0;
unsigned long wifiLostSince   = 0;

// ===================== Board helpers =====================
String chipIdHex() {
#if defined(ARDUINO_ARCH_ESP32)
  return String((uint32_t)(ESP.getEfuseMac() >> 24), HEX);   // last 3 MAC bytes: unique per board
#else
  return String(ESP.getChipId(), HEX);
#endif
}

// ===================== Status LED =====================
// Solid ON = WiFi not connected. Short blink = telemetry sent.
const unsigned long LED_FLASH_MS = 100;
bool ledFlashing = false;
unsigned long ledFlashStart = 0;

void ledOn()  { digitalWrite(LED_BUILTIN, STATUS_LED_ON_LEVEL); }
void ledOff() { digitalWrite(LED_BUILTIN, STATUS_LED_OFF_LEVEL); }

void flashLed() {
  ledFlashing = true;
  ledFlashStart = millis();
  ledOn();
}

// Call every loop(); never blocks
void updateStatusLed() {
  if (WiFi.status() != WL_CONNECTED) {
    ledFlashing = false;
    ledOn();                       // solid on while disconnected
    return;
  }
  if (ledFlashing && millis() - ledFlashStart >= LED_FLASH_MS) ledFlashing = false;
  if (ledFlashing) ledOn(); else ledOff();
}

// ===================== Pumps =====================
enum PumpIndex : uint8_t { PUMP_CIRCULATION = 0, PUMP_PH_DOWN, PUMP_NUTRIENT_A, PUMP_NUTRIENT_B, PUMP_COUNT };

struct Pump {
  const char*   name;
  uint8_t       pin;
  bool          on;
  unsigned long startedAt;
  unsigned long durationMs;   // 0 = no timeout (circulation pump only)
};

Pump pumps[PUMP_COUNT] = {
  {"CIRCULATION_PUMP", PIN_CIRCULATION, false, 0, 0},
  {"PH_DOWN",          PIN_PH_DOWN,     false, 0, 0},
  {"NUTRIENT_A",       PIN_NUTRIENT_A,  false, 0, 0},
  {"NUTRIENT_B",       PIN_NUTRIENT_B,  false, 0, 0},
};

// Level to put on a pump pin for ON / OFF, honouring the relay polarity
inline int pumpLevel(bool on) { return (on != (bool)PUMP_ACTIVE_LOW) ? HIGH : LOW; }

// Drive every pump pin to OFF *before* making it an output, so the pumps never twitch at boot.
void initPumpPins() {
  for (uint8_t i = 0; i < PUMP_COUNT; i++) {
    digitalWrite(pumps[i].pin, pumpLevel(false));
    pinMode(pumps[i].pin, OUTPUT);
    digitalWrite(pumps[i].pin, pumpLevel(false));
  }
}

void printPinConfig() {
  Serial.printf("[PINS] circulation=GPIO%u ph_down=GPIO%u nutrient_a=GPIO%u nutrient_b=GPIO%u | pump outputs active-%s\n",
                PIN_CIRCULATION, PIN_PH_DOWN, PIN_NUTRIENT_A, PIN_NUTRIENT_B, PUMP_ACTIVE_LOW ? "LOW" : "HIGH");
}

void setPump(uint8_t i, bool on, uint32_t durationMs) {
  Pump& p = pumps[i];
  p.on = on;
  p.startedAt = millis();
  p.durationMs = on ? durationMs : 0;
  digitalWrite(p.pin, pumpLevel(on));
  Serial.printf("[PUMP] %s -> %s", p.name, on ? "ON" : "OFF");
  if (on && durationMs > 0) Serial.printf(" (%u ms)", (unsigned)durationMs);
  Serial.println();
}

// Non-blocking pulse timeouts. Called at the top of every loop() pass, before any early return.
void updatePumps() {
  const unsigned long now = millis();
  for (uint8_t i = 0; i < PUMP_COUNT; i++) {
    Pump& p = pumps[i];
    if (p.on && p.durationMs > 0 && now - p.startedAt >= p.durationMs) setPump(i, false, 0);
  }
}

void stopDosingPumps() {
  for (uint8_t i = 0; i < PUMP_COUNT; i++) {
    if (i != PUMP_CIRCULATION && pumps[i].on) setPump(i, false, 0);
  }
}

void stopAllPumps() {
  stopDosingPumps();
  if (pumps[PUMP_CIRCULATION].on) setPump(PUMP_CIRCULATION, false, 0);
}

// Only the three dosing pumps can be commanded over MQTT; the circulation pump is managed by the node itself.
int dosingPumpIndex(const char* name) {
  for (uint8_t i = 1; i < PUMP_COUNT; i++) {
    if (strcmp(pumps[i].name, name) == 0) return i;
  }
  return -1;
}

// RULE: whenever a dosing command is accepted, the circulation pump must be running so the dose gets mixed in.
void ensureCirculationOn() {
  if (!pumps[PUMP_CIRCULATION].on) {
    setPump(PUMP_CIRCULATION, true, 0);
    Serial.println("[CIRC] Circulation pump was OFF: switched ON for the dosing command");
  }
}

// ===================== Saved settings (LittleFS) =====================
void loadConfig() {
  if (!LittleFS.exists("/config.json")) return;
  File f = LittleFS.open("/config.json", "r");
  if (!f) return;

  JsonDocument doc;
  if (!deserializeJson(doc, f)) {
    strlcpy(mqttHost, doc["host"] | mqttHost, sizeof(mqttHost));
    strlcpy(mqttPort, doc["port"] | mqttPort, sizeof(mqttPort));
    strlcpy(mqttUser, doc["user"] | mqttUser, sizeof(mqttUser));
    strlcpy(mqttPass, doc["pass"] | mqttPass, sizeof(mqttPass));
    Serial.println("[CFG] Loaded saved MQTT settings");
  }
  f.close();
}

void saveConfig() {
  JsonDocument doc;
  doc["host"] = mqttHost;
  doc["port"] = mqttPort;
  doc["user"] = mqttUser;
  doc["pass"] = mqttPass;

  File f = LittleFS.open("/config.json", "w");
  if (!f) {
    Serial.println("[CFG] Failed to open config file for writing");
    return;
  }
  serializeJson(doc, f);
  f.close();
  Serial.println("[CFG] MQTT settings saved");
}

// ===================== WiFi pairing portal =====================
void saveConfigCallback() { shouldSaveConfig = true; }

void apCallback(WiFiManager* mgr) {
  ledOn();   // LED on while the portal is open
  Serial.printf("[WiFi] Portal open. Join '%s' and browse to 192.168.4.1\n", AP_NAME);
}

void refreshParamValues() {
  pHost->setValue(mqttHost, 39);
  pPort->setValue(mqttPort, 5);
  pUser->setValue(mqttUser, 31);
  pPass->setValue(mqttPass, 31);
}

void readParams() {
  strlcpy(mqttHost, pHost->getValue(), sizeof(mqttHost));
  strlcpy(mqttPort, pPort->getValue(), sizeof(mqttPort));
  strlcpy(mqttUser, pUser->getValue(), sizeof(mqttUser));
  strlcpy(mqttPass, pPass->getValue(), sizeof(mqttPass));
  int port = atoi(mqttPort);
  if (port < 1 || port > 65535) strlcpy(mqttPort, "1883", sizeof(mqttPort));
}

void applyMqttConfig() {
  client.disconnect();
  client.setServer(mqttHost, atoi(mqttPort));
  lastMqttAttempt = 0;   // reconnect immediately with the new settings
}

void buildPortal() {
  pHost = new WiFiManagerParameter("host", "MQTT broker host / IP", mqttHost, 39);
  pPort = new WiFiManagerParameter("port", "MQTT port", mqttPort, 5);
  pUser = new WiFiManagerParameter("user", "MQTT username (optional)", mqttUser, 31);
  pPass = new WiFiManagerParameter("pass", "MQTT password (optional)", mqttPass, 31, "type=\"password\"");
  wm.addParameter(pHost);
  wm.addParameter(pPort);
  wm.addParameter(pUser);
  wm.addParameter(pPass);

  wm.setSaveConfigCallback(saveConfigCallback);
  wm.setAPCallback(apCallback);
  wm.setConnectTimeout(20);        // seconds to try saved WiFi before opening the portal
  wm.setConfigPortalTimeout(180);  // portal closes after 3 min so the board can retry saved WiFi
}

// Runs at boot: connects with saved credentials, or opens the pairing portal if none / they fail.
void connectWifiOrPair() {
  if (!wm.autoConnect(AP_NAME, AP_PASS)) {
    Serial.println("[WiFi] Not connected and portal timed out, restarting...");
    delay(1000);
    ESP.restart();
  }
  ledOff();
  readParams();
  if (shouldSaveConfig) {
    saveConfig();
    shouldSaveConfig = false;
  }
  Serial.printf("[WiFi] Connected to '%s', IP %s\n", WiFi.SSID().c_str(), WiFi.localIP().toString().c_str());
}

// Re-open the portal while running (hold the button for 5 s)
void openConfigPortal() {
  Serial.println("[WiFi] Re-pairing requested via button");
  // The portal blocks loop() for up to 3 minutes, so pump timeouts cannot run meanwhile.
  // Stop every timed dosing pump first. The circulation pump has no timeout and keeps running.
  stopDosingPumps();
  refreshParamValues();
  shouldSaveConfig = false;

  bool ok = wm.startConfigPortal(AP_NAME, AP_PASS);
  ledOff();

  if (!ok) {
    Serial.println("[WiFi] Portal ended without a connection, restarting...");
    delay(500);
    ESP.restart();
  }
  readParams();
  if (shouldSaveConfig) {
    saveConfig();
    shouldSaveConfig = false;
  }
  applyMqttConfig();
}

void checkPortalButton() {
  if (digitalRead(BUTTON_PIN) == LOW) {
    if (buttonDownSince == 0) {
      buttonDownSince = millis();
    } else if (millis() - buttonDownSince >= BUTTON_HOLD_MS) {
      buttonDownSince = 0;
      openConfigPortal();
    }
  } else {
    buttonDownSince = 0;
  }
}

// ===================== Command handling =====================
void handleCommand(const char* payload, unsigned int length) {
  JsonDocument doc;
  if (deserializeJson(doc, payload, length)) {
    Serial.println("[CMD] Ignored: bad JSON");
    return;
  }

  const char* command = doc["command"] | "";
  String commandId = doc["command_id"] | "";

  if (commandId.length() && commandId == lastCommandId) {
    Serial.println("[CMD] Ignored: duplicate command_id");
    return;
  }

  int64_t expiresAt = doc["expires_at"].as<int64_t>();
  time_t nowSec = time(nullptr);
  if (expiresAt > 0 && nowSec > 1700000000 && (int64_t)nowSec * 1000 > expiresAt) {
    Serial.println("[CMD] Ignored: command expired");
    return;
  }

  if (strcmp(command, "STOP_ALL_PUMPS") == 0) {
    lastCommandId = commandId;
    Serial.println("[CMD] STOP_ALL_PUMPS received: every pump output OFF");
    stopAllPumps();   // dry-run protection: the circulation pump stops too
    return;
  }

  if (strcmp(command, "RUN_PUMP") == 0) {
    const char* pump = doc["pump_type"] | "";
    uint32_t durationMs = doc["duration_ms"] | 0;
    if (durationMs > MAX_PUMP_MS) durationMs = MAX_PUMP_MS;
    float seconds = durationMs / 1000.0f;

    int idx = dosingPumpIndex(pump);
    if (idx < 0) {
      Serial.printf("[CMD] Ignored: unknown pump '%s'\n", pump);
      return;
    }
    if (durationMs == 0) {
      // A real pump must always be timed, so a missing or zero duration is refused.
      Serial.printf("[CMD] Ignored: %s needs a duration_ms greater than 0\n", pump);
      return;
    }

    // NEW: any accepted dosing command first makes sure the circulation pump is running.
    ensureCirculationOn();

    if (idx == PUMP_PH_DOWN) {
      pendingPhDelta -= PH_DROP_PER_PUMP_SEC * seconds;   // simulated sensor response (unchanged)
    } else {
      pendingEcDelta += EC_RISE_PER_PUMP_SEC * seconds;
    }
    setPump(idx, true, durationMs);

    lastCommandId = commandId;
    Serial.printf("[CMD] %s for %u ms accepted\n", pump, (unsigned)durationMs);
    return;
  }

  Serial.printf("[CMD] Ignored: unknown command '%s'\n", command);
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  if (strcmp(topic, topicCommands) == 0) handleCommand((const char*)payload, length);
}

// ===================== Telemetry generation =====================
void generate24HourTelemetry() {
  simSeconds = (simSeconds + 10) % 86400;

  float dayRadian = (simSeconds / 86400.0f) * 2.0f * PI;
  float solarFlux = sin(dayRadian - (PI / 2.0f));

  float air_temp   = 23.5f + (4.0f * solarFlux);
  float water_temp = 21.0f + (2.0f * solarFlux);
  float humidity   = 65.0f - (15.0f * solarFlux);

  sim_ph += (PH_DRIFT_PER_DAY * DRIFT_SPEEDUP) / TICKS_PER_DAY;
  sim_ec += (EC_DRIFT_PER_DAY * DRIFT_SPEEDUP) / TICKS_PER_DAY;

  float phStep = pendingPhDelta * MIXING_RATE_PER_TICK;
  float ecStep = pendingEcDelta * MIXING_RATE_PER_TICK;
  sim_ph += phStep;  pendingPhDelta -= phStep;
  sim_ec += ecStep;  pendingEcDelta -= ecStep;

  sim_water_level -= WATER_USE_PER_DAY / TICKS_PER_DAY;
  if (AUTO_REFILL && sim_water_level < REFILL_BELOW_PCT) {
    sim_ec *= sim_water_level / REFILL_TO_PCT;
    sim_water_level = REFILL_TO_PCT;
    Serial.println("[SIM] Tank refilled (EC diluted)");
  }

  sim_ph = constrain(sim_ph, 4.0f, 9.0f);
  sim_ec = constrain(sim_ec, 0.05f, 4.0f);
  sim_water_level = constrain(sim_water_level, 0.0f, 100.0f);

  float phNoise = ((rand() % 100) - 50) / 1500.0f;
  float ecNoise = (((rand() % 100) - 50) / 1500.0f) / 2.0f;
  float final_ph = sim_ph + phNoise;
  float final_ec = sim_ec + ecNoise;

  JsonDocument doc;
  doc["device_id"] = DEVICE_ID;
  doc["sim_time_sec"] = simSeconds;
  doc["sensors"]["ph"] = round(final_ph * 100.0f) / 100.0f;
  doc["sensors"]["ec_ms_cm"] = round(final_ec * 100.0f) / 100.0f;
  doc["sensors"]["water_temp_c"] = round(water_temp * 10.0f) / 10.0f;
  doc["sensors"]["air_temp_c"] = round(air_temp * 10.0f) / 10.0f;
  doc["sensors"]["humidity_pct"] = round(humidity * 10.0f) / 10.0f;
  doc["sensors"]["water_level_pct"] = round(sim_water_level * 10.0f) / 10.0f;

  char buffer[256];
  serializeJson(doc, buffer, sizeof(buffer));
  if (client.publish(topicTelemetry, buffer)) {
    flashLed();
  } else {
    Serial.println("[MQTT] Telemetry publish FAILED");
  }

  int hours = simSeconds / 3600;
  int minutes = (simSeconds % 3600) / 60;
  Serial.printf("[%02d:%02d] Telemetry -> pH: %.2f | EC: %.2f | Tank: %.1f%% | Air: %.1f C\n",
                hours, minutes, final_ph, final_ec, sim_water_level, air_temp);
}

// ===================== MQTT connection =====================
bool ensureMqtt() {
  if (client.connected()) return true;
  if (millis() - lastMqttAttempt < 5000) return false;
  lastMqttAttempt = millis();

  String clientId = String(DEVICE_ID) + "-" + chipIdHex();
  Serial.printf("[MQTT] Connecting to %s:%s as %s... ", mqttHost, mqttPort, clientId.c_str());

  bool ok = strlen(mqttUser)
              ? client.connect(clientId.c_str(), mqttUser, mqttPass)
              : client.connect(clientId.c_str());

  if (ok) {
    Serial.println("connected");
    client.subscribe(topicCommands, 1);
    Serial.printf("[MQTT] Subscribed to %s\n", topicCommands);
  } else {
    Serial.printf("failed, rc=%d\n", client.state());
  }
  return ok;
}

// ===================== Arduino entry points =====================
void setup() {
  // Pumps first: make sure nothing can run while the rest of the setup is happening.
  initPumpPins();

  Serial.begin(115200);
  delay(200);
  Serial.printf("\n[BOOT] Hydroponic node (%s, WiFiManager)\n", BOARD_NAME);
  printPinConfig();

  pinMode(LED_BUILTIN, OUTPUT);
  ledOn();                          // no WiFi yet, so solid on until connected
  pinMode(BUTTON_PIN, INPUT_PULLUP);

#if defined(ARDUINO_ARCH_ESP32)
  randomSeed(esp_random());
  if (!LittleFS.begin(true)) Serial.println("[CFG] LittleFS mount failed");
#else
  randomSeed(analogRead(A0));
  if (!LittleFS.begin()) Serial.println("[CFG] LittleFS mount failed (check Flash Size setting)");
#endif
  loadConfig();

  // Telemetry topic is an ASSUMPTION: copy the value from your original sketch if it differs.
  snprintf(topicTelemetry, sizeof(topicTelemetry), "hydro/%s/telemetry", DEVICE_ID);
  snprintf(topicCommands,  sizeof(topicCommands),  "hydro/%s/commands",  DEVICE_ID);

  buildPortal();
  connectWifiOrPair();
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");

  client.setServer(mqttHost, atoi(mqttPort));
  client.setBufferSize(512);
  client.setCallback(mqttCallback);
}

void loop() {
  updateStatusLed();
  updatePumps();          // pulse timeouts must run even when WiFi is down, so this comes before the early return
  checkPortalButton();

  if (WiFi.status() != WL_CONNECTED) {
    // The core auto-reconnects; if it stays down for 2 minutes, restart and retry from scratch
    if (wifiLostSince == 0) wifiLostSince = millis();
    else if (millis() - wifiLostSince > 120000) ESP.restart();
    return;
  }
  wifiLostSince = 0;

  if (ensureMqtt()) client.loop();

  unsigned long now = millis();
  if (client.connected() && now - lastTelemetryMs >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryMs = now;
    generate24HourTelemetry();
  }
}
