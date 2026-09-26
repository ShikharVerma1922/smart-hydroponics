// backend/src/routes/actuator.routes.js
import express from 'express';
import { prisma } from '../config/prisma.js';
import mqttClient from '../config/mqtt_broker.js';

const router = express.Router();

// Reference to in-memory mixing lockouts or query latest DosingLog
const POST_DOSING_LOCKOUT_MS = 10 * 60 * 1000;

/**
 * POST /api/actuators/manual-pulse
 * Dispatches a manual pump pulse from dashboard buttons
 */
router.post('/manual-pulse', async (req, res) => {
  const { deviceId = 'esp32_node_01', pumpType, durationMs } = req.body;

  // Validate pumpType enum
  const validPumps = ['PH_DOWN', 'NUTRIENT_A', 'NUTRIENT_B'];
  if (!validPumps.includes(pumpType)) {
    return res.status(400).json({
      success: false,
      error: `Invalid pumpType. Must be one of: ${validPumps.join(', ')}`,
    });
  }

  // Enforce safety cap: maximum allowable pulse <= 5000ms
  const requestedDuration = parseInt(durationMs, 10);
  if (isNaN(requestedDuration) || requestedDuration <= 0 || requestedDuration > 5000) {
    return res.status(400).json({
      success: false,
      error: 'durationMs must be between 100ms and 5000ms for manual overrides.',
    });
  }

  try {
    // Check if mixing lockout is running for this device
    const lastDose = await prisma.dosingLog.findFirst({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
    });

    const now = Date.now();
    if (lastDose && now - new Date(lastDose.timestamp).getTime() < POST_DOSING_LOCKOUT_MS) {
      const remainingSec = Math.round(
        (POST_DOSING_LOCKOUT_MS - (now - new Date(lastDose.timestamp).getTime())) / 1000
      );
      return res.status(429).json({
        success: false,
        error: `Actuator locked. 10-minute mixing lockout active (${remainingSec}s remaining).`,
      });
    }

    // Publish MQTT actuator command to device-specific topic
    const commandPayload = {
      command: 'RUN_PUMP',
      pump_type: pumpType,
      duration_ms: requestedDuration,
      timestamp: now,
    };

    mqttClient.publish(`hydro/${deviceId}/commands`, JSON.stringify(commandPayload), { qos: 1 });

    // Record audit trail in PostgreSQL
    const log = await prisma.dosingLog.create({
      data: {
        deviceId,
        pumpType,
        durationMs: requestedDuration,
        source: 'MANUAL_OVERRIDE',
        rationale: 'Manual calibration pulse dispatched via frontend dashboard.',
        mixingLockoutMin: 10,
      },
    });

    res.status(200).json({
      success: true,
      message: `Dispatched \({pumpType} for\){requestedDuration}ms`,
      data: log,
    });
  } catch (error) {
    console.error('Manual pulse error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/actuators/circulation
 * Payload: { deviceId: "esp32_node_01", mode: "CONTINUOUS" | "INTERVAL" | "OFF", runMin: 15, restMin: 15 }
 */
router.post('/circulation', (req, res) => {
  const { deviceId = 'esp32_node_01', mode = 'CONTINUOUS', runMin = 15, restMin = 15 } = req.body;

  const validModes = ['CONTINUOUS', 'INTERVAL', 'OFF'];
  if (!validModes.includes(mode)) {
    return res.status(400).json({
      success: false,
      error: `Invalid mode. Must be one of: ${validModes.join(', ')}`,
    });
  }

  const payload = {
    mode,
    run_min: Number(runMin),
    rest_min: Number(restMin),
    timestamp: Date.now(),
  };

  // Publish to dynamic MQTT circulation topic
  const topic = `hydro/${deviceId}/circulation/set`;
  mqttClient.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
    if (err) {
      console.error(`[MQTT Error] Circulation set failed:`, err.message);
      return res.status(500).json({ success: false, error: err.message });
    }

    console.log(`[Actuator MQTT] [\({deviceId}] Set circulation ->\){mode}`);
    res.json({
      success: true,
      message: `Circulation schedule updated to ${mode}`,
      data: payload,
    });
  });
});

export default router;