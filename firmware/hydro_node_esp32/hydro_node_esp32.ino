// Hydroponic node for ESP32: real sensors, MQTT telemetry/commands, pump outputs, WiFi pairing portal.
//
// Libraries (Library Manager): WiFiManager by tzapu (2.0.x), PubSubClient 2.8+, ArduinoJson 7.x,
//                              OneWire (Paul Stoffregen), DallasTemperature (Miles Burton),
//                              "DHT sensor library" + "Adafruit Unified Sensor" (Adafruit)
// Board package: "esp32" by Espressif. Select a board such as "ESP32 Dev Module".
//
// ----------------------------------------------------------------------------------------------
// PIN CONFIGURATION (change the numbers in the "Pin configuration" blocks below if you wire differently)
//
//   Function              ESP32 pin   Notes
//   --------------------  ----------  --------------------------------------------------------------
//   Circulation pump      GPIO25      output, latched ON/OFF, no timeout
//   pH Down pump          GPIO26      output, timed pulse
//   Nutrient A pump       GPIO27      output, timed pulse
//   Nutrient B pump       GPIO33      output, timed pulse
//   pH probe board        GPIO34      analog in (ADC1, input-only). Output must stay below 3.3 V
//   EC probe board        GPIO35      analog in (ADC1, input-only). Output must stay below 3.3 V
//   Water temp DS18B20    GPIO4       1-Wire data, 4.7 kOhm pull-up to 3V3
//   Air temp/hum DHT22    GPIO18      data (10 kOhm pull-up to 3V3 if your module has none)
//   Ultrasonic TRIG       GPIO19      output
//   Ultrasonic ECHO       GPIO23      input. HC-SR04 echo is 5 V: use a 1k/2k divider or a 3.3 V sensor
//   Re-pair button        GPIO0       the BOOT button; hold 5 s while running
//   Status LED            GPIO2       built-in LED, active HIGH
//
//   Only ADC1 pins (GPIO32-39) are used for analog sensing: ADC2 stops working while WiFi is on.
//   Every pump output drives a relay module or MOSFET board, never a pump directly. Give the pumps their own
//   supply and tie its ground to the ESP32's ground. None of these are boot-strapping pins.
//
// FIRST RUN: pH and EC must be calibrated before telemetry is sent (see "Serial commands" in the README block
// near the bottom, or type `help` in the Serial Monitor at 115200 baud).
// ----------------------------------------------------------------------------------------------

#include <WiFi.h>
#include <WiFiManager.h>
#include <LittleFS.h>
#include <Preferences.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <DHT.h>
#include <time.h>

// ===================== Pin configuration =====================
#ifndef LED_BUILTIN
  #define LED_BUILTIN 2
#endif

const uint8_t PIN_CIRCULATION = 25;
const uint8_t PIN_PH_DOWN     = 26;
const uint8_t PIN_NUTRIENT_A  = 27;
const uint8_t PIN_NUTRIENT_B  = 33;
const uint8_t BUTTON_PIN      = 0;     // BOOT button

#define STATUS_LED_ON_LEVEL  HIGH      // the ESP32 built-in LED is active HIGH
#define STATUS_LED_OFF_LEVEL LOW

// Relay polarity. 1 = the relay/driver switches ON when the pin is LOW (the common "low level trigger" 4-channel
// relay boards). 0 = ON when the pin is HIGH (MOSFET modules, "high level trigger" relays).
// !! Get this right BEFORE connecting a pump: test with the pump supply disconnected, or with LEDs, first. !!
#ifndef PUMP_ACTIVE_LOW
  #define PUMP_ACTIVE_LOW 1
#endif

// ===================== Sensor configuration =====================
const uint8_t PIN_PH_ADC     = 34;   // ADC1_CH6
const uint8_t PIN_EC_ADC     = 35;   // ADC1_CH7
const uint8_t PIN_WATER_TEMP = 4;    // DS18B20 data
const uint8_t PIN_DHT        = 18;   // DHT22 data
const uint8_t PIN_US_TRIG    = 19;   // ultrasonic trigger
const uint8_t PIN_US_ECHO    = 23;   // ultrasonic echo (5 V sensors need a divider)

