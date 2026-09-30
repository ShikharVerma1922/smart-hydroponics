#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <time.h>

// ===================== User configuration =====================
const char*    WIFI_SSID  = "Realme S";
const char*    WIFI_PASS  = "1234567891";
const char*    MQTT_HOST  = "10.223.140.52";   // LAN IP of the machine running the broker (NOT localhost)
const uint16_t MQTT_PORT  = 1883;
const char*    MQTT_USER  = "";                // leave empty if the broker has no auth
const char*    MQTT_PASS  = "";

// Keep this equal to the Device id in your database, even though this is an ESP8266.
const char*    DEVICE_ID  = "esp32_node_01";

const unsigned long TELEMETRY_INTERVAL_MS = 10000;  // one simulated 10 s tick per real 10 s

// ===================== Simulation tuning =====================
const float TICKS_PER_DAY         = 8640.0f;  // 86400 s / 10 s per tick
const float DRIFT_SPEEDUP         = 4.0f;     // 1.0 = realistic; raise to see dosing sooner
const float PH_DRIFT_PER_DAY      = 0.25f;
const float EC_DRIFT_PER_DAY      = -0.20f;
const float WATER_USE_PER_DAY     = 15.0f;    // % of tank per simulated day
const bool  AUTO_REFILL           = true;     // false to test the low-water emergency
const float REFILL_BELOW_PCT      = 40.0f;
const float REFILL_TO_PCT         = 95.0f;

const float PH_DROP_PER_PUMP_SEC  = 0.04f;    // per second of PH_DOWN
const float EC_RISE_PER_PUMP_SEC  = 0.04f;    // per second of NUTRIENT_A / _B (matches the server estimate)
const float MIXING_RATE_PER_TICK  = 0.10f;    // share of a dose that mixes in each tick
const uint32_t MAX_PUMP_MS        = 10000;    // firmware-side clamp per pulse

// ===================== State =====================
WiFiClient   espClient;
PubSubClient client(espClient);

char topicTelemetry[64];
char topicCommands[64];

uint32_t simSeconds      = 6UL * 3600UL;  // start at 06:00 simulated time
float    sim_ph          = 6.2f;
float    sim_ec          = 1.6f;
float    sim_water_level = 95.0f;

float  pendingPhDelta = 0.0f;   // dosed but not yet mixed in
float  pendingEcDelta = 0.0f;
String lastCommandId  = "";     // drops QoS 1 redeliveries

unsigned long lastTelemetryMs = 0;
unsigned long lastMqttAttempt = 0;

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

  // Drop stale commands (works once NTP has synced the clock)
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
  float solarFlux = sin(dayRadian - (PI / 2.0f));   // -1 at 00:00, +1 at 12:00

  float air_temp   = 23.5f + (4.0f * solarFlux);
  float water_temp = 21.0f + (2.0f * solarFlux);
  float humidity   = 65.0f - (15.0f * solarFlux);

  // Slow biological drift
  sim_ph += (PH_DRIFT_PER_DAY * DRIFT_SPEEDUP) / TICKS_PER_DAY;
  sim_ec += (EC_DRIFT_PER_DAY * DRIFT_SPEEDUP) / TICKS_PER_DAY;

  // Dosing effects mix in gradually
  float phStep = pendingPhDelta * MIXING_RATE_PER_TICK;
  float ecStep = pendingEcDelta * MIXING_RATE_PER_TICK;
  sim_ph += phStep;  pendingPhDelta -= phStep;
  sim_ec += ecStep;  pendingEcDelta -= ecStep;

  // Evaporation and optional refill (refilling dilutes EC)
  sim_water_level -= WATER_USE_PER_DAY / TICKS_PER_DAY;
  if (AUTO_REFILL && sim_water_level < REFILL_BELOW_PCT) {
    sim_ec *= sim_water_level / REFILL_TO_PCT;
    sim_water_level = REFILL_TO_PCT;
    Serial.println("[SIM] Tank refilled (EC diluted)");
  }

  sim_ph = constrain(sim_ph, 4.0f, 9.0f);
  sim_ec = constrain(sim_ec, 0.05f, 4.0f);
  sim_water_level = constrain(sim_water_level, 0.0f, 100.0f);

  // Independent ADC noise
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
  if (!client.publish(topicTelemetry, buffer)) {
    Serial.println("[MQTT] Telemetry publish FAILED");
  }

  int hours = simSeconds / 3600;
  int minutes = (simSeconds % 3600) / 60;
  Serial.printf("[%02d:%02d] Telemetry -> pH: %.2f | EC: %.2f | Tank: %.1f%% | Air: %.1f C\n",
                hours, minutes, final_ph, final_ec, sim_water_level, air_temp);
}

// ===================== Connectivity =====================
void connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.printf("[WiFi] Connecting to %s", WIFI_SSID);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    if (millis() - start > 30000) {
      Serial.println("\n[WiFi] Timed out, restarting...");
      ESP.restart();
    }
  }
  Serial.printf("\n[WiFi] Connected, IP %s\n", WiFi.localIP().toString().c_str());
}

// Non-blocking: tries at most once every 5 s
bool ensureMqtt() {
  if (client.connected()) return true;
  if (millis() - lastMqttAttempt < 5000) return false;
  lastMqttAttempt = millis();

  String clientId = String(DEVICE_ID) + "-" + String(ESP.getChipId(), HEX);
  Serial.printf("[MQTT] Connecting to %s:%u as %s... ", MQTT_HOST, MQTT_PORT, clientId.c_str());

  bool ok = strlen(MQTT_USER)
              ? client.connect(clientId.c_str(), MQTT_USER, MQTT_PASS)
              : client.connect(clientId.c_str());

  if (ok) {
    Serial.println("connected");
    client.subscribe(topicCommands, 1);   // re-subscribe after every (re)connect
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
  Serial.println("\n[BOOT] Hydroponic simulator (ESP8266)");

  randomSeed(analogRead(A0));

  // Topics. The commands topic matches what the backend publishes to.
  // Telemetry topic is an ASSUMPTION: copy the value from your original sketch if it differs.
  snprintf(topicTelemetry, sizeof(topicTelemetry), "hydro/%s/telemetry", DEVICE_ID);
  snprintf(topicCommands,  sizeof(topicCommands),  "hydro/%s/commands",  DEVICE_ID);

  connectWifi();
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");   // needed to honour command expires_at

  client.setServer(MQTT_HOST, MQTT_PORT);
  client.setBufferSize(512);   // default 256 bytes is tight
  client.setCallback(mqttCallback);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) connectWifi();

  if (ensureMqtt()) client.loop();

  unsigned long now = millis();
  if (client.connected() && now - lastTelemetryMs >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryMs = now;
    generate24HourTelemetry();
  }
}
