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

export async function getHistoricalTelemetry(range = '24h', customInterval = null) {
  const windowInterval = customInterval || DEFAULT_INTERVALS[range] || '15m';

  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: -${range})
      |> filter(fn: (r) => r._measurement == "sensor_telemetry")
      |> aggregateWindow(every: ${windowInterval}, fn: mean, createEmpty: false)
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"], desc: false)
      |> keep(columns: ["_time", "device_id", "ph", "ec_ms_cm", "water_temp_c", "water_level_pct"])
  `;

  const rows = [];
  return new Promise((resolve, reject) => {
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row);
        rows.push({
          timestamp: o._time,
          ph: o.ph !== undefined ? parseFloat(Number(o.ph).toFixed(2)) : null,
          ec_ms_cm: o.ec_ms_cm !== undefined ? parseFloat(Number(o.ec_ms_cm).toFixed(2)) : null,
          water_temp_c: o.water_temp_c !== undefined ? parseFloat(Number(o.water_temp_c).toFixed(2)) : null,
          water_level_pct: o.water_level_pct !== undefined ? parseFloat(Number(o.water_level_pct).toFixed(2)) : null,
        });
      },
      error(err) {
        reject(err);
      },
      complete() {
        resolve(rows);
      },
    });
  });
}

export async function getLatestTelemetry() {
  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: -1d, stop: 1d)
      |> filter(fn: (r) => r._measurement == "sensor_telemetry")
      |> last()
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
  `;

  return new Promise((resolve, reject) => {
    let latestRecord = null;
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row);
        latestRecord = {
          timestamp: o._time,
          device_id: o.device_id,
          circulation_pump: o.circulation_pump,
          sensors: {
            ph: o.ph !== undefined ? parseFloat(Number(o.ph).toFixed(2)) : null,
            ec_ms_cm: o.ec_ms_cm !== undefined ? parseFloat(Number(o.ec_ms_cm).toFixed(2)) : null,
            water_temp_c: o.water_temp_c !== undefined ? parseFloat(Number(o.water_temp_c).toFixed(2)) : null,
            water_level_pct: o.water_level_pct !== undefined ? parseFloat(Number(o.water_level_pct).toFixed(2)) : null,
          },
        };
      },
      error(err) {
        reject(err);
      },
      complete() {
        resolve(latestRecord);
      },
    });
  });
}