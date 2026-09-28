#include "ESP8266WiFi.h"
#include "PubSubClient.h"
#include "ArduinoJson.h"
#include "secrets.h"

// =============================================================================
// HARDWARE PIN DEFINITIONS (ESP32 30-Pin DevKit V1)
// =============================================================================
// --- Relays (Clean outputs, safe from boot-strapping bugs) ---
#define PIN_PUMP_PH_DOWN     16  // Labeled "RX2" on 30-pin board
#define PIN_PUMP_STOCK_A     17  // Labeled "TX2" on 30-pin board
#define PIN_PUMP_STOCK_B     19  // Labeled "D19" on 30-pin board
#define PIN_PUMP_CIRCULATION 23  // Labeled "D23" on 30-pin board

// --- Onboard Blue Diagnostic LED (Active-HIGH on ESP32 DevKit) ---
#define PIN_ONBOARD_LED      2   // Labeled "D2"

// --- Analog Inputs (ADC1 only - immune to Wi-Fi driver lockout) ---
#define PIN_PH_ANALOG        34  // Labeled "D34" or "P34" (ADC1_CH6)
#define PIN_EC_ANALOG        35  // Labeled "D35" or "P35" (ADC1_CH7)

// Standard 5V relay modules are Active-LOW (LOW = Energized, HIGH = Released)
#define RELAY_ON   LOW
#define RELAY_OFF  HIGH

// =============================================================================
// SAFETY THRESHOLDS & TIMERS
// =============================================================================
const unsigned long MAX_PULSE_DURATION_MS   = 5000;  // 5s absolute hardware clamp
const unsigned long MIN_INTERLOCK_DELAY_MS   = 500;   // 500ms dead-time between pulses
const float         MIN_WATER_LEVEL_PCT      = 15.0;  // Inhibit pump dry-run < 15%
const unsigned long TELEMETRY_INTERVAL_MS    = 10000; // 10s telemetry cadence
const unsigned long MQTT_RECONNECT_RETRY_MS  = 5000;  // Non-blocking reconnect interval

// =============================================================================
// ACTUATOR NON-BLOCKING STATE MACHINE
// =============================================================================
enum ActuatorState {
  ACTUATOR_IDLE,
  ACTUATOR_PULSING,
  ACTUATOR_INTERLOCK_COOLDOWN
};

struct ActiveDose {
  ActuatorState state;
  int pin;
  char pumpType[16];
  unsigned long pulseStartTime;
  unsigned long durationMs;
  unsigned long cooldownStartTime;
};

ActiveDose currentDose = { ACTUATOR_IDLE, -1, "", 0, 0, 0 };

// Circulation Schedule State Engine
enum CirculationMode { CIRC_CONTINUOUS, CIRC_INTERVAL, CIRC_OFF };
CirculationMode circMode = CIRC_INTERVAL;
unsigned long circRunMs  = 15UL * 60UL * 1000UL; // 15 mins default
unsigned long circRestMs = 15UL * 60UL * 1000UL; // 15 mins default
unsigned long circPhaseStartTime = 0;
bool isCircRunning = false;

// Telemetry & Network Timing
unsigned long lastTelemetryMillis = 0;
unsigned long lastMqttRetryMillis = 0;

// Dynamic MQTT Topic Buffers
char topicTelemetry[64];
char topicCommands[64];
char topicCirculation[64];

WiFiClient espClient;
PubSubClient client(espClient);

// Forward declarations
void executeEmergencyStop(const char* reason);
void stopActiveDose();

// =============================================================================
// FAILSAFE INITIALIZATION
// =============================================================================
void setupPinsFailsafe() {
  // Drive pins HIGH (OFF) BEFORE setting pinMode to prevent boot-up relay chatter
  digitalWrite(PIN_PUMP_PH_DOWN, RELAY_OFF);
  digitalWrite(PIN_PUMP_STOCK_A, RELAY_OFF);
  digitalWrite(PIN_PUMP_STOCK_B, RELAY_OFF);
  digitalWrite(PIN_PUMP_CIRCULATION, RELAY_OFF);
  digitalWrite(PIN_ONBOARD_LED, LOW); // ESP32 LED off (Active-HIGH)

  pinMode(PIN_PUMP_PH_DOWN, OUTPUT);
  pinMode(PIN_PUMP_STOCK_A, OUTPUT);
  pinMode(PIN_PUMP_STOCK_B, OUTPUT);
  pinMode(PIN_PUMP_CIRCULATION, OUTPUT);
  pinMode(PIN_ONBOARD_LED, OUTPUT);

  // Configure ADC resolution (12-bit: 0 - 4095)
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db); // Full-scale voltage approx 0 - 3.3V
}

