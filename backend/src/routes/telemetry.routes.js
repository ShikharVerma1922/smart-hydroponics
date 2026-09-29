import express from 'express';
import {
  getHistoricalTelemetry,
  getLatestTelemetry,
} from '../services/influxQuery.service.js';

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
      return res.status(404).json({
        success: false,
        message: 'No telemetry recorded yet',
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('[Telemetry] Latest error:', error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/telemetry/history
 *
 * Example:
 * /api/telemetry/history?deviceId=esp32_node_01&range=6h&interval=5m
 */
router.get('/history', async (req, res) => {
  const {
    deviceId = 'esp32_node_01',
    range = '24h',
    interval = '5m',
  } = req.query;

  const allowedRanges = [
    '15m',
    '1h',
    '6h',
    '24h',
    '7d',
    '30d',
  ];

  const allowedIntervals = [
    '1m',
    '5m',
    '15m',
    '30m',
    '1h',
  ];

  if (!allowedRanges.includes(range)) {
    return res.status(400).json({
      success: false,
      error: `Invalid range. Allowed values: ${allowedRanges.join(', ')}`,
    });
  }

  if (!allowedIntervals.includes(interval)) {
    return res.status(400).json({
      success: false,
      error: `Invalid interval. Allowed values: ${allowedIntervals.join(', ')}`,
    });
  }

  try {
    const history = await getHistoricalTelemetry(
      deviceId,
      range,
      interval
    );

    return res.json({
      success: true,
      deviceId,
      range,
      interval,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error('[Telemetry] History error:', error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;