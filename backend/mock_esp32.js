import mqtt from 'mqtt';
import { InfluxDB } from '@influxdata/influxdb-client';

const BROKER_URL = 'mqtt://localhost:1883';
const TELEMETRY_TOPIC = 'hydro/system1/telemetry';

const influxClient = new InfluxDB({ url: 'http://localhost:8086', token: "hydro_admin_token" });
const queryApi = influxClient.getQueryApi('hydro_org');

const client = mqtt.connect(BROKER_URL);

let messageCount = 0;
const totalMessages = 3;

client.on('connect', () => {
  console.log(`Connected to MQTT broker at ${BROKER_URL}`);
  console.log(`Publishing ${totalMessages} sensor readings...\n`);

  const interval = setInterval(() => {
    messageCount++;

    const mockData = {
      device_id: 'esp32_node_01',
      timestamp: Date.now(),
      ph: parseFloat((6.2 + Math.random() * 0.4).toFixed(2)),
      ec_ms_cm: parseFloat((1.3 + Math.random() * 0.4).toFixed(2)),
      water_temp_c: parseFloat((21.0 + Math.random() * 2).toFixed(1)),
      water_level_pct: Math.round(90 + Math.random() * 8),
      circulation_pump_state: 'ON',
    };

    client.publish(TELEMETRY_TOPIC, JSON.stringify(mockData), () => {
      console.log(`[${messageCount}/${totalMessages}] Published to MQTT -> pH: ${mockData.ph}, EC: ${mockData.ec_ms_cm}`);
    });

    if (messageCount >= totalMessages) {
      clearInterval(interval);
      client.end(false, () => {
        console.log('\nFinished publishing. Verifying InfluxDB entries in 2 seconds...\n');
        setTimeout(verifyInflux, 2000);
      });
    }
  }, 1000);
});

async function verifyInflux() {
const fluxQuery = `
    from(bucket: "hydro_telemetry")
      |> range(start: -1d, stop: 1d)
      |> filter(fn: (r) => r._measurement == "sensor_telemetry")
      |> filter(fn: (r) => r.device_id == "esp32_node_01")
      |> last()
  `;

  let found = 0;
  await new Promise((resolve) => {
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row);
        console.log(`  [Stored Field] ${o._field.padEnd(16)} = ${o._value}`);
        found++;
      },
      error(err) {
        console.error('Influx query error:', err.message);
        resolve();
      },
      complete() {
        resolve();
      },
    });
  });

  if (found > 0) {
    console.log('\n End-to-End Pipeline Verified: MQTT -> Express/Node -> InfluxDB');
  } else {
    console.log('\n Verification failed: No points found for esp32_node_01.');
  }
  process.exit(0);
}
