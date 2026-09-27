import { prisma } from '../config/prisma.js';
import mqttClient from '../config/mqtt_broker.js';
import { emitDosingEvent, emitSystemAlert, emitSystemLockout, emitAlertResolved, emitDosingLogged, emitVisionCooldown } from '../socket.js';
import { getLatestTelemetry } from './influxQuery.service.js';

// --- Per-Device In-Memory Mixing Cooldown Tracking ---
const POST_DOSING_LOCKOUT_MS = 10 * 60 * 1000;  
const deviceMixingLockouts = new Map();
const VISION_LOCKOUT_MS = 24 * 60 * 60 * 1000; 

/**
 * Creates or updates an active unresolved SystemAlert record scoped to a specific device.
 */
async function triggerSystemAlert(deviceId, alertType, severity, message) {
  try {
    const existing = await prisma.systemAlert.findFirst({
      where: { deviceId, alertType, isResolved: false },
    });

    if (!existing) {
      const createdAlert = await prisma.systemAlert.create({
        data: {
          deviceId,
          alertType,
          severity,
          message,
          isResolved: false,
        },
      });

      emitSystemAlert({
        id: createdAlert.id,
        deviceId,
        alertType,
        severity,
        message,
        timestamp: Date.now(),
      });
      console.warn(`[System Alert Created] [\({deviceId}]\){alertType}: ${message}`);
    }
  } catch (err) {
    console.error(`[System Alert DB Error] Failed to persist \({alertType} for\){deviceId}:`, err.message);
  }
}

/**
 * Automatically resolves active alerts when sensor parameters return to nominal bounds.
 */
async function autoResolveAlert(deviceId, alertType) {
  try {
    const unresolvedAlerts = await prisma.systemAlert.findMany({
      where: { deviceId, alertType, isResolved: false },
    });

    if (unresolvedAlerts.length > 0) {
      await prisma.systemAlert.updateMany({
        where: { deviceId, alertType, isResolved: false },
        data: {
          isResolved: true,
          resolvedAt: new Date(),
          resolvedBy: 'SYSTEM',
        },
      });

      // Broadcast alert resolution to remove banners from dashboard
      try {
        emitAlertResolved({
          deviceId,
  alertType,
  resolvedBy: 'SYSTEM',
  timestamp: Date.now(),
});
      } catch (socketErr) {
        console.warn(`[Socket Warning] alert:resolved emit failed:`, socketErr.message);
      }
    }
  } catch (err) {
    console.error(`[System Alert Resolve Error] Failed to resolve \({alertType} for\){deviceId}:`, err.message);
  }
}

/**
 * Publishes an MQTT pulse command to the target device's command topic
 */
async function executePumpPulse(deviceId, pumpType, durationMs, source, rationale, diagnosticReportId = null) {
  const payload = {
    command: 'RUN_PUMP',
    pump_type: pumpType,
    duration_ms: durationMs,
    timestamp: Date.now(),
  };

  const topic = `hydro/${deviceId}/commands`;

  mqttClient.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
    if (err) {
      console.error(`[Actuator MQTT Error] [\({deviceId}] Failed to publish\){pumpType}:`, err.message);
    } else {
      console.log(`[Actuator MQTT] [\({deviceId}] Dispatched ->\){pumpType} for ${durationMs}ms`);
    }
  });

  // 1. Broadcast immediate dosing pulse to update active pump icons/indicators
  emitDosingEvent({
    deviceId,
    pumpType,
    durationMs,
    source,
    rationale,
    timestamp: Date.now(),
  });

  // 2. Set memory lockout and emit system:lockout event
  setDeviceLockout(deviceId, POST_DOSING_LOCKOUT_MS);
  emitSystemLockout({
    deviceId,
    isActive: true,
    remainingSeconds: Math.round(POST_DOSING_LOCKOUT_MS / 1000),
    rationale: `Mixing lockout initiated after ${pumpType} pulse.`,
    lastPump: pumpType,
  });

  try {
    const log = await prisma.dosingLog.create({
      data: {
        deviceId,
        pumpType,
        durationMs,
        source,
        rationale,
        mixingLockoutMin: Math.round(POST_DOSING_LOCKOUT_MS / 60000),
        diagnosticReportId: diagnosticReportId || null,
      },
    });

    // 3. Emit dosing log creation so table feeds update in real time
    try {
   emitDosingLogged({
  deviceId,
  log,
});
    } catch (socketErr) {
      console.warn(`[Socket Warning] dosing:logged emit failed:`, socketErr.message);
    }

    return log;
  } catch (dbErr) {
    console.error(`[Dosing Log DB Error] [${deviceId}]:`, dbErr.message);
  }
}

