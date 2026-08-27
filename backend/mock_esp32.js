import mqtt from "mqtt";
const client = mqtt.connect("mqtt://localhost:1883");

client.on('connect', ()=>{
    const mockSensorData = {
    device_id: 'esp32_node_01',
    timestamp: Date.now(),
    ph: 6.5,
    ec: 1.5,
    water_level_pct: 92
  };

  client.publish('hydro/system1/telemetry', JSON.stringify(mockSensorData), ()=>{
    console.log("  Sent mock sensor data to MQTT");
    client.end();
  })
})