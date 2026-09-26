// backend/src/routes/actuator.routes.js
import express from 'express';
import { prisma } from '../config/prisma.js';
import mqttClient from '../config/mqtt_broker.js';
import { setDeviceLockout } from '../services/dosing.service.js';
import { emitDosingEvent, emitSystemLockout } from '../socket.js';
import { getIO } from '../socket.js';

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

    setDeviceLockout(deviceId, POST_DOSING_LOCKOUT_MS);

    const rationale = `Manual calibration pulse of ${pumpType} (${requestedDuration}ms) triggered via dashboard.`;

    // Record audit trail in PostgreSQL
    const log = await prisma.dosingLog.create({
      data: {
        deviceId,
        pumpType,
        durationMs: requestedDuration,
        source: 'MANUAL_OVERRIDE',
        rationale,
        mixingLockoutMin: 10,
      },
    });

    emitDosingEvent({
      deviceId,
      pumpType,
      durationMs: requestedDuration,
      source: 'MANUAL_OVERRIDE',
      rationale,
      timestamp: now,
    });

    emitSystemLockout({
      deviceId,
      isActive: true,
      remainingSeconds: 600,
      rationale: 'Post-manual dosing mixing lockout active.',
    });

    res.status(200).json({
      success: true,
      message: `Dispatched ${pumpType} for ${requestedDuration}ms`,
      data: log,
    });
  } catch (error) {
    console.error('Manual pulse error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/actuators/circulation
 * Configures the submersible circulation pump (continuous aeration, duty-cycle intervals, or off)
 */
router.post('/circulation', async (req, res) => {
  const { deviceId = 'esp32_node_01', mode = 'CONTINUOUS', runMin = 15, restMin = 15 } = req.body;

  // 1. Validate circulation modes
  const validModes = ['CONTINUOUS', 'INTERVAL', 'OFF'];
  if (!validModes.includes(mode)) {
    return res.status(400).json({
      success: false,
      error: `Invalid mode. Must be one of: ${validModes.join(', ')}`,
    });
  }

  // 2. Validate timing parameters for INTERVAL mode
  const parsedRunMin = parseInt(runMin, 10);
  const parsedRestMin = parseInt(restMin, 10);

  if (mode === 'INTERVAL') {
    if (isNaN(parsedRunMin) || parsedRunMin <= 0 || isNaN(parsedRestMin) || parsedRestMin <= 0) {
      return res.status(400).json({
        success: false,
        error: 'For INTERVAL mode, runMin and restMin must be positive integers.',
      });
    }
  }

  try {
    // 3. Verify target device exists
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        error: `Device with ID "${deviceId}" not found.`,
      });
    }

    const timestamp = Date.now();
    const payload = {
      mode,
      run_min: mode === 'INTERVAL' ? parsedRunMin : 0,
      rest_min: mode === 'INTERVAL' ? parsedRestMin : 0,
      timestamp,
    };

    // 4. Publish MQTT command to hardware
    const topic = `hydro/${deviceId}/circulation/set`;
    
    await new Promise((resolve, reject) => {
      mqttClient.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    console.log(`[Actuator MQTT] [${deviceId}] Set circulation -> ${mode}`);

    // 5. Broadcast state to connected frontend dashboards via Socket.io
    try {
      const io = getIO();
      io.emit('circulation:update', {
        deviceId,
        mode,
        runMin: payload.run_min,
        restMin: payload.rest_min,
        timestamp,
      });
    } catch (socketErr) {
      console.warn('[Socket Warning] Could not broadcast circulation:update:', socketErr.message);
    }

    // 6. Return response
    return res.json({
      success: true,
      message: `Circulation schedule updated to ${mode}`,
      data: {
        deviceId,
        ...payload,
      },
    });
  } catch (error) {
    console.error(`[Circulation Route Error] [${deviceId}]:`, error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update circulation pump schedule.',
    });
  }
});

export default router;