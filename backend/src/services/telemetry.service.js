import { writeApi } from "../config/influx.js";
import { Point } from "@influxdata/influxdb-client";

// Rounds any input value to specified decimal places safely
const roundTo = (val, decimals = 2) => parseFloat(Number(val).toFixed(decimals));

export async function recordTelemetry(payload) {
  try {
    const rawSensors = payload.sensors || payload;

    const ph = roundTo(rawSensors.ph ?? 7.0);
    const ec = roundTo(rawSensors.ec_ms_cm ?? rawSensors.ec ?? 0.0);
    const temp = roundTo(rawSensors.water_temp_c ?? rawSensors.temp ?? 24.0);
    const level = roundTo(rawSensors.water_level_pct ?? rawSensors.level ?? 100.0);

    const point = new Point('sensor_telemetry')
      .tag('device_id', payload.device_id || 'esp32_node_01')
      .tag('circulation_pump', payload.circulation_pump_state || 'ON')
      .floatField('ph', ph)
      .floatField('ec_ms_cm', ec)
      .floatField('water_temp_c', temp)
      .floatField('water_level_pct', level)
      .timestamp(new Date());

    writeApi.writePoint(point);
    await writeApi.flush();

    console.log(`[InfluxDB] Stored -> pH: ${ph} | EC: ${ec} | Level: ${level}%`);
  } catch (error) {
    console.error('Failed to write telemetry to InfluxDB:', error);
  }
}