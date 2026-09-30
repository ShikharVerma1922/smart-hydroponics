#include "ESP8266WiFi.h"
#include "PubSubClient.h"
#include "ArduinoJson.h"
#include "secrets.h"

// Use onboard LED (D4 / GPIO 2) as visual feedback for commands
#define ONBOARD_LED 2

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastTelemetryMillis = 0;
const unsigned long TELEMETRY_INTERVAL_MS = 10000; // 10 seconds

// Dynamic MQTT Topics
char topicTelemetry[64];
char topicCommands[64];

void setupWiFi() {
  delay(10);
  Serial.println();
  Serial.print("[WiFi] Connecting to: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("[WiFi] Connected! IP address: ");
  Serial.println(WiFi.localIP());
}

// Inbound MQTT message callback (Commands from Express backend)
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.println();
  Serial.print("[MQTT Inbound] Topic: ");
  Serial.println(topic);

  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, payload, length);

  if (error) {
    Serial.print("[JSON Error] Parse failed: ");
    Serial.println(error.c_str());
    return;
  }

  // Actuator Run Command: hydro/{deviceId}/commands
  if (strcmp(topic, topicCommands) == 0) {
    const char* command  = doc["command"];
    const char* pumpType = doc["pump_type"];
    long durationMs      = doc["duration_ms"];

    Serial.printf("[Actuator] Command: %s | Pump: %s | Duration: %ld ms\n", 
                  command, pumpType, durationMs);

    if (strcmp(command, "RUN_PUMP") == 0 && durationMs > 0) {
      Serial.println("[Actuator] >> TURNING PUMP ON (LED ON) <<");
      digitalWrite(ONBOARD_LED, LOW); // Active-LOW: LOW turns LED ON
      
      delay(durationMs); // Simulated pulse
      
      digitalWrite(ONBOARD_LED, HIGH); // Turn LED OFF
      Serial.println("[Actuator] >> PUMP OFF (Cycle Complete) <<");
    }
  }
}

void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("[MQTT] Connecting to broker at ");
    Serial.print(MQTT_BROKER);
    Serial.print("...");

    String clientId = "ESP8266-" + String(ESP.getChipId(), HEX);

    if (client.connect(clientId.c_str())) {
      Serial.println(" CONNECTED!");

      // Subscribe to command topic for this device
      client.subscribe(topicCommands, 1);
      Serial.print("[MQTT] Subscribed to: ");
      Serial.println(topicCommands);
    } else {
      Serial.print(" FAILED, rc=");
      Serial.print(client.state());
      Serial.println(" -> Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

void publishTelemetry() {
  StaticJsonDocument<256> doc;
  doc["device_id"] = DEVICE_ID;

  JsonObject sensors = doc.createNestedObject("sensors");
  sensors["ph"]              = 6.20;
  sensors["ec_ms_cm"]        = 1.40;
  sensors["water_temp_c"]    = 22.1;
  sensors["air_temp_c"]      = 24.8;
  sensors["humidity_pct"]    = 60.5;
  sensors["water_level_pct"] = 80.0;

  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer);

  client.publish(topicTelemetry, jsonBuffer);
  Serial.print("[MQTT Outbound] Published Telemetry -> ");
  Serial.println(jsonBuffer);
}

void setup() {
  Serial.begin(115200);

  // Initialize LED
  pinMode(ONBOARD_LED, OUTPUT);
  digitalWrite(ONBOARD_LED, HIGH); // Turn LED OFF initially

  // Build topic strings
  snprintf(topicTelemetry, sizeof(topicTelemetry), "hydro/%s/telemetry", DEVICE_ID);
  snprintf(topicCommands, sizeof(topicCommands), "hydro/%s/commands", DEVICE_ID);

  setupWiFi();

  client.setServer(MQTT_BROKER, MQTT_PORT);
  client.setCallback(mqttCallback);
}

void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop(); // Keeps connection alive and handles inbound packets

  // Send a telemetry packet every 10 seconds
  unsigned long currentMillis = millis();
  if (currentMillis - lastTelemetryMillis >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryMillis = currentMillis;
    publishTelemetry();
  }
}