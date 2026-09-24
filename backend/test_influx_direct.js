// backend/test-influx-direct.js
import { InfluxDB, Point } from '@influxdata/influxdb-client';

const url = 'http://localhost:8086';
const token = 'hydro_admin_token';
const org = 'hydro_org';
const bucket = 'hydro_telemetry';

const client = new InfluxDB({ url, token });
const writeApi = client.getWriteApi(org, bucket, 'ms');
const queryApi = client.getQueryApi(org);

async function testDirect() {
  console.log('1. Writing single test point directly to InfluxDB...');

  const point = new Point('sensor_telemetry')
    .tag('device_id', 'esp32_test_node')
    .floatField('ph', 6.45)
    .floatField('ec_ms_cm', 1.42)
    .timestamp(new Date());

  writeApi.writePoint(point);

  // close() flushes all pending writes AND resolves only after the server acknowledges
  await writeApi.close();
  console.log('2. Point successfully written and acknowledged by server.');

  console.log('3. Querying InfluxDB...');
  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: -1h)
      |> filter(fn: (r) => r._measurement == "sensor_telemetry")
      |> filter(fn: (r) => r.device_id == "esp32_test_node")
  `;

  let found = 0;
  await new Promise((resolve, reject) => {
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row);
        console.log(`   Field: ${o._field} = ${o._value}`);
        found++;
      },
      error(err) {
        reject(err);
      },
      complete() {
        resolve();
      },
    });
  });

  if (found > 0) {
    console.log('\n SUCCESS: InfluxDB read and write pipeline works perfectly.');
  } else {
    console.log('\n FAILED: Query returned 0 rows.');
  }
}

testDirect().catch((err) => {
  console.error('\n Error during direct test:', err);
});