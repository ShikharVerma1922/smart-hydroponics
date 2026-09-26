import mqttClient from "../config/mqtt_broker.js";
import {recordTelemetry} from "../services/telemetry.service.js";
import { emitTelemetryUpdate } from "../socket.js";
import {handleIncomingTelemetry} from "../services/dosing.service.js"
import { recordHeartbeat } from "../services/heartbeat.service.js";

const TELEMETRY_TOPIC = 'hydro/+/telemetry';

// in memory cache
export let latestTelemetryCache = {
  device_id: 'esp32_node_01',
  sensors: { ph: 7.0, ec_ms_cm: 0.0, water_temp_c: 24.0, water_level_pct: 100 },
  circulation_pump_state: 'ON',
  lastUpdated: null,
};

export const initMQTTHandler = ()=>{
    mqttClient.subscribe(TELEMETRY_TOPIC, (err) => {
        if (err) console.error('Subscription error:', err);
        else console.log(`Subscribed to: ${TELEMETRY_TOPIC}`);
    });
    mqttClient.on('message', async (topic,message)=>{
        try {
            if(topic.endsWith('/telemetry')){
                const data = JSON.parse(message.toString());
               const rawSensors = data.sensors || data;

               await recordHeartbeat(data.device_id);

                latestTelemetryCache = {
                device_id: data.device_id || 'esp32_node_01',
                sensors: {
                    ph: parseFloat(rawSensors.ph ?? 7.0),
                    ec_ms_cm: parseFloat(rawSensors.ec_ms_cm ?? rawSensors.ec ?? 0.0),
                    water_temp_c: parseFloat(rawSensors.water_temp_c ?? rawSensors.temp ?? 24.0),
                    water_level_pct: parseFloat(rawSensors.water_level_pct ?? rawSensors.level ?? 100.0),
                },
                circulation_pump_state: data.circulation_pump_state || 'ON',
                lastUpdated: new Date().toISOString(),
                };

                await recordTelemetry(data);
                emitTelemetryUpdate(data);
                await handleIncomingTelemetry(data);
            }
        } catch (error) {
            console.error("  MQTT parsing error",error.message);
        }
    })
}

// export async function dispatchPumpPulse(pumpType, durationMs, source, rationale){
//     const payload = {
//     command: 'RUN_PUMP',
//     pump_type: pumpType,      
//     duration_ms: durationMs,
//   };

//   mqttClient.publish(COMMAND_TOPIC, JSON.stringify(payload));
//   console.log(`[Actuator] Dispatched ${pumpType} for ${durationMs}ms`);

//   await prisma.dosingLog.create({
//     data: {
//       source: source,
//       pumpType: pumpType,
//       durationMs: durationMs,
//       rationale: rationale,
//       mixingLockoutMin: 10,
//     },
//   });
// }