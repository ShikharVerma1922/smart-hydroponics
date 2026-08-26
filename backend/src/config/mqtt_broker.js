import mqtt from 'mqtt'

const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL);
mqttClient.on('connect', ()=>{
    console.log("  MQTT broker connected");
})

export default mqttClient;