#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ===================== Network & MQTT Credentials =====================
#define WIFI_SSID       "Realme S"
#define WIFI_PASSWORD   "1234567891"

#define MQTT_BROKER     "10.120.254.52"
#define MQTT_PORT       1883
#define MQTT_USERNAME   ""
#define MQTT_PASSWORD   ""
#define DEVICE_ID       "esp32_node_01" // Keep device ID identical to match backend DB

// MQTT Topics
#define MQTT_COMMAND_TOPIC   "hydro/esp32_node_01/commands"
#define MQTT_TELEMETRY_TOPIC "hydro/esp32_node_01/telemetry"
#define MQTT_CIRC_SET_TOPIC  "hydro/esp32_node_01/circulation/set"

// ===================== ESP8266 Pin Configuration =====================
const uint8_t RELAY_CIRC = 5;   // D1 (GPIO 5)
const uint8_t RELAY_A    = 4;   // D2 (GPIO 4)
const uint8_t RELAY_B    = 14;  // D5 (GPIO 14)
const uint8_t RELAY_PH   = 12;  // D6 (GPIO 12)
const uint8_t LED_STATUS = 2;   // D4 (GPIO 2, onboard blue LED, active LOW)

// Relay polarity (Active-LOW for typical 4-channel relay modules)
const int RELAY_ON  = LOW;
const int RELAY_OFF = HIGH;

// ===================== Object Instances =====================
WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

// ===================== Actuator & Dosing State =====================
bool outCirc = false, outA = false, outB = false, outPH = false;

// Circulation duty-cycle scheduler
String circMode = "CONTINUOUS"; // "CONTINUOUS", "INTERVAL", "OFF"
unsigned long circRunMs = 15 * 60 * 1000UL;
unsigned long circRestMs = 15 * 60 * 1000UL;
unsigned long circPhaseStartMs = 0;
bool circIntervalState = true;

// Dosing pulse state machine
enum DoseState { DOSE_IDLE, DOSE_RUNNING, DOSE_MIXING };
DoseState doseState = DOSE_IDLE;
int doseChannel = 0;
unsigned long doseStartMs = 0, mixStartMs = 0;
const unsigned long MIXING_MS = 10000;
unsigned long commandedDoseDurationMs = 500;
const uint32_t MAX_PUMP_COMMAND_MS = 10000;

String lastCommandId = "";
unsigned long lastTelemetryMs = 0;
const unsigned long TELEMETRY_INTERVAL = 10000;

// ===================== Relay Control Helpers =====================
void relayWrite(uint8_t pin, bool on) {
  digitalWrite(pin, on ? RELAY_ON : RELAY_OFF);
}

void allChemicalPumpsOff() {
  outA = outB = outPH = false;
  relayWrite(RELAY_A, false);
  relayWrite(RELAY_B, false);
  relayWrite(RELAY_PH, false);
}

void beginDose(int channel, uint32_t durationMs) {
  allChemicalPumpsOff();
  doseChannel = channel;
  doseStartMs = millis();
  commandedDoseDurationMs = durationMs;
  doseState = DOSE_RUNNING;

  if (channel == 1) { outA = true; relayWrite(RELAY_A, true); }
  if (channel == 2) { outB = true; relayWrite(RELAY_B, true); }
  if (channel == 3) { outPH = true; relayWrite(RELAY_PH, true); }

  outCirc = true;
  relayWrite(RELAY_CIRC, true);
}

void updateCirculationSchedule() {
  if (doseState == DOSE_RUNNING || doseState == DOSE_MIXING) {
    outCirc = true;
    relayWrite(RELAY_CIRC, true);
    return;
  }

  if (circMode == "OFF") {
    outCirc = false;
    relayWrite(RELAY_CIRC, false);
    return;
  }

  if (circMode == "CONTINUOUS") {
    outCirc = true;
    relayWrite(RELAY_CIRC, true);
    return;
  }

  if (circMode == "INTERVAL") {
    unsigned long now = millis();
    unsigned long elapsed = now - circPhaseStartMs;

    if (circIntervalState) {
      if (elapsed >= circRunMs) {
        circIntervalState = false;
        circPhaseStartMs = now;
        Serial.println("[CIRC] Switching to REST phase (OFF)");
      }
    } else {
      if (elapsed >= circRestMs) {
        circIntervalState = true;
        circPhaseStartMs = now;
        Serial.println("[CIRC] Switching to RUN phase (ON)");
      }
    }

    outCirc = circIntervalState;
    relayWrite(RELAY_CIRC, outCirc);
  }
}

void updateDoseStateMachine() {
  unsigned long now = millis();

  if (doseState == DOSE_RUNNING) {
    if (now - doseStartMs >= commandedDoseDurationMs) {
      allChemicalPumpsOff();
      doseState = DOSE_MIXING;
      mixStartMs = now;
      Serial.printf("[DOSE] Pulse ended (%lu ms). Starting mixing phase...\n", commandedDoseDurationMs);
    }
  } else if (doseState == DOSE_MIXING) {
    if (now - mixStartMs >= MIXING_MS) {
      doseState = DOSE_IDLE;
      Serial.println("[DOSE] Mixing complete. Ready for new commands.");
    }
  }
}

