import { queryApi } from '../config/influx.js';
import dotenv from 'dotenv';
dotenv.config();

const bucket = process.env.INFLUX_BUCKET || 'hydro_telemetry';

const DEFAULT_INTERVALS = {
  '15m': '10s',
  '1h': '1m',
  '6h': '5m',
  '24h': '15m',
  '7d': '1h',
  '30d': '6h',
};

export async function getHistoricalTelemetry(deviceId = 'esp32_node_01', range = '24h', customInterval = null) {
  const windowInterval = customInterval || DEFAULT_INTERVALS[range] || '5m';

  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: -${range})
      |> filter(fn: (r) => r._measurement == "sensor_telemetry" and r.deviceId == "${deviceId}")
      |> aggregateWindow(every: ${windowInterval}, fn: mean, createEmpty: false)
      |> pivot(rowKey:["_time", "deviceId"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"], desc: false)
      |> keep(columns: ["_time", "deviceId", "ph", "ec_ms_cm", "water_temp_c", "water_level_pct", "air_temp_c", "humidity_pct"])
  `;

  const rows = [];
  return new Promise((resolve, reject) => {
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row);
        rows.push({
          timestamp: o._time,
          deviceId: o.deviceId || deviceId,
          ph: o.ph !== undefined && o.ph !== null ? parseFloat(Number(o.ph).toFixed(2)) : null,
          ec_ms_cm: o.ec_ms_cm !== undefined && o.ec_ms_cm !== null ? parseFloat(Number(o.ec_ms_cm).toFixed(2)) : null,
          water_temp_c: o.water_temp_c !== undefined && o.water_temp_c !== null ? parseFloat(Number(o.water_temp_c).toFixed(2)) : null,
          water_level_pct: o.water_level_pct !== undefined && o.water_level_pct !== null ? parseFloat(Number(o.water_level_pct).toFixed(2)) : null,
          air_temp_c: o.air_temp_c !== undefined && o.air_temp_c !== null ? parseFloat(Number(o.air_temp_c).toFixed(2)) : null,
          humidity_pct: o.humidity_pct !== undefined && o.humidity_pct !== null ? parseFloat(Number(o.humidity_pct).toFixed(2)) : null,
        });
      },
      error(err) {
        console.error(`[InfluxDB Query Error] getHistoricalTelemetry failed for ${deviceId}:`, err.message);
        reject(err);
      },
      complete() {
        resolve(rows);
      },
    });
  });
}

export async function getLatestTelemetry(deviceId = 'esp32_node_01') {
  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: -7d)
      |> filter(fn: (r) => r._measurement == "sensor_telemetry" and r.deviceId == "${deviceId}")
      |> last()
      |> pivot(rowKey:["_time", "deviceId"], columnKey: ["_field"], valueColumn: "_value")
  `;

  return new Promise((resolve, reject) => {
    let latestRecord = null;
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row);
        latestRecord = {
          timestamp: o._time,
          deviceId: o.deviceId || deviceId,
          circulation_pump_state: o.circulation_pump_state || o.circulation_pump || 'ON',
          sensors: {
            ph: o.ph !== undefined && o.ph !== null ? parseFloat(Number(o.ph).toFixed(2)) : null,
            ec_ms_cm: o.ec_ms_cm !== undefined && o.ec_ms_cm !== null ? parseFloat(Number(o.ec_ms_cm).toFixed(2)) : null,
            water_temp_c: o.water_temp_c !== undefined && o.water_temp_c !== null ? parseFloat(Number(o.water_temp_c).toFixed(2)) : null,
            water_level_pct: o.water_level_pct !== undefined && o.water_level_pct !== null ? parseFloat(Number(o.water_level_pct).toFixed(2)) : null,
            air_temp_c: o.air_temp_c !== undefined && o.air_temp_c !== null ? parseFloat(Number(o.air_temp_c).toFixed(2)) : null,
            humidity_pct: o.humidity_pct !== undefined && o.humidity_pct !== null ? parseFloat(Number(o.humidity_pct).toFixed(2)) : null,
          },
        };
      },
      error(err) {
        console.error(`[InfluxDB Query Error] getLatestTelemetry failed for ${deviceId}:`, err.message);
        reject(err);
      },
      complete() {
        resolve(latestRecord);
      },
    });
  });
}