/**
 * Executes a staggered nutrient dosing routine with a 15-second delay between Part A and Part B.
 */
async function executeStaggeredNutrientDose(deviceId, durationA, durationB, source, rationale, reportId = null) {
  if (durationA > 0) {
    await executePumpPulse(deviceId, 'NUTRIENT_A', durationA, source, rationale, reportId);
  }

  if (durationB > 0) {
    if (durationA > 0) {
      console.log(`[Dosing Engine] [${deviceId}] Enforcing 15-second sequential dilution delay before Part B...`);
      setTimeout(async () => {
        await executePumpPulse(deviceId, 'NUTRIENT_B', durationB, source, rationale, reportId);
      }, 15000);
    } else {
      await executePumpPulse(deviceId, 'NUTRIENT_B', durationB, source, rationale, reportId);
    }
  }
}

/**
 * Core Decision Matrix & Multi-Device Safety Evaluation Function.
 */
export async function evaluateDosingDecision(telemetry, mlReport = null) {
  const now = Date.now();
  const deviceId = telemetry.device_id || 'esp32_node_01';
  const { ph, ec_ms_cm, water_level_pct } = telemetry.sensors;

  const primaryLabel = mlReport?.primaryLabel || mlReport?.primary_label || 'HEALTHY';
  const severity = mlReport?.severity || 'LOW';

  // -------------------------------------------------------------------------
  // 1. PRIORITY SAFETY GATES
  // -------------------------------------------------------------------------

  if (water_level_pct < 15.0) {
    const msg = `Critical tank water level (${water_level_pct}% < 15%). Pumps halted to prevent dry motor burn.`;
    await triggerSystemAlert(deviceId, 'LOW_WATER_LEVEL', 'CRITICAL', msg);
    return {
      status: 'EMERGENCY',
      action: 'NONE',
      rationale: 'Water level < 15%. Kill all pumps to prevent dry motor burn.',
    };
  } else {
    await autoResolveAlert(deviceId, 'LOW_WATER_LEVEL');
  }

  if (ph < 5.5) {
    const msg = `Acidic crash detected (pH ${ph} < 5.5). No pH Up pump available. Manual buffering required.`;
    await triggerSystemAlert(deviceId, 'ACIDIC_CRASH', 'CRITICAL', msg);
    return {
      status: 'LOCKOUT',
      action: 'MANUAL_INTERVENTION_REQUIRED',
      rationale: 'Hard Stop: No pH Up pump. Alert for manual buffering.',
    };
  } else {
    await autoResolveAlert(deviceId, 'ACIDIC_CRASH');
  }

  if (ec_ms_cm > 2.4) {
    const msg = `Osmotic ceiling exceeded (EC ${ec_ms_cm} > 2.4 mS/cm). Manual freshwater dilution required.`;
    await triggerSystemAlert(deviceId, 'OSMOTIC_TOXICITY', 'CRITICAL', msg);
    return {
      status: 'LOCKOUT',
      action: 'MANUAL_INTERVENTION_REQUIRED',
      rationale: 'Hard Stop: Over-concentrated. Alert for manual dilution.',
    };
  } else {
    await autoResolveAlert(deviceId, 'OSMOTIC_TOXICITY');
  }

  const activeLockoutTill = deviceMixingLockouts.get(deviceId) || 0;
  if (now < activeLockoutTill) {
    const remainingSec = Math.round((activeLockoutTill - now) / 1000);
    emitSystemLockout({
      deviceId,
      isActive: true,
      remainingSeconds: remainingSec,
      rationale: `Mixing lockout active: ${remainingSec}s remaining for reservoir homogenization.`,
    });
    return {
      status: 'COOLDOWN',
      action: 'NONE',
      rationale: `Mixing lockout active: ${remainingSec}s remaining for reservoir homogenization.`,
    };
  }

  // -------------------------------------------------------------------------
  // 2. RETRIEVE ACTIVE CROP RECIPE
  // -------------------------------------------------------------------------
  const deviceRecord = await prisma.device.findUnique({
    where: { id: deviceId },
    include: { activeRecipe: true },
  });

  const activeRecipe = deviceRecord?.activeRecipe;
  const targetPhMax = activeRecipe?.targetPhMax ?? 6.5;
  const targetEcMin = activeRecipe?.targetEcMin ?? 1.2;

  // -------------------------------------------------------------------------
  // 3. pH DRIFT CHECK
  // -------------------------------------------------------------------------
  if (ph > targetPhMax) {
    const rationale = ec_ms_cm >= targetEcMin
      ? 'Nutrients present but locked out by pH. Lower pH only.'
      : 'Standard closed-loop acid pulse. Hold nutrient salts.';

    await executePumpPulse(deviceId, 'PH_DOWN', 2500, 'AUTONOMOUS_PH', rationale, null);

    return {
      status: 'DOSED',
      pump: 'PH_DOWN',
      durationMs: 2500,
      rationale,
    };
  }

  // -------------------------------------------------------------------------
  // 4. BIOTIC STRESS OR PATHOGEN CHECK
  // -------------------------------------------------------------------------
  if (primaryLabel === 'BIOTIC_STRESS' || primaryLabel === 'PATHOGEN') {
    const msg = `Biotic stress/pathogen detected (${primaryLabel}). Manual inspection required.`;
    await triggerSystemAlert(deviceId, 'BIOTIC_STRESS', 'HIGH', msg);
    return {
      status: 'NOMINAL',
      action: 'ALERT_DASHBOARD',
      rationale: 'Chemical dosing cannot resolve pests. Flag dashboard alert.',
    };
  }

  // -------------------------------------------------------------------------
  // 5. EVALUATE EC DEFICIT & ML-BIASED DOSING
  // -------------------------------------------------------------------------
  if (ec_ms_cm < targetEcMin) {
    const isVisualCooldownActive =
      mlReport?.cooldownActiveTill && new Date(mlReport.cooldownActiveTill) > new Date();

    // Fallback if cooldown active, no report, healthy, or LOW severity
    if (!mlReport || isVisualCooldownActive || primaryLabel === 'HEALTHY' || severity === 'LOW') {
      const rationale = isVisualCooldownActive
        ? `${Math.round(VISION_LOCKOUT_MS / 3600000)}h visual cooldown active. Balanced 1:1 replenishment.`
        : primaryLabel === 'HEALTHY'
        ? 'Canopy healthy. Balanced 1:1 EC correction.'
        : 'Low symptom confidence. Defaulting to safe 1:1 replenishment.';

      const durationA = 2500;
      const durationB = 2500;

      await executeStaggeredNutrientDose(deviceId, durationA, durationB, 'AUTONOMOUS_EC', rationale, null);

      return {
        status: 'DOSED',
        pumps: { durationA, durationB },
        ratio: '1:1 (2500ms / 2500ms)',
        rationale,
      };
    }

    // ML-Biased Formulations (Maintains ~5000ms total dose volume)
    let durationA = 2500;
    let durationB = 2500;
    let rationale = '';

    const isHighOrCritical = severity === 'HIGH' || severity === 'CRITICAL';

    switch (primaryLabel) {
      case 'NITROGEN_DEFICIENCY':
        durationA = isHighOrCritical ? 3500 : 3000;
        durationB = isHighOrCritical ? 1500 : 2000;
        rationale = `A-Biased (${severity}): Nitrogen/Calcium Nitrate enrichment.`;
        break;

      case 'PHOSPHORUS_DEFICIENCY':
      case 'POTASSIUM_DEFICIENCY':
        durationA = isHighOrCritical ? 1500 : 2000;
        durationB = isHighOrCritical ? 3500 : 3000;
        rationale = `B-Biased (${severity}): Potassium/Phosphate enrichment.`;
        break;

      case 'CALCIUM_DEFICIENCY':
        durationA = isHighOrCritical ? 3750 : 3250;
        durationB = isHighOrCritical ? 1250 : 1750;
        rationale = `A-Biased (${severity}): Elevated Calcium Nitrate with basal Stock B floor.`;
        break;

      case 'MAGNESIUM_DEFICIENCY':
        durationA = isHighOrCritical ? 1250 : 1750;
        durationB = isHighOrCritical ? 3750 : 3250;
        rationale = `B-Biased (${severity}): Elevated Magnesium Sulfate with basal Stock A floor.`;
        break;

      case 'IRON_DEFICIENCY':
        durationA = isHighOrCritical ? 3500 : 3000;
        durationB = isHighOrCritical ? 1500 : 2000;
        rationale = `A-Biased (${severity}): Chelated Iron replenishment.`;
        break;

      default:
        durationA = 2500;
        durationB = 2500;
        rationale = 'Balanced 1:1 replenishment.';
        break;
    }

    await executeStaggeredNutrientDose(deviceId, durationA, durationB, 'ML_BIASED', rationale, mlReport.id);

    // Apply visual lockout timestamp to the active report and broadcast
    const visualCooldownDate = new Date(now + VISION_LOCKOUT_MS);
    await prisma.diagnosticReport.update({
      where: { id: mlReport.id },
      data: {
        cooldownActiveTill: visualCooldownDate,
        actionTaken: rationale,
      },
    });

    try {
emitVisionCooldown({
  deviceId,
  isActive: true,
  reportId: mlReport.id,
  primaryLabel,
  activeTill: visualCooldownDate,
});
    } catch (socketErr) {
      console.warn(`[Socket Warning] vision:cooldown emit failed:`, socketErr.message);
    }

    return {
      status: 'DOSED',
      pumps: { durationA, durationB },
      ratio: `\({durationA}ms /\){durationB}ms`,
      rationale,
    };
  }

  // -------------------------------------------------------------------------
  // 6. FALSE ALARM / DESYNC (EC is already sufficient)
  // -------------------------------------------------------------------------
  if (mlReport && primaryLabel !== 'HEALTHY' && ec_ms_cm >= targetEcMin) {
    const msg = `ML diagnosed \({primaryLabel}, but reservoir EC is optimal (\){ec_ms_cm} >= ${targetEcMin} mS/cm). Nutrients held to prevent burn.`;
    await triggerSystemAlert(deviceId, 'DESYNC_WARNING', 'MODERATE', msg);

    return {
      status: 'OFF',
      action: 'SUPPRESSED',
      rationale: 'ML flags deficiency, but EC is optimal. Lock dosing to prevent burn.',
    };
  }

  // -------------------------------------------------------------------------
  // 7. NOMINAL BASELINE
  // -------------------------------------------------------------------------
  return {
    status: 'BALANCED',
    action: 'NONE',
    rationale: 'System balanced. No dosing action required.',
  };
}