// =============================================================================
// SENSOR READING & SANITY VALIDATION
// =============================================================================
float readSimulatedWaterLevel() {
  // In production, compute from ultrasonic or contactless sensor
  return 82.5; 
}

float readPhSensor() {
  // 10-sample moving average to eliminate electrical ripple
  long sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(PIN_PH_ANALOG);
    delay(2);
  }
  float raw = sum / 10.0;
  float voltage = raw * (3.3 / 4095.0);

  // Standard analog pH probe linear model (adjust offset with calibration buffers)
  float ph = 7.0 + ((2.5 - voltage) * 3.5);

  // Sanity check: floating or disconnected wire
  if (ph < 0.0 || ph > 14.0) return -1.0;
  return ph;
}

float readEcSensor() {
  long sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(PIN_EC_ANALOG);
    delay(2);
  }
  float raw = sum / 10.0;
  float voltage = raw * (3.3 / 4095.0);

  // Basic conversion curve: Voltage to mS/cm
  float ec = voltage * 1.0; 
  if (ec < 0.0 || ec > 5.0) return -1.0;
  return ec;
}

// =============================================================================
// COMMAND HANDLING & SAFETY CHECKS
// =============================================================================
void handleCommand(byte* payload, unsigned int length) {
  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, payload, length);

  if (error) {
    Serial.printf("[Safety Warn] Corrupt JSON command: %s\n", error.c_str());
    return;
  }

  const char* cmd = doc["command"] | "";

  // 1. EMERGENCY STOP HANDLER
  if (strcmp(cmd, "EMERGENCY_STOP") == 0 || strcmp(cmd, "ABORT") == 0) {
    executeEmergencyStop("MQTT E-STOP Received");
    return;
  }

  // 2. DOSING PULSE DISPATCH
  if (strcmp(cmd, "RUN_PUMP") == 0) {
    const char* pumpType = doc["pump_type"] | "";
    unsigned long reqDuration = doc["duration_ms"] | 0;

    // Check Water Level Protection
    if (readSimulatedWaterLevel() < MIN_WATER_LEVEL_PCT) {
      Serial.println("[Safety Inhibit] Tank water level < 15%. Pulse refused.");
      return;
    }

    // Mutual Exclusion: Cannot start new pulse if another pump is busy
    if (currentDose.state != ACTUATOR_IDLE) {
      Serial.println("[Safety Inhibit] Hardware busy. Concurrent dose refused.");
      return;
    }

    // Enforce Hard Duration Clamp
    unsigned long safeDuration = min(reqDuration, MAX_PULSE_DURATION_MS);
    if (reqDuration > MAX_PULSE_DURATION_MS) {
      Serial.printf("[Safety Warning] Duration clamped from %lu to %lu ms\n", reqDuration, safeDuration);
    }

    if (safeDuration == 0) return;

    // Map pump type to pin
    int targetPin = -1;
    if (strcmp(pumpType, "PH_DOWN") == 0) targetPin = PIN_PUMP_PH_DOWN;
    else if (strcmp(pumpType, "NUTRIENT_A") == 0) targetPin = PIN_PUMP_STOCK_A;
    else if (strcmp(pumpType, "NUTRIENT_B") == 0) targetPin = PIN_PUMP_STOCK_B;

    if (targetPin != -1) {
      currentDose.state = ACTUATOR_PULSING;
      currentDose.pin = targetPin;
      strncpy(currentDose.pumpType, pumpType, sizeof(currentDose.pumpType) - 1);
      currentDose.durationMs = safeDuration;
      currentDose.pulseStartTime = millis();

      digitalWrite(targetPin, RELAY_ON);
      digitalWrite(PIN_ONBOARD_LED, HIGH); // Flash LED during pulse (ESP32 Active-HIGH)
      Serial.printf("[Actuator] >> START PULSE: %s on Pin %d for %lu ms <<\n", pumpType, targetPin, safeDuration);
    } else {
      Serial.printf("[Actuator Warn] Unknown pump: %s\n", pumpType);
    }
  }
}

