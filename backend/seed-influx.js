// backend/seed-influx.js
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.INFLUX_URL || 'http://localhost:8086';
const token = process.env.INFLUX_TOKEN || 'hydro_admin_token';
const org = process.env.INFLUX_ORG || 'hydro_org';
const bucket = process.env.INFLUX_BUCKET || 'hydro_telemetry';

const client = new InfluxDB({ url, token });
const writeApi = client.getWriteApi(org, bucket, 'ms');

const roundTo = (val, dec = 2) => parseFloat(Number(val).toFixed(dec));

async function seedData() {
  console.log(`Starting InfluxDB telemetry seeding to [${bucket}]...`);

  const totalHours = 24;
  const intervalMinutes = 5; // 1 data point every 5 mins = 288 points
  const totalPoints = (totalHours * 60) / intervalMinutes;

  const now = Date.now();
  const startTime = now - totalHours * 60 * 60 * 1000;

  let basePh = 5.9;
  let baseEc = 1.65;
  let baseLevel = 98.0;

  for (let i = 0; i <= totalPoints; i++) {
    const pointTime = new Date(startTime + i * intervalMinutes * 60 * 1000);

    // Dynamic drifting formulas
    const noise = (Math.random() - 0.5) * 0.04;
    
    // pH drifts up gradually over 24h
    const ph = roundTo(basePh + (i / totalPoints) * 0.55 + noise);

    // EC depletes slightly over 24h as plants feed
    const ec = roundTo(baseEc - (i / totalPoints) * 0.3 + noise);

    // Temperature follows a smooth sine wave (cooler at night, warmer mid-day)
    const tempWave = Math.sin((i / totalPoints) * 2 * Math.PI - Math.PI / 2);
    const temp = roundTo(23.0 + tempWave * 1.8 + noise);

    // Water level decreases gradually
    const level = roundTo(baseLevel - (i / totalPoints) * 9.5 + noise * 2);

    const point = new Point('sensor_telemetry')
      .tag('device_id', 'esp32_node_01')
      .tag('circulation_pump', 'ON')
      .floatField('ph', ph)
      .floatField('ec_ms_cm', ec)
      .floatField('water_temp_c', temp)
      .floatField('water_level_pct', level)
      .timestamp(pointTime);

    writeApi.writePoint(point);
  }

  try {
    console.log(`Flushing ${totalPoints} generated points to InfluxDB...`);
    await writeApi.close();
    console.log('Seeding complete! 24 hours of 5-minute intervals stored on disk.');
  } catch (err) {
    console.error('Failed to flush seed data to InfluxDB:', err);
  }
}

seedData();