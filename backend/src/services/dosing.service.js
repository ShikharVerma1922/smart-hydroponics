// backend/src/services/dosing.service.js
import { prisma } from '../config/prisma.js';
import mqttClient from '../config/mqtt_broker.js';
import { emitDosingEvent, emitSystemAlert, emitSystemLockout } from '../socket.js';
import { getLatestTelemetry } from './influxQuery.service.js';

// --- Per-Device In-Memory Mixing Cooldown Tracking ---
const POST_DOSING_LOCKOUT_MS = 10 * 60 * 1000; // 10 minutes quiet period
const deviceMixingLockouts = new Map(); // Map

/**
 * Creates or updates an active unresolved SystemAlert record scoped to a specific device.
 */
async function triggerSystemAlert(deviceId, alertType, severity, message) {
  try {
    const existing = await prisma.systemAlert.findFirst({
      where: { deviceId, alertType, isResolved: false },
    });

    if (!existing) {
      await prisma.systemAlert.create({
        data: {
          deviceId,
          alertType,
          severity,
          message,
          isResolved: false,
        },
      });
      emitSystemAlert({ deviceId, alertType, severity, message, timestamp: Date.now() });
      console.warn(`[System Alert Created] [${deviceId}]${alertType}: ${message}`);
    }
  } catch (err) {
    console.error(`[System Alert DB Error] Failed to persist ${alertType} for${deviceId}:`, err.message);
  }
}

/**
 * Automatically resolves active alerts when sensor parameters return to nominal bounds.
 */
async function autoResolveAlert(deviceId, alertType) {
  try {
    await prisma.systemAlert.updateMany({
      where: { deviceId, alertType, isResolved: false },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: 'SYSTEM',
      },
    });
  } catch (err) {
    console.error(`[System Alert Resolve Error] Failed to resolve ${alertType} for${deviceId}:`, err.message);
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

  // Dynamic MQTT actuator topic per device
  const topic = `hydro/${deviceId}/commands`;

  mqttClient.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
    if (err) {
      console.error(`[Actuator MQTT Error] [${deviceId}] Failed to publish${pumpType}:`, err.message);
    } else {
      console.log(`[Actuator MQTT] [${deviceId}] Dispatched ->${pumpType} for ${durationMs}ms`);
    }
  });

  emitDosingEvent({
  deviceId,
  pumpType,
  durationMs,
  source,
  rationale,
  timestamp: Date.now(),
});

setDeviceLockout(deviceId, POST_DOSING_LOCKOUT_MS);

  // Persist record to PostgreSQL
  try {
    return await prisma.dosingLog.create({
     data: {
    deviceId,
    pumpType,
    durationMs,
    source,
    rationale,
    mixingLockoutMin: 10,
    diagnosticReportId: diagnosticReportId || null,
  },
    });
  } catch (dbErr) {
    console.error(`[Dosing Log DB Error] [${deviceId}]:`, dbErr.message);
  }
}

