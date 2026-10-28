#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <math.h>
#include <time.h>

// ===================== Network & MQTT Credentials =====================
#define WIFI_SSID       "Realme S"
#define WIFI_PASSWORD   "1234567891"

#define MQTT_BROKER     "10.120.254.52"
#define MQTT_PORT       1883
#define MQTT_USERNAME   ""
#define MQTT_PASSWORD   ""
#define DEVICE_ID       "esp32_node_01"

// MQTT Topics
#define MQTT_COMMAND_TOPIC   "hydro/esp32_node_01/commands"
#define MQTT_TELEMETRY_TOPIC "hydro/esp32_node_01/telemetry"
#define MQTT_CIRC_SET_TOPIC  "hydro/esp32_node_01/circulation/set"

// ===================== Hardware Pin Configuration =====================
const int PH_PIN           = 34; // ADC1_CH6
const int TDS_PIN          = 35; // ADC1_CH7
const int MQ2_PIN          = 32; // ADC1_CH4
const int DHT_PIN          = 4;  // DHT11 Data line
#define DHT_TYPE DHT11

const int TRIG_PIN         = 18;
const int ECHO_PIN         = 19; // HC-SR04 ECHO via voltage divider to <=3.3V

const int LED_POWER_GREEN  = 2;
const int LED_ERROR_YELLOW = 23;
const int LED_WIFI_GOLDEN  = 5;

const float TANK_DEPTH_CM  = 20.0;
const int MQ2_RAW_ALERT_THRESHOLD = 1800;

// Relay Mapping (Active-LOW)
const int RELAY_CIRC       = 25; // CH1: Circulation
const int RELAY_A          = 26; // CH2: Nutrient A
const int RELAY_B          = 27; // CH3: Nutrient B
const int RELAY_PH         = 33; // CH4: pH Down

const int RELAY_ON         = LOW;
const int RELAY_OFF        = HIGH;

// ===================== Object Instances =====================
WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);
LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(DHT_PIN, DHT_TYPE);

// ===================== System State Variables =====================
String mode = "MANUAL";
bool manualCirc = false, manualA = false, manualB = false, manualPH = false;
bool outCirc = false, outA = false, outB = false, outPH = false;

// Circulation duty-cycle scheduler
String circMode = "CONTINUOUS"; // "CONTINUOUS", "INTERVAL", "OFF"
unsigned long circRunMs = 15 * 60 * 1000UL;
unsigned long circRestMs = 15 * 60 * 1000UL;
unsigned long circPhaseStartMs = 0;
bool circIntervalState = true; // true = running, false = resting

float targetPH = 6.0, targetTDS = 900.0;
float phValue = NAN, tdsValue = NAN, ecValue = NAN;
float temperatureC = NAN, humidityPct = NAN;
float waterDistanceCm = NAN, waterLevelPct = NAN, mq2Raw = NAN;
bool sensorValid = false, dhtValid = false, levelValid = false, gasAlert = false;

unsigned long lastSensorMs = 0, lastWriteMs = 0, lastLcdMs = 0;
const unsigned long SENSOR_INTERVAL    = 2000;
const unsigned long TELEMETRY_INTERVAL = 10000;

// Sensor calibration points
const float PH4_V = 1.50;
const float PH7_V = 2.00;
const float PH9_V = 2.50;
float tdsCalibration = 1.0;

// Dosing Safeguards & State Machine
enum DoseState { DOSE_IDLE, DOSE_RUNNING, DOSE_MIXING };
DoseState doseState = DOSE_IDLE;
int doseChannel = 0;
unsigned long doseStartMs = 0, mixStartMs = 0, lastDoseMs = 0;

const unsigned long DOSE_PULSE_MS      = 500;
const unsigned long MIXING_MS          = 60000;
const unsigned long DOSE_LOCKOUT_MS    = 60000;
const unsigned long MAX_DOSES_PER_HOUR = 6;
const uint32_t MAX_PUMP_COMMAND_MS     = 10000;

unsigned long commandedDoseDurationMs  = DOSE_PULSE_MS;
unsigned long doseTimes[6]             = {0, 0, 0, 0, 0, 0};
int doseIndex = 0;
String lastCommandId = "";
bool backendCommandMode = false;

// ===================== Actuator Helpers =====================
void relayWrite(int pin, bool on) {
  digitalWrite(pin, on ? RELAY_ON : RELAY_OFF);
}

void allChemicalPumpsOff() {
  outA = outB = outPH = false;
  relayWrite(RELAY_A, false);
  relayWrite(RELAY_B, false);
  relayWrite(RELAY_PH, false);
}

bool dosingAllowed() {
  unsigned long now = millis();
  int count = 0;
  for (int i = 0; i < 6; i++) {
    if (doseTimes[i] != 0 && now - doseTimes[i] < 3600000UL) count++;
  }
  return count < MAX_DOSES_PER_HOUR &&
         (lastDoseMs == 0 || now - lastDoseMs >= DOSE_LOCKOUT_MS);
}

