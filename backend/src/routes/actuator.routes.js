import express from 'express';
import { prisma } from '../config/prisma.js';
import mqttClient from '../config/mqtt_broker.js';
import { setDeviceLockout } from '../services/dosing.service.js';
import { emitCirculationUpdate, emitDosingEvent, emitSystemLockout } from '../socket.js';

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

  const validModes = ['CONTINUOUS', 'INTERVAL', 'OFF'];
  if (!validModes.includes(mode)) {
    return res.status(400).json({
      success: false,
      error: `Invalid mode. Must be one of: ${validModes.join(', ')}`,
    });
  }

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
    const timestamp = Date.now();
    const payload = {
      mode,
      run_min: mode === 'INTERVAL' ? parsedRunMin : 0,
      rest_min: mode === 'INTERVAL' ? parsedRestMin : 0,
      timestamp,
    };

    // 1. Update Database (Persist Ground Truth)
    const updatedDevice = await prisma.device.update({
      where: { id: deviceId },
      data: {
        circulationMode: mode,
        circRunMin: payload.run_min,
        circRestMin: payload.rest_min,
        circUpdatedAt: new Date(timestamp),
      },
    });

    // 2. Publish MQTT command to hardware (Retained = true ensures ESP gets it even if it reconnects)
    const topic = `hydro/${deviceId}/circulation/set`;
    await new Promise((resolve, reject) => {
      mqttClient.publish(topic, JSON.stringify(payload), { qos: 1, retain: true }, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    console.log(`[Actuator MQTT] [\({deviceId}] Set circulation ->\){mode}`);

    // 3. Broadcast live update to all active frontends
    emitCirculationUpdate({
      deviceId,
      mode,
      runMin: payload.run_min,
      restMin: payload.rest_min,
      timestamp,
    });

    return res.json({
      success: true,
      message: `Circulation schedule updated to ${mode}`,
      data: {
        deviceId,
        mode: updatedDevice.circulationMode,
        runMin: updatedDevice.circRunMin,
        restMin: updatedDevice.circRestMin,
        timestamp,
      },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: `Device "${deviceId}" not found.` });
    }
    console.error(`[Circulation Route Error] [${deviceId}]:`, error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update circulation pump schedule.',
    });
  }
});

router.get('/circulation/:deviceId', async (req, res) => {
  const { deviceId } = req.params;
  try {
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      select: {
        id: true,
        circulationMode: true,
        circRunMin: true,
        circRestMin: true,
        circUpdatedAt: true,
      },
    });

    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    return res.json({
      success: true,
      data: {
        deviceId: device.id,
        mode: device.circulationMode,
        runMin: device.circRunMin,
        restMin: device.circRestMin,
        updatedAt: device.circUpdatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;