/**
 * Executes a staggered nutrient dosing routine with a 15-second delay between Part A and Part B
 * to prevent calcium phosphate and gypsum precipitation in the reservoir.
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
      }, 15000); // 15-second hydraulic separation
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

  // -------------------------------------------------------------------------
  // 1. PRIORITY SAFETY GATES (HARD STOPS & PERSISTENT SYSTEM ALERTS)
  // -------------------------------------------------------------------------

  // Safety Gate 1: Low Reservoir Level (< 15%)
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

  // Safety Gate 2: Acidic Crash (pH < 5.5)
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

  // Safety Gate 3: Osmotic Toxicity (EC > 2.4 mS/cm)
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

  // Safety Gate 4: 10-Minute Mixing Lockout (Per-Device)
  const activeLockoutTill = deviceMixingLockouts.get(deviceId) || 0;
  if (now < activeLockoutTill) {
    
    const remainingSec = Math.round((activeLockoutTill - now) / 1000);
    return {
      status: 'COOLDOWN',
      action: 'NONE',
      rationale: `Mixing lockout active: ${remainingSec}s remaining for reservoir homogenization.`,
    };
  }

  // -------------------------------------------------------------------------
  // 2. RETRIEVE DEVICE-SPECIFIC ACTIVE CROP RECIPE
  // -------------------------------------------------------------------------
  const deviceRecord = await prisma.device.findUnique({
    where: { id: deviceId },
    include: { activeRecipe: true },
  });

  const activeRecipe = deviceRecord?.activeRecipe;
  const targetPhMin = activeRecipe?.targetPhMin ?? 5.8;
  const targetPhMax = activeRecipe?.targetPhMax ?? 6.5;
  const targetEcMin = activeRecipe?.targetEcMin ?? 1.2;
  const targetEcMax = activeRecipe?.targetEcMax ?? 1.8;

  // -------------------------------------------------------------------------
  // 3. EVALUATE HIGH pH DRIFT / ALKALINE LOCKOUT (pH > 6.5)
  // -------------------------------------------------------------------------
  if (ph > targetPhMax) {
    deviceMixingLockouts.set(deviceId, now + POST_DOSING_LOCKOUT_MS);
    
    const rationale = ec_ms_cm >= targetEcMin
      ? 'Nutrients present but locked out by pH. Lower pH only.'
      : 'Standard closed-loop acid pulse. Hold nutrient salts.';

    emitSystemLockout({
        deviceId,
        isActive: true,
        remainingSeconds: 600,
        rationale,
    });

    await executePumpPulse(deviceId, 'PH_DOWN', 2500, 'AUTONOMOUS_PH', rationale, mlReport?.id ?? null);

    return {
      status: 'DOSED',
      pump: 'PH_DOWN',
      durationMs: 2500,
      rationale,
    };
  }

  // -------------------------------------------------------------------------
  // 4. BIOTIC STRESS OR PATHOGEN CHECK (ML Diagnostic)
  // -------------------------------------------------------------------------
  const primaryLabel = mlReport?.primaryLabel ?? 'HEALTHY';
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
  // 5. EVALUATE EC DEFICIT & ML-BIASED DOSING (5.8 <= pH <= 6.5)
  // -------------------------------------------------------------------------
  if (ec_ms_cm < targetEcMin) {
    const isVisualCooldownActive =
      mlReport?.cooldownActiveTill && new Date(mlReport.cooldownActiveTill) > new Date();

    deviceMixingLockouts.set(deviceId, now + POST_DOSING_LOCKOUT_MS);

    // A. Visual cooldown active OR baseline -> AUTONOMOUS_EC 1:1 Balanced Replenishment
    if (!mlReport || isVisualCooldownActive || primaryLabel === 'HEALTHY') {
      const rationale = isVisualCooldownActive
        ? '48h visual cooldown active. Falling back to 1:1 standard replenishment.'
        : 'Balanced 1:1 replenishment with 15s sequential delay.';

      await executeStaggeredNutrientDose(deviceId, 2500, 2500, 'AUTONOMOUS_EC', rationale, mlReport?.id ?? null);

      return {
        status: 'DOSED',
        pumps: ['NUTRIENT_A', 'NUTRIENT_B'],
        ratio: '1:1 (2500ms / 2500ms)',
        rationale,
      };
    }

    // B. ML_BIASED Targeted Formulations
    let durationA = 0;
    let durationB = 0;
    let rationale = '';

    switch (primaryLabel) {
      case 'NITROGEN_DEFICIENCY':
        durationA = 4000;
        durationB = 2000;
        rationale = 'A-Biased (2:1 Ratio): High nitrate and calcium boost.';
        break;

      case 'PHOSPHORUS_DEFICIENCY':
        durationA = 2000;
        durationB = 4000;
        rationale = 'B-Biased (1:2 Ratio): Monopotassium phosphate boost.';
        break;

      case 'POTASSIUM_DEFICIENCY':
        durationA = 2000;
        durationB = 4000;
        rationale = 'B-Biased (1:2 Ratio): Soluble potassium salt boost.';
        break;

      case 'CALCIUM_DEFICIENCY':
        durationA = 4000;
        durationB = 0;
        rationale = 'Stock A exclusive pulse (Calcium Nitrate).';
        break;

      case 'IRON_DEFICIENCY':
        durationA = 4000;
        durationB = 0;
        rationale = 'Stock A exclusive pulse (Chelated Iron).';
        break;

      case 'MAGNESIUM_DEFICIENCY':
        durationA = 0;
        durationB = 4000;
        rationale = 'Stock B exclusive pulse (Magnesium Sulfate).';
        break;

      default:
        durationA = 2500;
        durationB = 2500;
        rationale = 'Balanced 1:1 replenishment with 15s sequential delay.';
        break;
    }


     emitSystemLockout({
        deviceId,
        isActive: true,
        remainingSeconds: 600,
        rationale,
    });

    await executeStaggeredNutrientDose(deviceId, durationA, durationB, 'ML_BIASED', rationale, mlReport.id);

    // Apply 48-hour visual lockout timestamp to the active report
    const visualCooldownDate = new Date(now + 48 * 60 * 60 * 1000);
    await prisma.diagnosticReport.update({
      where: { id: mlReport.id },
      data: {
        cooldownActiveTill: visualCooldownDate,
        actionTaken: rationale,
      },
    });

    return {
      status: 'DOSED',
      pumps: { durationA, durationB },
      rationale,
    };
  }

  // -------------------------------------------------------------------------
  // 6. FALSE ALARM / DESYNC (ML flags deficiency, but EC is already optimal)
  // -------------------------------------------------------------------------
  if (mlReport && primaryLabel !== 'HEALTHY' && ec_ms_cm >= targetEcMin) {
    const msg = `ML diagnosed ${primaryLabel}, but reservoir EC is optimal ${ec_ms_cm} mS/cm). Nutrients held to prevent burn.`;
    await triggerSystemAlert(deviceId, 'DESYNC_WARNING', 'MODERATE', msg);

    return {
      status: 'OFF',
      action: 'SUPPRESSED',
      rationale: 'ML flags deficiency, but EC is optimal. Lock dosing to prevent burn.',
    };
  }

  // -------------------------------------------------------------------------
  // 7. HEALTHY / NOMINAL BASELINE
  // -------------------------------------------------------------------------
  return {
    status: 'BALANCED',
    action: 'NONE',
    rationale: 'System balanced. No dosing action required.',
  };
}

/**
 * Public handler called by the MQTT telemetry subscriber.
 */
export async function handleIncomingTelemetry(telemetry) {
  const deviceId = telemetry.device_id || 'esp32_node_01';

  // Find the latest active diagnosis for this specific device
  const latestReport = await prisma.diagnosticReport.findFirst({
    where: { deviceId },
    orderBy: { timestamp: 'desc' },
  });

  return await evaluateDosingDecision(telemetry, latestReport);
}

/**
 * Public handler called by POST /api/ml/diagnostic-report.
 */
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