void beginDose(int channel, uint32_t durationMs = DOSE_PULSE_MS) {
  if (!dosingAllowed()) return;
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

  doseTimes[doseIndex] = millis();
  doseIndex = (doseIndex + 1) % 6;
  lastDoseMs = millis();
}

// Circulation duty-cycle scheduler with chemical dosing override
void updateCirculationSchedule() {
  // SAFETY LOCK: Circulation must run while chemical dosing or mixing is active
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
      }
    } else {
      if (elapsed >= circRestMs) {
        circIntervalState = true;
        circPhaseStartMs = now;
      }
    }

    outCirc = circIntervalState;
    relayWrite(RELAY_CIRC, outCirc);
  }
}

void applyOutputs() {
  if (mode == "MANUAL") {
    outA = manualA; outB = manualB; outPH = manualPH;
    relayWrite(RELAY_A, outA);
    relayWrite(RELAY_B, outB);
    relayWrite(RELAY_PH, outPH);
  } else {
    relayWrite(RELAY_A, outA);
    relayWrite(RELAY_B, outB);
    relayWrite(RELAY_PH, outPH);
  }
}

void runAutoControl() {
  unsigned long now = millis();

  if (!sensorValid || !levelValid || waterLevelPct < 15.0) {
    allChemicalPumpsOff();
    return;
  }

  if (doseState == DOSE_RUNNING) {
    if (now - doseStartMs >= commandedDoseDurationMs) {
      allChemicalPumpsOff();
      doseState = DOSE_MIXING;
      mixStartMs = now;
      commandedDoseDurationMs = DOSE_PULSE_MS;
    }
    return;
  }

  if (doseState == DOSE_MIXING) {
    if (now - mixStartMs < MIXING_MS) return;
    doseState = DOSE_IDLE;
    backendCommandMode = false;
  }

  if (backendCommandMode) return;

  if (phValue < 3.0 || phValue > 10.0 || tdsValue < 0 || tdsValue > 5000) {
    allChemicalPumpsOff();
    return;
  }
  if (!dosingAllowed()) return;

  if (phValue > targetPH + 0.3) {
    beginDose(3, DOSE_PULSE_MS);
    return;
  }

  if (tdsValue < targetTDS - 100) {
    static bool nextA = true;
    beginDose(nextA ? 1 : 2, DOSE_PULSE_MS);
    nextA = !nextA;
  }
}

// ===================== Sensor Acquisition =====================
float readVoltage(int pin) {
  uint32_t total = 0;
  for (int i = 0; i < 10; i++) {
    total += analogRead(pin);
    delayMicroseconds(300);
  }
  return ((total / 10.0) / 4095.0) * 3.3;
}

float readUltrasonicCm() {
  digitalWrite(TRIG_PIN, LOW); delayMicroseconds(3);
  digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  unsigned long duration = pulseIn(ECHO_PIN, HIGH, 25000);
  if (duration == 0) return NAN;
  return duration * 0.0343 / 2.0;
}

float calculatePH(float voltage) {
  if (voltage <= PH7_V)
    return 4.0 + (voltage - PH4_V) * 3.0 / (PH7_V - PH4_V);
  return 7.0 + (voltage - PH7_V) * 2.0 / (PH9_V - PH7_V);
}

void readSensors() {
  float phVoltage = readVoltage(PH_PIN);
  float tdsVoltage = readVoltage(TDS_PIN);
  phValue = calculatePH(phVoltage);

  float rawTDS = (133.42 * pow(tdsVoltage, 3)
                - 255.86 * pow(tdsVoltage, 2)
                + 857.39 * tdsVoltage) * 0.5;
  tdsValue = rawTDS * tdsCalibration;
  ecValue = tdsValue / 500.0;

  temperatureC = dht.readTemperature();
  humidityPct  = dht.readHumidity();
  dhtValid = isfinite(temperatureC) && isfinite(humidityPct) &&
             temperatureC >= -10 && temperatureC <= 70 &&
             humidityPct >= 0 && humidityPct <= 100;

  waterDistanceCm = readUltrasonicCm();
  levelValid = isfinite(waterDistanceCm) && waterDistanceCm >= 2.0 &&
               waterDistanceCm <= TANK_DEPTH_CM + 5.0;
  if (levelValid) {
    waterLevelPct = 100.0 * (TANK_DEPTH_CM - constrain(waterDistanceCm, 0.0, TANK_DEPTH_CM)) / TANK_DEPTH_CM;
    waterLevelPct = constrain(waterLevelPct, 0.0, 100.0);
  } else {
    waterLevelPct = NAN;
  }

  mq2Raw = analogRead(MQ2_PIN);
  gasAlert = isfinite(mq2Raw) && mq2Raw >= MQ2_RAW_ALERT_THRESHOLD;

  sensorValid = isfinite(phValue) && isfinite(tdsValue) &&
                phVoltage >= 0.10 && phVoltage <= 3.20 &&
                tdsVoltage >= 0.00 && tdsVoltage <= 3.20 &&
                phValue >= 0.0 && phValue <= 14.0 &&
                tdsValue >= 0.0 && tdsValue <= 5000.0;

  Serial.printf("pH=%.2f, EC=%.2f mS/cm, Temp=%.1fC, RH=%.1f%%, Level=%.1f%%, Gas=%s\n",
                phValue, ecValue, temperatureC, humidityPct,
                waterLevelPct, gasAlert ? "ALERT" : "OK");
}

