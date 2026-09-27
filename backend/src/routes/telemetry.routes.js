import express from 'express';
import { getHistoricalTelemetry, getLatestTelemetry } from '../services/influxQuery.service.js';

const router = express.Router();

/**
 * GET /api/telemetry/latest
 * Returns the most recent snapshot stored in InfluxDB
 */
router.get('/latest', async (req, res) => {
  try {
    const { deviceId = 'esp32_node_01' } = req.query;
    const data = await getLatestTelemetry(deviceId);
    if (!data) {
      return res.status(404).json({ success: false, message: 'No telemetry recorded yet' });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/telemetry/history?range=24h&interval=15m
 * Returns downsampled time-series array tailored for charts
 */
router.get('/history', async (req, res) => {
  const { range = '24h', interval } = req.query;

  // Whitelist allowable ranges to prevent malformed Flux injections
  const allowedRanges = ['15m', '1h', '6h', '24h', '7d', '30d'];
  if (!allowedRanges.includes(range)) {
    return res.status(400).json({
      success: false,
      error: `Invalid range. Allowed values: ${allowedRanges.join(', ')}`,
    });
  }

  try {
    const { deviceId = 'esp32_node_01', range = '24h', interval = '5m' } = req.query;
    const history = await getHistoricalTelemetry(deviceId, range, interval);
    res.json({
      success: true,
      range,
      count: history.length,
      data: history,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;