#ifndef DHT_TYPE
  #define DHT_TYPE DHT22             // or DHT11
#endif

// Tank geometry for the ultrasonic level sensor, measured from the sensor face DOWN to the water surface.
// The sensor must sit above the highest water level and above its own minimum range
// (HC-SR04 about 2 cm, waterproof JSN-SR04T about 25 cm, so with a JSN-SR04T TANK_FULL_CM must be at least 25).
const float TANK_EMPTY_CM = 40.0f;   // distance to the water when the tank is at the "empty" mark (0 %)
const float TANK_FULL_CM  = 5.0f;    // distance to the water when the tank is full (100 %)

// 0 = telemetry is NOT sent until pH and EC are calibrated (recommended: the dosing engine acts on these numbers).
// 1 = bench testing only: send readings computed from placeholder calibration values.
#ifndef ALLOW_UNCALIBRATED
  #define ALLOW_UNCALIBRATED 0
#endif

// ===================== Fixed configuration =====================
// Keep this equal to the Device id in your database.
const char* DEVICE_ID = "esp32_node_01";

const char*   AP_NAME         = "Hydro-Setup";   // WiFi network the board creates for pairing
const char*   AP_PASS         = "hydro1234";     // at least 8 characters (use nullptr for an open AP)
const unsigned long BUTTON_HOLD_MS = 5000;       // hold this long while running to re-open the portal
const unsigned long TELEMETRY_INTERVAL_MS = 10000;
const uint32_t MAX_PUMP_MS = 10000;               // hard clamp on any single dosing pulse

// ===================== Settings entered in the portal (saved to flash) =====================
char mqttHost[40] = "192.168.1.100";   // LAN IP of the machine running the broker (NOT localhost)
char mqttPort[6]  = "1883";
char mqttUser[32] = "";
char mqttPass[32] = "";

// ===================== Sensor tuning =====================
const unsigned long ADC_SAMPLE_MS         = 100;     // one pH + EC sample every 100 ms, median of the last 31
const uint8_t       ADC_MIN_SAMPLES       = 20;
const unsigned long US_PING_MS            = 250;     // one ultrasonic ping every 250 ms, median of the last 9
const uint8_t       US_MIN_SAMPLES        = 5;
const unsigned long US_MAX_AGE_MS         = 5000;    // no valid echo for this long = level sensor fault
const unsigned long DS_PERIOD_MS          = 2000;    // DS18B20 conversion cycle
const unsigned long DS_CONVERSION_MS      = 800;     // 12-bit conversion needs about 750 ms
const unsigned long WATER_TEMP_MAX_AGE_MS = 15000;   // water temperature older than this is a sensor fault
const unsigned long DHT_PERIOD_MS         = 3000;
const unsigned long HOLD_NONCRITICAL_MS   = 300000;  // air temp/humidity may reuse the last good value this long

const float ADC_MV_MAX_VALID    = 3150.0f;  // the ESP32 ADC clips near 3.1 V at 11 dB: a clipped reading is a fault
const float PH_MV_MIN_VALID     = 100.0f;   // a pH board outputs hundreds of mV even in strong acid: ~0 = unpowered/unplugged
const float PH_MIN_SEPARATION_MV = 50.0f;   // the two pH calibration points must differ by at least this
const float EC_CAL_MIN_MV       = 20.0f;    // refuse to calibrate EC with the probe out of the solution
const float EC_TEMP_COEFF       = 0.02f;    // EC changes about 2 % per degree C; readings are compensated to 25 C
const float EC_MAX_VALID        = 20.0f;    // mS/cm
const float US_MIN_CM           = 2.0f;     // echoes outside this range are rejected
const float US_MAX_CM           = 400.0f;

// Placeholders used ONLY when ALLOW_UNCALIBRATED=1 (typical values for a 3.3 V analog pH board)
const float PH_DEFAULT_MV_AT_7  = 1500.0f;
const float PH_DEFAULT_MV_AT_4  = 2032.44f;
const float EC_DEFAULT_K        = 1.0f;

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

String lastCommandId  = "";

void resetSensorBuffers();   // defined with the sensor code below