// ===================== MQTT Logic =====================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  // 1. Circulation Schedule Route
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

    Serial.printf("[CIRC MQTT] Set mode=%s, run=%lu min, rest=%lu min\n",
                  circMode.c_str(), runMin, restMin);
    return;
  }

  // 2. Pump Actuation Commands Route
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

  int64_t expiresAt = json["expires_at"] | int64_t(0);
  time_t nowSec = time(nullptr);
  if (expiresAt > 0 && nowSec > 1700000000 && static_cast<int64_t>(nowSec) * 1000 > expiresAt) {
    Serial.println("[CMD] Ignored: command expired");
    return;
  }

  if (strcmp(command, "STOP_ALL_PUMPS") == 0) {
    lastCommandId = commandId;
    mode = "MANUAL";
    backendCommandMode = false;
    doseState = DOSE_IDLE;
    commandedDoseDurationMs = DOSE_PULSE_MS;

    manualCirc = manualA = manualB = manualPH = false;
    allChemicalPumpsOff();
    relayWrite(RELAY_CIRC, false);
    Serial.println("[CMD] STOP_ALL_PUMPS executed");
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

    mode = "AUTO";
    backendCommandMode = true;
    beginDose(channel, durationMs);
    lastCommandId = commandId;

    Serial.printf("[CMD] %s active for %u ms\n", pump, (unsigned)durationMs);
    return;
  }
}

void reconnectMQTT() {
  static unsigned long lastAttemptMs = 0;
  if (WiFi.status() != WL_CONNECTED || mqtt.connected()) return;
  if (millis() - lastAttemptMs < 5000UL) return;
  lastAttemptMs = millis();

  Serial.print("Connecting to MQTT broker...");
  String clientId = String(DEVICE_ID) + "-" + String((uint32_t)(ESP.getEfuseMac() >> 24), HEX);
  bool connected = strlen(MQTT_USERNAME) > 0
    ? mqtt.connect(clientId.c_str(), MQTT_USERNAME, MQTT_PASSWORD)
    : mqtt.connect(clientId.c_str());

  if (connected) {
    Serial.println(" connected");
    mqtt.subscribe(MQTT_COMMAND_TOPIC, 1);
    mqtt.subscribe(MQTT_CIRC_SET_TOPIC, 1);
  } else {
    Serial.printf(" failed, rc=%d\n", mqtt.state());
  }
}

void publishTelemetry() {
  if (!mqtt.connected()) return;

  if (!sensorValid || !levelValid || !dhtValid) {
    Serial.printf("[TELEMETRY] Skipping: sensorValid=%d, levelValid=%d, dhtValid=%d\n",
                  sensorValid, levelValid, dhtValid);
    return;
  }

  JsonDocument doc;
  doc["device_id"] = DEVICE_ID;
  JsonObject s = doc["sensors"].to<JsonObject>();
  s["ph"]              = round(phValue * 100.0f) / 100.0f;
  s["ec_ms_cm"]        = round(ecValue * 100.0f) / 100.0f;
  s["water_temp_c"]    = round(temperatureC * 10.0f) / 10.0f;
  s["air_temp_c"]      = round(temperatureC * 10.0f) / 10.0f;
  s["humidity_pct"]    = round(humidityPct * 10.0f) / 10.0f;
  s["water_level_pct"] = round(waterLevelPct * 10.0f) / 10.0f;

  char buffer[384];
  size_t len = serializeJson(doc, buffer, sizeof(buffer));
  mqtt.publish(MQTT_TELEMETRY_TOPIC, buffer, len);
}