// ===================== MQTT Callbacks & Handlers =====================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  if (strcmp(topic, MQTT_CIRC_SET_TOPIC) == 0) {
    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, payload, length);
    if (err) {
      Serial.printf("[CIRC MQTT] Bad JSON: %s\n", err.c_str());
      return;
    }

    const char* newMode = doc["mode"] | "CONTINUOUS";
    circMode = String(newMode);

    unsigned long runMin = doc["run_min"] | 15;
    unsigned long restMin = doc["rest_min"] | 15;

    circRunMs = runMin * 60 * 1000UL;
    circRestMs = restMin * 60 * 1000UL;

    circPhaseStartMs = millis();
    circIntervalState = true;

    Serial.printf("[CIRC MQTT] New Schedule: mode=%s, run=%lu min, rest=%lu min\n",
                  circMode.c_str(), runMin, restMin);
    return;
  }

  if (strcmp(topic, MQTT_COMMAND_TOPIC) != 0) return;

  JsonDocument json;
  DeserializationError err = deserializeJson(json, payload, length);
  if (err) {
    Serial.printf("[CMD] Bad JSON: %s\n", err.c_str());
    return;
  }

  const char* command = json["command"] | "";
  String commandId = json["command_id"] | "";

  if (!commandId.isEmpty() && commandId == lastCommandId) {
    Serial.println("[CMD] Ignored: duplicate command_id");
    return;
  }

  if (strcmp(command, "STOP_ALL_PUMPS") == 0) {
    lastCommandId = commandId;
    doseState = DOSE_IDLE;
    circMode = "OFF";

    allChemicalPumpsOff();
    relayWrite(RELAY_CIRC, false);
    Serial.println("[CMD] STOP_ALL_PUMPS: All relay outputs forced OFF");
    return;
  }

  if (strcmp(command, "RUN_PUMP") == 0) {
    const char* pump = json["pump_type"] | "";
    uint32_t durationMs = json["duration_ms"] | 0;

    if (durationMs > MAX_PUMP_COMMAND_MS) durationMs = MAX_PUMP_COMMAND_MS;
    if (durationMs == 0) return;

    int channel = 0;
    if (strcmp(pump, "NUTRIENT_A") == 0) channel = 1;
    else if (strcmp(pump, "NUTRIENT_B") == 0) channel = 2;
    else if (strcmp(pump, "PH_DOWN") == 0) channel = 3;
    else {
      Serial.printf("[CMD] Ignored: unknown pump '%s'\n", pump);
      return;
    }

    beginDose(channel, durationMs);
    lastCommandId = commandId;

    Serial.printf("[CMD] Executing %s for %u ms (Circulation ON)\n", pump, (unsigned)durationMs);
    return;
  }
}

void reconnectMQTT() {
  static unsigned long lastAttemptMs = 0;
  if (WiFi.status() != WL_CONNECTED || mqtt.connected()) return;
  if (millis() - lastAttemptMs < 5000UL) return;
  lastAttemptMs = millis();

  Serial.print("[MQTT] Connecting to broker...");
  String clientId = String(DEVICE_ID) + "-" + String(ESP.getChipId(), HEX);
  
  bool connected = strlen(MQTT_USERNAME) > 0
    ? mqtt.connect(clientId.c_str(), MQTT_USERNAME, MQTT_PASSWORD)
    : mqtt.connect(clientId.c_str());

  if (connected) {
    Serial.println(" connected");
    mqtt.subscribe(MQTT_COMMAND_TOPIC, 1);
    mqtt.subscribe(MQTT_CIRC_SET_TOPIC, 1);
    digitalWrite(LED_STATUS, LOW);
  } else {
    Serial.printf(" failed, rc=%d\n", mqtt.state());
    digitalWrite(LED_STATUS, HIGH);
  }
}

void publishMockTelemetry() {
  if (!mqtt.connected()) return;

  JsonDocument doc;
  doc["device_id"] = DEVICE_ID;
  
  // Circulation pump state reported at the top level
  doc["circulation_pump_state"] = outCirc ? "ON" : "OFF";

  JsonObject s = doc["sensors"].to<JsonObject>();
  s["ph"]              = 6.50f;
  s["ec_ms_cm"]        = 1.40f;
  s["water_temp_c"]    = 23.5f;
  s["air_temp_c"]      = 25.0f;
  s["humidity_pct"]    = 60.0f;
  s["water_level_pct"] = 80.0f;

  char buffer[384];
  size_t len = serializeJson(doc, buffer, sizeof(buffer));
  mqtt.publish(MQTT_TELEMETRY_TOPIC, buffer, len);
  Serial.printf("[TELEMETRY] Sent heartbeat | circ_pump: %s\n", outCirc ? "ON" : "OFF");
}

// ===================== Setup & Loop =====================
void setup() {
  digitalWrite(RELAY_CIRC, RELAY_OFF);
  digitalWrite(RELAY_A,    RELAY_OFF);
  digitalWrite(RELAY_B,    RELAY_OFF);
  digitalWrite(RELAY_PH,   RELAY_OFF);

  pinMode(RELAY_CIRC, OUTPUT);
  pinMode(RELAY_A,    OUTPUT);
  pinMode(RELAY_B,    OUTPUT);
  pinMode(RELAY_PH,   OUTPUT);
  pinMode(LED_STATUS, OUTPUT);
  digitalWrite(LED_STATUS, HIGH);

  Serial.begin(115200);
  delay(100);
  Serial.println("\n[BOOT] ESP8266 Hydroponics Actuator Node");

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("[WiFi] Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }
  Serial.printf("\n[WiFi] Connected! IP: %s\n", WiFi.localIP().toString().c_str());

  mqtt.setServer(MQTT_BROKER, MQTT_PORT);
  mqtt.setCallback(mqttCallback);
  mqtt.setBufferSize(512);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    if (!mqtt.connected()) reconnectMQTT();
    mqtt.loop();
  }

  updateDoseStateMachine();
  updateCirculationSchedule();

  unsigned long now = millis();
  if (now - lastTelemetryMs >= TELEMETRY_INTERVAL) {
    lastTelemetryMs = now;
    publishMockTelemetry();
  }

  yield();
}