export async function handleIncomingTelemetry(telemetry) {
  const deviceId = telemetry.device_id || 'esp32_node_01';
  const latestReport = await prisma.diagnosticReport.findFirst({
    where: { deviceId },
    orderBy: { timestamp: 'desc' },
  });

  return await evaluateDosingDecision(telemetry, latestReport);
}

export async function handleIncomingDiagnosticReport(diagnosticReport) {
  const deviceId = diagnosticReport.deviceId || 'esp32_node_01';
  const latestTelemetry = await getLatestTelemetry(deviceId);

  if (!latestTelemetry || !latestTelemetry.sensors) {
    console.warn(`[Dosing Engine] [${deviceId}] Awaiting initial sensor telemetry for ML report.`);
    return { status: 'DEFERRED', rationale: 'Awaiting sensor telemetry.' };
  }

  const telemetryPayload = {
    device_id: deviceId,
    ...latestTelemetry,
  };

  const result = await evaluateDosingDecision(telemetryPayload, diagnosticReport);

  if (result.rationale && !diagnosticReport.cooldownActiveTill) {
    await prisma.diagnosticReport.update({
      where: { id: diagnosticReport.id },
      data: { actionTaken: result.rationale },
    });
  }

  return result;
}

export function getDeviceLockout(deviceId) {
  if (!deviceId) return 0;
  return deviceMixingLockouts.get(deviceId) || 0;
}

export function setDeviceLockout(deviceId, durationMs = POST_DOSING_LOCKOUT_MS) {
  const activeTill = Date.now() + durationMs;
  deviceMixingLockouts.set(deviceId, activeTill);
  return activeTill;
}