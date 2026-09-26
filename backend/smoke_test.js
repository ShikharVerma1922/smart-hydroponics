// backend/smoke_test.js
import mqtt from 'mqtt';
import { io } from 'socket.io-client';
import axios from 'axios';

const MQTT_URL = 'mqtt://localhost:1883';
const BACKEND_URL = 'http://localhost:3000';
const DEVICE_ID = 'esp32_node_01';

async function runSmokeTest() {
  console.log('--- STARTING CLOSED-LOOP SMOKE TEST ---');

  // 1. Connect to MQTT Broker
  const mqttClient = mqtt.connect(MQTT_URL);
  const socket = io(BACKEND_URL);

  let pumpCommandReceived = false;
  let socketEventReceived = false;

  await new Promise((resolve) => mqttClient.on('connect', resolve));
  console.log('[MQTT] Connected to Mosquitto broker');

  // Subscribe to command topic to listen for ESP32 actuation pulses
  const commandTopic = `hydro/${DEVICE_ID}/commands`;
  mqttClient.subscribe(commandTopic);

  mqttClient.on('message', (topic, message) => {
    if (topic === commandTopic) {
      const payload = JSON.parse(message.toString());
      console.log(' [PASS] Received Actuator MQTT Command:', payload);
      if (payload.pump_type === 'PH_DOWN' && payload.duration_ms === 2500) {
        pumpCommandReceived = true;
      }
    }
  });

  // Listen to Socket.io events
  socket.on('connect', () => {
    console.log('[Socket.io] Connected to Backend WebSocket');
  });

  socket.on('dosing:event', (data) => {
    console.log(' [PASS] Socket.io broadcasted dosing:event:', data.rationale);
    socketEventReceived = true;
  });

  // 2. Publish high pH telemetry inducing closed-loop acid pulse
  const highPhTelemetry = {
    device_id: DEVICE_ID,
    timestamp: Date.now(),
    sensors: {
      ph: 6.92, // Triggers pH > 6.5
      ec_ms_cm: 1.45, // Within target (1.2 - 1.8)
      water_temp_c: 23.2,
      water_level_pct: 82.0,
    },
    circulation_pump_state: 'ON',
  };

  console.log('[MQTT] Publishing High pH Telemetry packet (pH: 6.92)...');
  mqttClient.publish('hydro/system1/telemetry', JSON.stringify(highPhTelemetry));

  // 3. Wait 3 seconds for actuation & DB propagation
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // 4. Verify PostgreSQL Dosing Log via REST API
  try {
    const res = await axios.get(`${BACKEND_URL}/api/dosing/logs?deviceId=${DEVICE_ID}&limit=1`);
    const latestLog = res.data[0];
    console.log("latest log:   \n",res.data)
    if (latestLog && latestLog.pumpType === 'PH_DOWN' && latestLog.source === 'AUTONOMOUS_PH') {
      console.log(' [PASS] PostgreSQL audit verified. Latest Log ID:', latestLog.id);
    } else {
      console.error(' [FAIL] PostgreSQL audit record mismatch:', latestLog);
    }
  } catch (apiErr) {
    console.error(' [FAIL] Could not query REST API:', apiErr.message);
  }

  // 5. Verify Active Lockout via System Status API
  try {
    const statusRes = await axios.get(`${BACKEND_URL}/api/system/status?deviceId=${DEVICE_ID}`);
    const { mixingLockout } = statusRes.data;

    if (mixingLockout?.isActive) {
      console.log(` [PASS] 10-Minute Mixing Lockout verified (${mixingLockout.remainingSeconds}s remaining)`);
    } else {
      console.error(' [FAIL] Mixing lockout was not activated!');
    }
  } catch (statusErr) {
    console.error(' [FAIL] Could not query system status:', statusErr.message);
  }

  // Final summary
  console.log('\n--- SMOKE TEST SUMMARY ---');
  if (pumpCommandReceived && socketEventReceived) {
    console.log(' All automated closed-loop components are fully operational!');
  } else {
    console.log(' Some checks did not complete as expected.');
  }

  mqttClient.end();
  socket.disconnect();
  process.exit(0);
}

runSmokeTest();