unsigned long lastTelemetryMs = 0;
unsigned long lastMqttAttempt = 0;
unsigned long buttonDownSince = 0;
unsigned long wifiLostSince   = 0;

// ===================== Board helpers =====================
String chipIdHex() {
  return String((uint32_t)(ESP.getEfuseMac() >> 24), HEX);   // last 3 MAC bytes: unique per board
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
  resetSensorBuffers();   // the portal blocked sampling for up to 3 minutes: start the filters fresh
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

// ===================== Sensors =====================
// Every analog reading is the MEDIAN of a rolling window, so single spikes (electrical noise, a bubble,
// a stray echo) never reach the dosing engine. All sampling is non-blocking and runs from loop().
template <uint8_t N> class MedianRing {
 public:
  void push(float x) { buf[head] = x; head = (head + 1) % N; if (count < N) count++; }
  void clear() { head = 0; count = 0; }
  uint8_t size() const { return count; }
  bool median(float& out, uint8_t minSamples) const {
    if (count < minSamples || count == 0) return false;
    float tmp[N];
    for (uint8_t i = 0; i < count; i++) {
      float v = buf[i];
      uint8_t j = i;
      while (j > 0 && tmp[j - 1] > v) { tmp[j] = tmp[j - 1]; j--; }
      tmp[j] = v;
    }
    out = (count % 2) ? tmp[count / 2] : (tmp[count / 2 - 1] + tmp[count / 2]) / 2.0f;
    return true;
  }
 private:
  float buf[N];
  uint8_t head = 0;
  uint8_t count = 0;
};

MedianRing<31> phRing;
MedianRing<31> ecRing;
MedianRing<9>  usRing;

OneWire           oneWire(PIN_WATER_TEMP);
DallasTemperature waterSensor(&oneWire);
DHT               dht(PIN_DHT, DHT_TYPE);
Preferences       prefs;

unsigned long lastAdcMs = 0, lastPingMs = 0, lastDhtMs = 0, lastDsStartMs = 0;
unsigned long lastUsValidMs = 0, dsRequestedAt = 0, waterTempAt = 0, airAt = 0, humAt = 0;
bool  dsRequested = false, waterTempEver = false, airEver = false, humEver = false;
float waterTempC = NAN, airTempC = NAN, humidityPct = NAN;

void resetSensorBuffers() {
  phRing.clear();
  ecRing.clear();
  usRing.clear();
}

bool waterTempFresh(unsigned long now) { return waterTempEver && now - waterTempAt <= WATER_TEMP_MAX_AGE_MS; }
bool airTempFresh(unsigned long now)   { return airEver && now - airAt <= HOLD_NONCRITICAL_MS; }
bool humidityFresh(unsigned long now)  { return humEver && now - humAt <= HOLD_NONCRITICAL_MS; }

// DS18B20: request a conversion, collect it ~800 ms later. Never blocks.
void updateWaterTemp(unsigned long now) {
  if (!dsRequested && now - lastDsStartMs >= DS_PERIOD_MS) {
    waterSensor.requestTemperatures();
    dsRequested = true;
    dsRequestedAt = now;
    lastDsStartMs = now;
  } else if (dsRequested && now - dsRequestedAt >= DS_CONVERSION_MS) {
    dsRequested = false;
    float t = waterSensor.getTempCByIndex(0);
    // -127 = sensor disconnected, 85.0 = power-on default (conversion never ran)
    bool bad = (t == DEVICE_DISCONNECTED_C) || (t == 85.0f) || isnan(t) || t < -10.0f || t > 60.0f;
    if (!bad) {
      waterTempC = t;
      waterTempAt = now;
      waterTempEver = true;
    }
  }
}

// DHT22: the library limits reads to one per 2 s; a failed read (NaN) simply keeps the last good value.
void updateDht(unsigned long now) {
  if (now - lastDhtMs < DHT_PERIOD_MS) return;
  lastDhtMs = now;
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  if (!isnan(t) && t > -40.0f && t < 80.0f) { airTempC = t; airAt = now; airEver = true; }
  if (!isnan(h) && h >= 0.0f && h <= 100.0f) { humidityPct = h; humAt = now; humEver = true; }
}

// One ultrasonic ping, corrected for the speed of sound at the current air temperature. NAN = no valid echo.
float pingCm() {
  digitalWrite(PIN_US_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_US_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_US_TRIG, LOW);
  unsigned long us = pulseIn(PIN_US_ECHO, HIGH, 30000UL);   // 30 ms timeout, so a missing echo costs at most 30 ms
  if (us == 0) return NAN;
  float t = airTempFresh(millis()) ? airTempC : 20.0f;
  float cmPerUs = (331.3f + 0.606f * t) / 10000.0f;
  float d = (float)us * cmPerUs / 2.0f;
  if (d < US_MIN_CM || d > US_MAX_CM) return NAN;
  return d;
}

void updateSensors() {
  const unsigned long now = millis();
  if (now - lastAdcMs >= ADC_SAMPLE_MS) {
    lastAdcMs = now;
    phRing.push((float)analogReadMilliVolts(PIN_PH_ADC));
    ecRing.push((float)analogReadMilliVolts(PIN_EC_ADC));
  }
  if (now - lastPingMs >= US_PING_MS) {
    lastPingMs = now;
    float d = pingCm();
    if (!isnan(d)) { usRing.push(d); lastUsValidMs = millis(); }
  }
  updateWaterTemp(now);
  updateDht(now);
}

void initSensors() {
  analogReadResolution(12);
  analogSetPinAttenuation(PIN_PH_ADC, ADC_11db);   // 0 to about 3.1 V
  analogSetPinAttenuation(PIN_EC_ADC, ADC_11db);
  pinMode(PIN_US_TRIG, OUTPUT);
  digitalWrite(PIN_US_TRIG, LOW);
  pinMode(PIN_US_ECHO, INPUT);
  waterSensor.begin();
  waterSensor.setResolution(12);
  waterSensor.setWaitForConversion(false);   // we collect the result ourselves, without blocking
  dht.begin();
}

// ===================== Calibration (stored in flash, survives reboots) =====================
struct Calibration {
  float phMv7 = PH_DEFAULT_MV_AT_7;
  float phMv4 = PH_DEFAULT_MV_AT_4;
  float ecK   = EC_DEFAULT_K;
  bool  ph7Set = false, ph4Set = false, ecSet = false;
} cal;

bool phCalibrated() { return cal.ph7Set && cal.ph4Set; }

void loadCalibration() {
  float v;
  v = prefs.getFloat("ph7", NAN); if (!isnan(v)) { cal.phMv7 = v; cal.ph7Set = true; }
  v = prefs.getFloat("ph4", NAN); if (!isnan(v)) { cal.phMv4 = v; cal.ph4Set = true; }
  v = prefs.getFloat("eck", NAN); if (!isnan(v)) { cal.ecK = v;   cal.ecSet = true; }
}

void clearCalibration() {
  prefs.remove("ph7");
  prefs.remove("ph4");
  prefs.remove("eck");
  cal = Calibration();
  Serial.println("[CAL] All calibration cleared. Telemetry is paused until pH and EC are calibrated again.");
}

void printCalibration() {
  Serial.printf("[CAL] pH : %s", phCalibrated() ? "calibrated" : "NOT calibrated");
  Serial.printf(" (pH7 point: %s", cal.ph7Set ? "set" : "missing");
  Serial.printf(", pH4 point: %s)\n", cal.ph4Set ? "set" : "missing");
  if (cal.ph7Set) Serial.printf("[CAL]      pH 7.00 = %.1f mV\n", cal.phMv7);
  if (cal.ph4Set) Serial.printf("[CAL]      pH 4.00 = %.1f mV\n", cal.phMv4);
  Serial.printf("[CAL] EC : %s", cal.ecSet ? "calibrated" : "NOT calibrated");
  if (cal.ecSet) Serial.printf(" (K = %.4f)", cal.ecK);
  Serial.println();
}

// Linear two-point pH: pH = 7 + slope * (mV - mV@7), slope from the pH 7 and pH 4 buffer readings.
float phFromMv(float mv) {
  float slope = 3.0f / (cal.phMv7 - cal.phMv4);
  return 7.0f + slope * (mv - cal.phMv7);
}

// EC is proportional to the probe voltage, compensated to 25 C: EC25 = K * V / (1 + 0.02 * (T - 25)).
float ecFromMv(float mv, float tempC) {
  return cal.ecK * (mv / 1000.0f) / (1.0f + EC_TEMP_COEFF * (tempC - 25.0f));
}

float levelPctFromCm(float distanceCm) {
  float pct = (TANK_EMPTY_CM - distanceCm) / (TANK_EMPTY_CM - TANK_FULL_CM) * 100.0f;
  return constrain(pct, 0.0f, 100.0f);
}

// pH 7.00 buffer -> `ph7`, pH 4.00 buffer -> `ph4`
void calibratePh(bool isSeven) {
  float mv;
  if (!phRing.median(mv, ADC_MIN_SAMPLES)) {
    Serial.println("[CAL] Not enough pH samples yet. Wait 3 seconds and try again.");
    return;
  }
  if (mv < PH_MV_MIN_VALID || mv > ADC_MV_MAX_VALID) {
    Serial.printf("[CAL] pH board reads %.0f mV, which is out of range. Check power and wiring.\n", mv);
    return;
  }
  bool  otherSet = isSeven ? cal.ph4Set : cal.ph7Set;
  float other    = isSeven ? cal.phMv4  : cal.phMv7;
  if (otherSet && fabsf(mv - other) < PH_MIN_SEPARATION_MV) {
    Serial.printf("[CAL] Rejected: %.1f mV is within %.0f mV of the other point (%.1f mV). Is the probe in the right buffer?\n",
                  mv, PH_MIN_SEPARATION_MV, other);
    return;
  }
  if (isSeven) { cal.phMv7 = mv; cal.ph7Set = true; prefs.putFloat("ph7", mv); }
  else         { cal.phMv4 = mv; cal.ph4Set = true; prefs.putFloat("ph4", mv); }
  Serial.printf("[CAL] pH %s saved at %.1f mV. %s\n", isSeven ? "7.00" : "4.00", mv,
                phCalibrated() ? "pH is now calibrated." : (isSeven ? "Now rinse the probe and run `ph4` in the pH 4.00 buffer." : "Now rinse the probe and run `ph7` in the pH 7.00 buffer."));
}

// Probe in a known EC standard (for example 1.413 mS/cm) -> `ec 1.413`
void calibrateEc(const char* arg) {
  char* end = nullptr;
  float known = strtof(arg, &end);
  if (end == arg || known < 0.05f || known > EC_MAX_VALID) {
    Serial.println("[CAL] Usage: ec <mS/cm of your standard solution>, for example `ec 1.413`");
    return;
  }
  float mv;
  if (!ecRing.median(mv, ADC_MIN_SAMPLES)) {
    Serial.println("[CAL] Not enough EC samples yet. Wait 3 seconds and try again.");
    return;
  }
  if (mv < EC_CAL_MIN_MV || mv > ADC_MV_MAX_VALID) {
    Serial.printf("[CAL] EC board reads %.0f mV, which is out of range. Is the probe in the solution?\n", mv);
    return;
  }
  if (!waterTempFresh(millis())) {
    Serial.println("[CAL] The water temperature sensor (DS18B20) is not responding. EC calibration needs it for compensation.");
    return;
  }
  cal.ecK = known * (1.0f + EC_TEMP_COEFF * (waterTempC - 25.0f)) / (mv / 1000.0f);
  cal.ecSet = true;
  prefs.putFloat("eck", cal.ecK);
  Serial.printf("[CAL] EC saved: %.3f mS/cm at %.0f mV, %.1f C (K = %.4f). EC is now calibrated.\n", known, mv, waterTempC, cal.ecK);
}

// ===================== Serial commands (Serial Monitor, 115200 baud, newline) =====================
void printHelp() {
  Serial.println("[SER] Commands:");
  Serial.println("[SER]   read        show every sensor right now (raw mV and converted values)");
  Serial.println("[SER]   cal         show the calibration status");
  Serial.println("[SER]   ph7         probe in pH 7.00 buffer, save the pH 7 point");
  Serial.println("[SER]   ph4         probe in pH 4.00 buffer, save the pH 4 point");
  Serial.println("[SER]   ec <value>  probe in an EC standard of <value> mS/cm, e.g. `ec 1.413`");
  Serial.println("[SER]   clear       erase all calibration");
  Serial.println("[SER] Calibrate: let the reading settle in the buffer for about 30 s, then send the command.");
}

void cmdRead() {
  const unsigned long now = millis();
  float mv, d;
  if (phRing.median(mv, ADC_MIN_SAMPLES)) {
    Serial.printf("[READ] pH    : %.1f mV", mv);
    if (phCalibrated()) Serial.printf(" -> pH %.2f\n", phFromMv(mv)); else Serial.println(" (not calibrated)");
  } else Serial.println("[READ] pH    : collecting samples");
  if (ecRing.median(mv, ADC_MIN_SAMPLES)) {
    Serial.printf("[READ] EC    : %.1f mV", mv);
    if (cal.ecSet && waterTempFresh(now)) Serial.printf(" -> %.2f mS/cm (25 C)\n", ecFromMv(mv, waterTempC));
    else Serial.println(cal.ecSet ? " (needs water temperature)" : " (not calibrated)");
  } else Serial.println("[READ] EC    : collecting samples");
  if (waterTempFresh(now)) Serial.printf("[READ] water : %.1f C\n", waterTempC); else Serial.println("[READ] water : DS18B20 not responding");
  if (airTempFresh(now) && humidityFresh(now)) Serial.printf("[READ] air   : %.1f C, %.0f %% RH\n", airTempC, humidityPct);
  else Serial.println("[READ] air   : DHT not responding");
  if (now - lastUsValidMs <= US_MAX_AGE_MS && usRing.median(d, US_MIN_SAMPLES)) Serial.printf("[READ] level : %.1f cm to the water -> %.1f %%\n", d, levelPctFromCm(d));
  else Serial.println("[READ] level : no valid ultrasonic echo");
}

void runSerialCommand(char* line) {
  if (strcmp(line, "help") == 0 || strcmp(line, "?") == 0) printHelp();
  else if (strcmp(line, "read") == 0) cmdRead();
  else if (strcmp(line, "cal") == 0) printCalibration();
  else if (strcmp(line, "ph7") == 0) calibratePh(true);
  else if (strcmp(line, "ph4") == 0) calibratePh(false);
  else if (strncmp(line, "ec ", 3) == 0) calibrateEc(line + 3);
  else if (strcmp(line, "clear") == 0) clearCalibration();
  else Serial.printf("[SER] Unknown command '%s'. Type `help`.\n", line);
}

char    serialLine[48];
uint8_t serialLen = 0;

void pollSerialCommands() {
  while (Serial.available()) {
    char c = (char)Serial.read();
    if (c == '\r' || c == '\n') {
      if (serialLen > 0) {
        serialLine[serialLen] = 0;
        runSerialCommand(serialLine);
        serialLen = 0;
      }
    } else if (serialLen < sizeof(serialLine) - 1) {
      serialLine[serialLen++] = (char)tolower((unsigned char)c);
    }
  }
}

// ===================== Telemetry =====================
struct Readings {
  float ph, ec, waterTemp, airTemp, humidity, levelPct;
};

// Fills `r` only if EVERY value is a real, plausible measurement. Otherwise returns false with a reason.
// The node never sends a guessed or stale number: with no telemetry the dosing engine simply does not dose.
bool collectReadings(Readings& r, char* why, size_t whySize) {
  const unsigned long now = millis();
  float mv;

  if (!waterTempFresh(now)) { snprintf(why, whySize, "water temperature (DS18B20) not responding"); return false; }
  r.waterTemp = waterTempC;

  if (!phRing.median(mv, ADC_MIN_SAMPLES)) { snprintf(why, whySize, "pH: still collecting samples"); return false; }
  if (mv < PH_MV_MIN_VALID || mv > ADC_MV_MAX_VALID) { snprintf(why, whySize, "pH board reads %.0f mV (unplugged, unpowered or clipped)", mv); return false; }
#if !ALLOW_UNCALIBRATED
  if (!phCalibrated()) { snprintf(why, whySize, "pH is not calibrated (Serial: ph7, then ph4)"); return false; }
#endif
  r.ph = phFromMv(mv);
  if (!(r.ph > 0.0f && r.ph <= 14.0f)) { snprintf(why, whySize, "pH computed as %.2f is outside 0 to 14 (probe fault or bad calibration)", r.ph); return false; }

  if (!ecRing.median(mv, ADC_MIN_SAMPLES)) { snprintf(why, whySize, "EC: still collecting samples"); return false; }
  if (mv > ADC_MV_MAX_VALID) { snprintf(why, whySize, "EC board reads %.0f mV (clipped or wiring fault)", mv); return false; }
#if !ALLOW_UNCALIBRATED
  if (!cal.ecSet) { snprintf(why, whySize, "EC is not calibrated (Serial: ec <mS/cm of your standard>)"); return false; }
#endif
  r.ec = ecFromMv(mv, r.waterTemp);
  if (!(r.ec >= 0.0f && r.ec <= EC_MAX_VALID)) { snprintf(why, whySize, "EC computed as %.2f mS/cm is implausible", r.ec); return false; }

  float d;
  if (now - lastUsValidMs > US_MAX_AGE_MS || !usRing.median(d, US_MIN_SAMPLES)) { snprintf(why, whySize, "water level: no valid ultrasonic echo"); return false; }
  r.levelPct = levelPctFromCm(d);

  if (!airTempFresh(now) || !humidityFresh(now)) { snprintf(why, whySize, "air temperature/humidity (DHT) unavailable for over 5 minutes"); return false; }
  r.airTemp = airTempC;
  r.humidity = humidityPct;
  return true;
}

void publishTelemetry() {
  Readings r;
  char why[128];
  if (!collectReadings(r, why, sizeof(why))) {
    Serial.printf("[SENSORS] Telemetry NOT sent: %s\n", why);
    return;
  }
#if ALLOW_UNCALIBRATED
  if (!phCalibrated() || !cal.ecSet) Serial.println("[SENSORS] WARNING: sending UNCALIBRATED pH/EC (ALLOW_UNCALIBRATED=1). Do not dose from these values.");
#endif

  JsonDocument doc;
  doc["device_id"] = DEVICE_ID;
  doc["sensors"]["ph"] = round(r.ph * 100.0f) / 100.0f;
  doc["sensors"]["ec_ms_cm"] = round(r.ec * 100.0f) / 100.0f;
  doc["sensors"]["water_temp_c"] = round(r.waterTemp * 10.0f) / 10.0f;
  doc["sensors"]["air_temp_c"] = round(r.airTemp * 10.0f) / 10.0f;
  doc["sensors"]["humidity_pct"] = round(r.humidity * 10.0f) / 10.0f;
  doc["sensors"]["water_level_pct"] = round(r.levelPct * 10.0f) / 10.0f;

  char buffer[256];
  serializeJson(doc, buffer, sizeof(buffer));
  if (client.publish(topicTelemetry, buffer)) {
    flashLed();
  } else {
    Serial.println("[MQTT] Telemetry publish FAILED");
  }
  Serial.printf("[SENSORS] pH %.2f | EC %.2f mS/cm | water %.1f C | air %.1f C | RH %.0f%% | level %.1f%%\n",
                r.ph, r.ec, r.waterTemp, r.airTemp, r.humidity, r.levelPct);
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
  Serial.println("\n[BOOT] Hydroponic node (ESP32, WiFiManager)");
  printPinConfig();

  pinMode(LED_BUILTIN, OUTPUT);
  ledOn();                          // no WiFi yet, so solid on until connected
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  if (!LittleFS.begin(true)) Serial.println("[CFG] LittleFS mount failed");   // true = format on first use
  prefs.begin("hydro", false);
  loadCalibration();
  initSensors();
  printCalibration();
  Serial.println("[SER] Type `help` for sensor commands (calibration, live readings).");
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
  updateSensors();        // non-blocking sampling; keeps the filters warm even while WiFi is down
  pollSerialCommands();
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
    publishTelemetry();
  }
}
