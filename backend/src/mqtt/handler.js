import mqtt from "mqtt";
import mqttClient from "../config/mqtt_broker.js";

const TELEMETRY_TOPIC = 'hydro/system1/telemetry';

export const initMQTTHandler = ()=>{
    mqttClient.subscribe(TELEMETRY_TOPIC);

    mqttClient.on('message', async (topic,message)=>{
        try {
            if(topic == TELEMETRY_TOPIC){
                const msg = JSON.parse(message.toString());
                console.log(msg);
            }
        } catch (error) {
            console.error("  MQTT parsing error",error.message);
        }
    })
}