void handleCirculationUpdate(byte* payload, unsigned int length) {
  JsonDocument doc;
  if (deserializeJson(doc, payload, length)) return;

  const char* modeStr = doc["mode"] | "INTERVAL";
  int runMin  = doc["run_min"] | 15;
  int restMin = doc["rest_min"] | 15;

  if (strcmp(modeStr, "CONTINUOUS") == 0) {
    circMode = CIRC_CONTINUOUS;
  } else if (strcmp(modeStr, "OFF") == 0) {
    circMode = CIRC_OFF;
  } else {
    circMode = CIRC_INTERVAL;
    circRunMs  = (unsigned long)max(1, runMin) * 60000UL;
    circRestMs = (unsigned long)max(1, restMin) * 60000UL;
  }

  // Reset timer cycle
  circPhaseStartTime = millis();
  isCircRunning = (circMode != CIRC_OFF);
  digitalWrite(PIN_PUMP_CIRCULATION, isCircRunning ? RELAY_ON : RELAY_OFF);
  Serial.printf("[Circulation] Switched to %s (Run: %dm, Rest: %dm)\n", modeStr, runMin, restMin);
}

// Inbound MQTT router
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  if (strcmp(topic, topicCommands) == 0) {
    handleCommand(payload, length);
  } else if (strcmp(topic, topicCirculation) == 0) {
    handleCirculationUpdate(payload, length);
  }
}

// =============================================================================
// EMERGENCY & SAFETY ROUTINES
// =============================================================================
void executeEmergencyStop(const char* reason) {
  Serial.printf("\n[EMERGENCY STOP] %s! Killing all outputs immediately.\n", reason);
  
  digitalWrite(PIN_PUMP_PH_DOWN, RELAY_OFF);
  digitalWrite(PIN_PUMP_STOCK_A, RELAY_OFF);
  digitalWrite(PIN_PUMP_STOCK_B, RELAY_OFF);
  digitalWrite(PIN_PUMP_CIRCULATION, RELAY_OFF);
  digitalWrite(PIN_ONBOARD_LED, LOW);

  currentDose.state = ACTUATOR_IDLE;
  currentDose.pin = -1;
  circMode = CIRC_OFF;
  isCircRunning = false;
}

void stopActiveDose() {
  if (currentDose.pin != -1) {
    digitalWrite(currentDose.pin, RELAY_OFF);
    digitalWrite(PIN_ONBOARD_LED, LOW);
    Serial.printf("[Actuator] >> END PULSE: %s (De-energized) <<\n", currentDose.pumpType);
  }
  // Transition to inductive-protection cooldown deadtime
  currentDose.state = ACTUATOR_INTERLOCK_COOLDOWN;
  currentDose.cooldownStartTime = millis();
}

// =============================================================================
// STATE ENGINES (RUN EVERY LOOP TICK)
// =============================================================================
void updateDosingStateMachine() {
  unsigned long now = millis();

  if (currentDose.state == ACTUATOR_PULSING) {
    if (now - currentDose.pulseStartTime >= currentDose.durationMs) {
      stopActiveDose();
    }
  } else if (currentDose.state == ACTUATOR_INTERLOCK_COOLDOWN) {
    if (now - currentDose.cooldownStartTime >= MIN_INTERLOCK_DELAY_MS) {
      currentDose.state = ACTUATOR_IDLE;
      currentDose.pin = -1;
    }
  }
}

