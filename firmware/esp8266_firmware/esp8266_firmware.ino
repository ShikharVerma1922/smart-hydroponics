// Hydroponic telemetry simulator for ESP8266 with on-device WiFi pairing (captive portal)
// Libraries (Library Manager): WiFiManager by tzapu (2.0.x), PubSubClient 2.8+, ArduinoJson 7.x
// Board package: "esp8266" by ESP8266 Community
// Arduino IDE: Tools > Flash Size must include a filesystem, e.g. "4MB (FS:2MB OTA:~1MB)"

#include <ESP8266WiFi.h>
#include <WiFiManager.h>
#include <LittleFS.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <time.h>

// ===================== Fixed configuration =====================
// Keep this equal to the Device id in your database, even though this is an ESP8266.
const char* DEVICE_ID = "esp32_node_01";

const char*   AP_NAME         = "Hydro-Setup";   // WiFi network the ESP creates for pairing
const char*   AP_PASS         = "hydro1234";     // at least 8 characters (use nullptr for an open AP)
const uint8_t BUTTON_PIN      = 0;               // FLASH button (GPIO0, "D3" on NodeMCU)
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
const uint32_t MAX_PUMP_MS        = 10000;

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

// ===================== Status LED =====================
// Built-in LED is active-low on ESP8266. Solid ON = WiFi not connected. Short blink = telemetry sent.
const unsigned long LED_FLASH_MS = 100;
bool ledFlashing = false;
unsigned long ledFlashStart = 0;

void ledOn()  { digitalWrite(LED_BUILTIN, LOW); }
void ledOff() { digitalWrite(LED_BUILTIN, HIGH); }

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
  digitalWrite(LED_BUILTIN, LOW);   // LED on (active low) while the portal is open
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
  wm.setConfigPortalTimeout(180);  // portal closes after 3 min so the device can retry saved WiFi
}

// Runs at boot: connects with saved credentials, or opens the pairing portal if none / they fail.
void connectWifiOrPair() {
  if (!wm.autoConnect(AP_NAME, AP_PASS)) {
    Serial.println("[WiFi] Not connected and portal timed out, restarting...");
    delay(1000);
    ESP.restart();
  }
  digitalWrite(LED_BUILTIN, HIGH);
  readParams();
  if (shouldSaveConfig) {
    saveConfig();
    shouldSaveConfig = false;
  }
  Serial.printf("[WiFi] Connected to '%s', IP %s\n", WiFi.SSID().c_str(), WiFi.localIP().toString().c_str());
}

// Re-open the portal while running (hold FLASH for 5 s)
void openConfigPortal() {
  Serial.println("[WiFi] Re-pairing requested via button");
  refreshParamValues();
  shouldSaveConfig = false;

  bool ok = wm.startConfigPortal(AP_NAME, AP_PASS);
  digitalWrite(LED_BUILTIN, HIGH);

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
    Serial.println("[CMD] STOP_ALL_PUMPS received (sim pumps are instantaneous, nothing running)");
    return;
  }

  if (strcmp(command, "RUN_PUMP") == 0) {
    const char* pump = doc["pump_type"] | "";
    uint32_t durationMs = doc["duration_ms"] | 0;
    if (durationMs > MAX_PUMP_MS) durationMs = MAX_PUMP_MS;
    float seconds = durationMs / 1000.0f;

    if (strcmp(pump, "PH_DOWN") == 0) {
      pendingPhDelta -= PH_DROP_PER_PUMP_SEC * seconds;
    } else if (strcmp(pump, "NUTRIENT_A") == 0 || strcmp(pump, "NUTRIENT_B") == 0) {
      pendingEcDelta += EC_RISE_PER_PUMP_SEC * seconds;
    } else {
      Serial.printf("[CMD] Ignored: unknown pump '%s'\n", pump);
      return;
    }

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

  String clientId = String(DEVICE_ID) + "-" + String(ESP.getChipId(), HEX);
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
  Serial.begin(115200);
  delay(200);
  Serial.println("\n[BOOT] Hydroponic simulator (ESP8266, WiFiManager)");

  pinMode(LED_BUILTIN, OUTPUT);
  ledOn();                          // no WiFi yet, so solid on until connected
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  randomSeed(analogRead(A0));

  if (!LittleFS.begin()) Serial.println("[CFG] LittleFS mount failed (check Flash Size setting)");
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