// ===================== UI & LCD =====================
void updateLCD() {
  static uint8_t page = 0;
  static unsigned long lastPageChange = 0;
  const unsigned long PAGE_INTERVAL_MS = 3000;
  unsigned long now = millis();

  if (now - lastPageChange >= PAGE_INTERVAL_MS) {
    lastPageChange = now;
    page = (page + 1) % 6;
  }

  lcd.clear();
  switch (page) {
    case 0:
      lcd.setCursor(0, 0); lcd.print("pH: ");
      if (sensorValid) lcd.print(phValue, 2); else lcd.print("ERR");
      lcd.setCursor(0, 1); lcd.print("EC: ");
      if (sensorValid) { lcd.print(ecValue, 2); lcd.print("mS/cm"); }
      else lcd.print("ERR");
      break;

    case 1:
      lcd.setCursor(0, 0); lcd.print("Temp: ");
      if (dhtValid) { lcd.print(temperatureC, 1); lcd.print((char)223); lcd.print("C"); }
      else lcd.print("ERR");
      lcd.setCursor(0, 1); lcd.print("Humidity: ");
      if (dhtValid) { lcd.print(humidityPct, 0); lcd.print("%"); }
      else lcd.print("--");
      break;

    case 2:
      lcd.setCursor(0, 0); lcd.print("Water Level:");
      lcd.setCursor(0, 1);
      if (levelValid) {
        lcd.print(waterLevelPct, 0); lcd.print("% Dist:");
        lcd.print(waterDistanceCm, 1); lcd.print("cm");
      } else lcd.print("Level ERR");
      break;

    case 3:
      lcd.setCursor(0, 0); lcd.print("MQ2 Raw: ");
      if (isfinite(mq2Raw)) lcd.print((int)mq2Raw); else lcd.print("ERR");
      lcd.setCursor(0, 1); lcd.print("Gas: ");
      lcd.print(gasAlert ? "ALERT!" : "Safe");
      break;

    case 4:
      lcd.setCursor(0, 0); lcd.print("Circ: "); lcd.print(circMode);
      lcd.setCursor(0, 1);
      lcd.print("W"); lcd.print(outCirc ? "1" : "0");
      lcd.print(" A"); lcd.print(outA ? "1" : "0");
      lcd.print(" B"); lcd.print(outB ? "1" : "0");
      lcd.print(" P"); lcd.print(outPH ? "1" : "0");
      break;

    case 5:
      lcd.setCursor(0, 0); lcd.print("Target pH: "); lcd.print(targetPH, 1);
      lcd.setCursor(0, 1); lcd.print("Target TDS:"); lcd.print((int)targetTDS);
      break;
  }
}

void updateIndicators() {
  digitalWrite(LED_POWER_GREEN, HIGH);
  digitalWrite(LED_WIFI_GOLDEN, WiFi.status() == WL_CONNECTED ? HIGH : LOW);
  bool error = !sensorValid || !dhtValid || !levelValid || gasAlert ||
               (mode == "AUTO" && levelValid && waterLevelPct < 15.0);
  digitalWrite(LED_ERROR_YELLOW, error ? HIGH : LOW);
}

// ===================== Setup & Loop =====================
void setup() {
  Serial.begin(115200);

  pinMode(RELAY_CIRC, OUTPUT); pinMode(RELAY_A, OUTPUT);
  pinMode(RELAY_B, OUTPUT);    pinMode(RELAY_PH, OUTPUT);
  pinMode(LED_POWER_GREEN, OUTPUT);
  pinMode(LED_ERROR_YELLOW, OUTPUT);
  pinMode(LED_WIFI_GOLDEN, OUTPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  allChemicalPumpsOff();
  relayWrite(RELAY_CIRC, false);

  analogReadResolution(12);
  analogSetPinAttenuation(PH_PIN, ADC_11db);
  analogSetPinAttenuation(TDS_PIN, ADC_11db);
  analogSetPinAttenuation(MQ2_PIN, ADC_11db);

  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  dht.begin();
  lcd.print("Hydroponic Node");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting Wi-Fi");
  unsigned long started = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - started < 15000) {
    digitalWrite(LED_WIFI_GOLDEN, !digitalRead(LED_WIFI_GOLDEN));
    delay(250); Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(LED_WIFI_GOLDEN, HIGH);
    configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  }

  mqtt.setServer(MQTT_BROKER, MQTT_PORT);
  mqtt.setCallback(mqttCallback);
  mqtt.setBufferSize(512);
}

void loop() {
  unsigned long now = millis();

  if (now - lastSensorMs >= SENSOR_INTERVAL) {
    lastSensorMs = now;
    readSensors();
    updateIndicators();
  }

  if (WiFi.status() == WL_CONNECTED) {
    if (!mqtt.connected()) reconnectMQTT();
    mqtt.loop();
  }

  updateCirculationSchedule();

  if (mode == "AUTO") runAutoControl();
  applyOutputs();

  if (now - lastLcdMs >= 3000) {
    lastLcdMs = now;
    updateLCD();
  }

  if (now - lastWriteMs >= TELEMETRY_INTERVAL) {
    lastWriteMs = now;
    publishTelemetry();
  }

  delay(1);
}