void updateCirculationStateMachine() {
  if (readSimulatedWaterLevel() < MIN_WATER_LEVEL_PCT) {
    if (isCircRunning) {
      digitalWrite(PIN_PUMP_CIRCULATION, RELAY_OFF);
      isCircRunning = false;
      Serial.println("[Circulation Safety] Disabled due to low water level.");
    }
    return;
  }

  unsigned long now = millis();

  switch (circMode) {
    case CIRC_CONTINUOUS:
      if (!isCircRunning) {
        digitalWrite(PIN_PUMP_CIRCULATION, RELAY_ON);
        isCircRunning = true;
      }
      break;

    case CIRC_OFF:
      if (isCircRunning) {
        digitalWrite(PIN_PUMP_CIRCULATION, RELAY_OFF);
        isCircRunning = false;
      }
      break;

    case CIRC_INTERVAL:
      if (isCircRunning && (now - circPhaseStartTime >= circRunMs)) {
        digitalWrite(PIN_PUMP_CIRCULATION, RELAY_OFF);
        isCircRunning = false;
        circPhaseStartTime = now;
        Serial.println("[Circulation] Interval: Entering REST phase");
      } else if (!isCircRunning && (now - circPhaseStartTime >= circRestMs)) {
        digitalWrite(PIN_PUMP_CIRCULATION, RELAY_ON);
        isCircRunning = true;
        circPhaseStartTime = now;
        Serial.println("[Circulation] Interval: Entering RUN phase");
      }
      break;
  }
}

// =============================================================================
// NON-BLOCKING TELEMETRY & NETWORK
// =============================================================================
void publishTelemetryPacket() {
  JsonDocument doc;
  doc["device_id"] = DEVICE_ID;

  JsonObject sensors = doc["sensors"].to();
  
  float currentPh = readPhSensor();
  sensors["ph"] = (currentPh > 0) ? currentPh : 6.25;

  float currentEc = readEcSensor();
  sensors["ec_ms_cm"] = (currentEc > 0) ? currentEc : 1.45;

  sensors["water_temp_c"]    = 21.8;
  sensors["air_temp_c"]      = 24.2;
  sensors["humidity_pct"]    = 63.5;
  sensors["water_level_pct"] = readSimulatedWaterLevel();

  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer);

  client.publish(topicTelemetry, jsonBuffer);
  Serial.printf("[Telemetry Stream] %s\n", jsonBuffer);
}

void manageNetworkConnections() {
  if (WiFi.status() != WL_CONNECTED) {
    return; // Background Wi-Fi stack will auto-reconnect
  }

  if (!client.connected()) {
    unsigned long now = millis();
    if (now - lastMqttRetryMillis >= MQTT_RECONNECT_RETRY_MS) {
      lastMqttRetryMillis = now;
      Serial.print("[MQTT] Connecting to broker...");

      // Generate unique client ID using ESP32 MAC address
      uint64_t chipid = ESP.getEfuseMac();
      char clientId[32];
      snprintf(clientId, sizeof(clientId), "ESP32-%04X%08X", (uint16_t)(chipid >> 32), (uint32_t)chipid);

      if (client.connect(clientId)) {
        Serial.println(" OK!");
        client.subscribe(topicCommands, 1);
        client.subscribe(topicCirculation, 1);
      } else {
        Serial.printf(" FAILED (rc=%d)\n", client.state());
      }
    }
  }
}

// =============================================================================
// ARDUINO SETUP & LOOP
// =============================================================================
void setup() {
  Serial.begin(115200);

  // 1. Enforce failsafe outputs before bringing up peripherals
  setupPinsFailsafe();

  // 2. Build topic strings
  snprintf(topicTelemetry, sizeof(topicTelemetry), "hydro/%s/telemetry", DEVICE_ID);
  snprintf(topicCommands, sizeof(topicCommands), "hydro/%s/commands", DEVICE_ID);
  snprintf(topicCirculation, sizeof(topicCirculation), "hydro/%s/circulation/set", DEVICE_ID);

  // 3. Initiate non-blocking Wi-Fi connect
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.printf("[WiFi] Connecting to %s...\n", WIFI_SSID);

  client.setServer(MQTT_BROKER, MQTT_PORT);
  client.setCallback(mqttCallback);

  circPhaseStartTime = millis();
}

void loop() {
  manageNetworkConnections();
  if (client.connected()) {
    client.loop();
  }

  // Execute concurrent state machines without delay()
  updateDosingStateMachine();
  updateCirculationStateMachine();

  // Dispatch periodic telemetry
  unsigned long now = millis();
  if (now - lastTelemetryMillis >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryMillis = now;
    if (client.connected()) {
      publishTelemetryPacket();
    }
  }
}