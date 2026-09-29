import { randomUUID } from 'node:crypto';
import { prisma } from '../config/prisma.js';
import mqttClient from '../config/mqtt_broker.js';
import {
  emitDosingEvent,
  emitSystemAlert,
  emitSystemLockout,
  emitAlertResolved,
  emitDosingLogged,
  emitVisionCooldown,
} from '../socket.js';
import { getLatestTelemetry } from './influxQuery.service.js';

// =============================================================================
// CONFIGURATION
// =============================================================================
const POST_DOSING_LOCKOUT_MS = 10 * 60 * 1000;
const VISION_LOCKOUT_MS = 24 * 60 * 60 * 1000;
const PART_B_DELAY_MS = 15 * 1000;

// Hard safety limits
const WATER_LEVEL_MIN_PCT = 15.0;
const PH_HARD_MIN = 5.5;
const EC_HARD_CEILING = 2.4;

// Recipe fallbacks
const DEFAULT_TARGET_PH_MAX = 6.5;
const DEFAULT_TARGET_EC_MIN = 1.2;

// Pulse sizes
const PH_DOWN_PULSE_MS = 2500;
const NUTRIENT_BASE_PULSE_MS = 2500;

// Data freshness / smoothing
const MAX_TELEMETRY_AGE_MS = 2 * 60 * 1000;   // reject telemetry older than this (if it carries a timestamp)
const MAX_REPORT_AGE_MS = 48 * 60 * 60 * 1000; // ignore ML reports older than this
const SMOOTHING_WINDOW = 3;                    // median of last N readings drives dosing decisions
const MIN_SAMPLES_BEFORE_DOSING = 3;
const MAX_READING_AGE_MS = 5 * 60 * 1000;      // increase if telemetry arrives less often than ~1/min

// MQTT
const COMMAND_TTL_MS = 30 * 1000;              // firmware should drop commands past `expires_at`

// Rolling 24h dose caps per pump (TUNE to your tank volume / pump flow rate)
const DAILY_DOSE_CAP_MS = {
  PH_DOWN: 20000,
  NUTRIENT_A: 60000,
  NUTRIENT_B: 60000,
};

// Rough EC rise per second of combined A+B pump time (CALIBRATE for your reservoir).
// Used only to avoid pushing EC past the ceiling in one dose.
const ESTIMATED_EC_RISE_PER_PUMP_SECOND = 0.04;

// If true, a BIOTIC/PATHOGEN report blocks nutrient dosing entirely (original behaviour).
const BLOCK_NUTRIENTS_ON_BIOTIC = false;

// =============================================================================
// IN-MEMORY STATE (all keyed by deviceId)
// =============================================================================
const deviceMixingLockouts = new Map();
const lockoutEndTimers = new Map();
const lastLockoutEmitAt = new Map();
const hydratedLockouts = new Set();
const pendingPartBTimers = new Map();
const emergencyStopSent = new Set();
const readingBuffers = new Map();
const consumedReportIds = new Set();
const desyncNotifiedReportIds = new Set();
const deviceQueues = new Map();

// =============================================================================
// GENERIC HELPERS
// =============================================================================

/** Serializes async work per device so two evaluations can never interleave. */
function withDeviceLock(deviceId, fn) {
  const prev = deviceQueues.get(deviceId) ?? Promise.resolve();
  const next = prev.catch(() => {}).then(fn);
  deviceQueues.set(deviceId, next);
  next.finally(() => {
    if (deviceQueues.get(deviceId) === next) deviceQueues.delete(deviceId);
  }).catch(() => {});
  return next;
}

/** Locked + never throws: an unexpected error means "no dosing", not a crash. */
function runLocked(deviceId, fn) {
  return withDeviceLock(deviceId, async () => {
    try {
      return await fn();
    } catch (err) {
      console.error(`[Dosing Engine] [${deviceId}] Evaluation failed:`, err);
      return { status: 'ERROR', action: 'NONE', rationale: 'Internal error. No dosing performed.' };
    }
  });
}

function safeEmit(label, fn) {
  try {
    fn();
  } catch (err) {
    console.warn(`[Socket Warning] ${label} emit failed:`, err.message);
  }
}

function resolveDeviceId(obj) {
  const id = obj?.deviceId;
  return typeof id === 'string' && id.trim() ? id.trim() : null;
}

function toMillis(value) {
  if (value === null || value === undefined) return null;
  let t;
  if (value instanceof Date) t = value.getTime();
  else if (typeof value === 'number') t = value < 1e12 ? value * 1000 : value; // seconds -> ms
  else t = Date.parse(value);
  return Number.isFinite(t) ? t : null;
}

/** Returns epoch ms, or null if absent / not a plausible epoch (e.g. device uptime counters). */
function getTelemetryTimestamp(telemetry) {
  const t = toMillis(telemetry?.timestamp ?? telemetry?.time ?? telemetry?._time);
  return t !== null && t > Date.UTC(2020, 0, 1) ? t : null;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// =============================================================================
// SENSOR VALIDATION & SMOOTHING
// =============================================================================

function toNumber(v) {
  if (v === null || v === undefined || v === '') return NaN;
  return typeof v === 'number' ? v : Number(v);
}

function normalizeSensors(raw) {
  if (!raw || typeof raw !== 'object') return { sensors: null, error: 'sensors payload missing' };

  const sensors = {
    ph: toNumber(raw.ph),
    ec_ms_cm: toNumber(raw.ec_ms_cm),
    water_level_pct: toNumber(raw.water_level_pct),
  };

  for (const [name, value] of Object.entries(sensors)) {
    if (!Number.isFinite(value)) return { sensors: null, error: `${name} is missing or not a number` };
  }
  if (sensors.ph <= 0 || sensors.ph > 14) return { sensors: null, error: `pH out of valid range (${sensors.ph})` };
  if (sensors.ec_ms_cm < 0) return { sensors: null, error: `EC out of valid range (${sensors.ec_ms_cm})` };
  if (sensors.water_level_pct < 0 || sensors.water_level_pct > 100) {
    return { sensors: null, error: `water level out of valid range (${sensors.water_level_pct})` };
  }
  return { sensors, error: null };
}

/** Pure check used to re-validate before a delayed Part B pulse. */
function getSafetyViolation(sensors) {
  if (sensors.water_level_pct < WATER_LEVEL_MIN_PCT) return `water level ${sensors.water_level_pct}%`;
  if (sensors.ph < PH_HARD_MIN) return `pH ${sensors.ph} below ${PH_HARD_MIN}`;
  if (sensors.ec_ms_cm > EC_HARD_CEILING) return `EC ${sensors.ec_ms_cm} above ${EC_HARD_CEILING}`;
  return null;
}

function pushReading(deviceId, sensors, nowMs) {
  const buf = (readingBuffers.get(deviceId) ?? []).filter((r) => nowMs - r.at <= MAX_READING_AGE_MS);
  buf.push({ at: nowMs, ph: sensors.ph, ec: sensors.ec_ms_cm });
  while (buf.length > SMOOTHING_WINDOW) buf.shift();
  readingBuffers.set(deviceId, buf);
}

function getSmoothedReadings(deviceId, nowMs) {
  const buf = (readingBuffers.get(deviceId) ?? []).filter((r) => nowMs - r.at <= MAX_READING_AGE_MS);
  if (buf.length < MIN_SAMPLES_BEFORE_DOSING) return null;
  return { ph: median(buf.map((r) => r.ph)), ec: median(buf.map((r) => r.ec)) };
}

// =============================================================================
// ALERTS
// =============================================================================

/**
 * Creates an active SystemAlert if none is currently unresolved for this device/type.
 * (Calls are serialized per device, so the find-then-create is not racy.)
 */
async function triggerSystemAlert(deviceId, alertType, severity, message) {
  try {
    const existing = await prisma.systemAlert.findFirst({
      where: { deviceId, alertType, isResolved: false },
    });

    if (!existing) {
      const createdAlert = await prisma.systemAlert.create({
        data: { deviceId, alertType, severity, message, isResolved: false },
      });

      safeEmit('system:alert', () =>
        emitSystemAlert({
          id: createdAlert.id,
          deviceId,
          alertType,
          severity,
          message,
          timestamp: Date.now(),
        })
      );
      console.warn(`[System Alert Created] [${deviceId}] ${alertType}: ${message}`);
    }
  } catch (err) {
    console.error(`[System Alert DB Error] Failed to persist ${alertType} for ${deviceId}:`, err.message);
  }
}

/** Resolves active alerts of a type once conditions return to nominal. */
async function autoResolveAlert(deviceId, alertType) {
  try {
    const { count } = await prisma.systemAlert.updateMany({
      where: { deviceId, alertType, isResolved: false },
      data: { isResolved: true, resolvedAt: new Date(), resolvedBy: 'SYSTEM' },
    });

    if (count > 0) {
      safeEmit('alert:resolved', () =>
        emitAlertResolved({ deviceId, alertType, resolvedBy: 'SYSTEM', timestamp: Date.now() })
      );
    }
  } catch (err) {
    console.error(`[System Alert Resolve Error] Failed to resolve ${alertType} for ${deviceId}:`, err.message);
  }
}

// =============================================================================
// MQTT
// =============================================================================

function buildCommand(command, extra = {}) {
  const now = Date.now();
  return {
    command,
    command_id: randomUUID(), // lets firmware de-duplicate QoS 1 redeliveries
    timestamp: now,
    expires_at: now + COMMAND_TTL_MS, // firmware should ignore the command after this time
    ...extra,
  };
}

/** Resolves on broker PUBACK, rejects on error or if the broker is disconnected. */
function publishCommand(deviceId, payload) {
  return new Promise((resolve, reject) => {
    if (!mqttClient.connected) {
      reject(new Error('MQTT broker disconnected'));
      return;
    }
    mqttClient.publish(`hydro/${deviceId}/commands`, JSON.stringify(payload), { qos: 1 }, (err) =>
      err ? reject(err) : resolve()
    );
  });
}

/** Sends a one-shot stop command per emergency. NOTE: firmware must implement STOP_ALL_PUMPS. */
async function stopAllPumpsOnce(deviceId) {
  if (emergencyStopSent.has(deviceId)) return;
  emergencyStopSent.add(deviceId);
  try {
    await publishCommand(deviceId, buildCommand('STOP_ALL_PUMPS'));
    console.warn(`[Actuator MQTT] [${deviceId}] STOP_ALL_PUMPS sent.`);
  } catch (err) {
    emergencyStopSent.delete(deviceId); // retry on next tick
    console.error(`[Actuator MQTT Error] [${deviceId}] Failed to send STOP_ALL_PUMPS:`, err.message);
  }
}

// =============================================================================
// LOCKOUT MANAGEMENT
// =============================================================================

export function getDeviceLockout(deviceId) {
  if (!deviceId) return 0;
  return deviceMixingLockouts.get(deviceId) || 0;
}

export function setDeviceLockout(deviceId, durationMs = POST_DOSING_LOCKOUT_MS) {
  const activeTill = Date.now() + durationMs;
  deviceMixingLockouts.set(deviceId, activeTill);
  scheduleLockoutEnd(deviceId, activeTill);
  return activeTill;
}

/** Emits isActive:false when the lockout expires so dashboards don't get stuck. */
function scheduleLockoutEnd(deviceId, activeTill) {
  clearTimeout(lockoutEndTimers.get(deviceId));
  const timer = setTimeout(() => {
    lockoutEndTimers.delete(deviceId);
    if ((deviceMixingLockouts.get(deviceId) || 0) <= Date.now()) {
      safeEmit('system:lockout', () =>
        emitSystemLockout({
          deviceId,
          isActive: false,
          remainingSeconds: 0,
          rationale: 'Mixing lockout ended.',
        })
      );
    }
  }, Math.max(0, activeTill - Date.now()) + 250);
  timer.unref?.();
  lockoutEndTimers.set(deviceId, timer);
}

/**
 * Restores the lockout after a restart from the most recent DosingLog row.
 * Uses DosingLog.timestamp and DosingLog.mixingLockoutMin.
 * Throws on DB failure (evaluation then aborts without dosing).
 */
async function hydrateLockoutFromDb(deviceId) {
  if (hydratedLockouts.has(deviceId)) return;

  const last = await prisma.dosingLog.findFirst({
    where: { deviceId },
    orderBy: { timestamp: 'desc' },
  });
  hydratedLockouts.add(deviceId);

  if (last?.timestamp) {
    const lockoutMin = last.mixingLockoutMin ?? POST_DOSING_LOCKOUT_MS / 60000;
    const till = new Date(last.timestamp).getTime() + lockoutMin * 60000;
    if (till > (deviceMixingLockouts.get(deviceId) || 0)) {
      deviceMixingLockouts.set(deviceId, till);
      if (till > Date.now()) scheduleLockoutEnd(deviceId, till);
    }
  }
}

// =============================================================================
// DOSE CAPS
// =============================================================================

async function checkDoseCaps(deviceId, doses) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const planned = {};
  for (const d of doses) planned[d.pumpType] = (planned[d.pumpType] || 0) + d.durationMs;

  for (const [pumpType, plannedMs] of Object.entries(planned)) {
    const cap = DAILY_DOSE_CAP_MS[pumpType];
    if (cap === undefined) continue;

    const agg = await prisma.dosingLog.aggregate({
      _sum: { durationMs: true },
      where: { deviceId, pumpType, timestamp: { gte: since } },
    });
    const used = agg._sum.durationMs ?? 0;
    if (used + plannedMs > cap) return { allowed: false, pumpType, used, plannedMs, cap };
  }
  return { allowed: true };
}

/** Returns a response object if dosing must be held, otherwise null. */
async function holdForDoseCap(deviceId, doses) {
  const check = await checkDoseCaps(deviceId, doses);
  if (check.allowed) {
    await autoResolveAlert(deviceId, 'DOSE_CAP_EXCEEDED');
    return null;
  }

  const msg =
    `24h dose cap reached for ${check.pumpType} (${check.used}ms used + ${check.plannedMs}ms planned > ${check.cap}ms). ` +
    `Dosing held. Check for sensor drift or a leak.`;
  await triggerSystemAlert(deviceId, 'DOSE_CAP_EXCEEDED', 'HIGH', msg);
  return { status: 'LOCKOUT', action: 'DOSE_CAP_REACHED', rationale: msg };
}

// =============================================================================
// ACTUATION
// =============================================================================

function cancelPendingPartB(deviceId) {
  const timer = pendingPartBTimers.get(deviceId);
  if (timer) {
    clearTimeout(timer);
    pendingPartBTimers.delete(deviceId);
    console.warn(`[Dosing Engine] [${deviceId}] Pending Nutrient B pulse cancelled by safety gate.`);
  }
}

/**
 * Publishes a pump pulse. Lockout, UI events and DosingLog are only recorded
 * if the broker acknowledged the command. Returns { log } on success, null on failure.
 */
async function executePumpPulse(deviceId, pumpType, durationMs, source, rationale, diagnosticReportId = null) {
  try {
    await publishCommand(
      deviceId,
      buildCommand('RUN_PUMP', { pump_type: pumpType, duration_ms: durationMs })
    );
  } catch (err) {
    console.error(`[Actuator MQTT Error] [${deviceId}] Failed to publish ${pumpType}:`, err.message);
    await triggerSystemAlert(
      deviceId,
      'ACTUATOR_COMMS_FAILURE',
      'HIGH',
      `Failed to deliver ${pumpType} command (${err.message}). No dose was recorded.`
    );
    return null;
  }

  await autoResolveAlert(deviceId, 'ACTUATOR_COMMS_FAILURE');
  console.log(`[Actuator MQTT] [${deviceId}] Dispatched -> ${pumpType} for ${durationMs}ms`);

  // 1. Immediate UI update
  safeEmit('dosing:event', () =>
    emitDosingEvent({ deviceId, pumpType, durationMs, source, rationale, timestamp: Date.now() })
  );

  // 2. Lockout
  setDeviceLockout(deviceId, POST_DOSING_LOCKOUT_MS);
  safeEmit('system:lockout', () =>
    emitSystemLockout({
      deviceId,
      isActive: true,
      remainingSeconds: Math.round(POST_DOSING_LOCKOUT_MS / 1000),
      rationale: `Mixing lockout initiated after ${pumpType} pulse.`,
      lastPump: pumpType,
    })
  );

  // 3. Persist
  let log = null;
  try {
    log = await prisma.dosingLog.create({
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
    safeEmit('dosing:logged', () => emitDosingLogged({ deviceId, log }));
  } catch (dbErr) {
    console.error(`[Dosing Log DB Error] [${deviceId}]:`, dbErr.message);
  }

  return { log };
}

/** Schedules Part B; re-validates fresh telemetry right before firing. Never throws. */
function schedulePartB(deviceId, durationB, source, rationale, reportId) {
  cancelPendingPartB(deviceId);

  const timer = setTimeout(() => {
    if (pendingPartBTimers.get(deviceId) === timer) pendingPartBTimers.delete(deviceId);

    runLocked(deviceId, async () => {
      const skip = async (reason) => {
        console.warn(`[Dosing Engine] [${deviceId}] Skipping Nutrient B: ${reason}`);
        await triggerSystemAlert(
          deviceId,
          'PARTIAL_DOSE',
          'HIGH',
          `Nutrient A was dosed but Part B was skipped (${reason}). Reservoir may be nutrient-imbalanced.`
        );
      };

      const latest = await getLatestTelemetry(deviceId);
      const { sensors, error } = normalizeSensors(latest?.sensors);
      if (error) return skip(`sensor check failed: ${error}`);

      const ts = getTelemetryTimestamp(latest);
      if (ts !== null && Date.now() - ts > MAX_TELEMETRY_AGE_MS) return skip('telemetry stale');

      const violation = getSafetyViolation(sensors);
      if (violation) return skip(violation);

      const result = await executePumpPulse(deviceId, 'NUTRIENT_B', durationB, source, rationale, reportId);
      if (!result) return skip('MQTT delivery failed');

      await autoResolveAlert(deviceId, 'PARTIAL_DOSE');
    });
  }, PART_B_DELAY_MS);

  pendingPartBTimers.set(deviceId, timer);
}

/**
 * Nutrient A now, Nutrient B after a delay. Returns { ok } — false if the first pulse failed.
 */
async function executeStaggeredNutrientDose(deviceId, durationA, durationB, source, rationale, reportId = null) {
  if (durationA > 0) {
    const resultA = await executePumpPulse(deviceId, 'NUTRIENT_A', durationA, source, rationale, reportId);
    if (!resultA) return { ok: false };

    if (durationB > 0) {
      console.log(`[Dosing Engine] [${deviceId}] Enforcing 15-second sequential dilution delay before Part B...`);
      schedulePartB(deviceId, durationB, source, rationale, reportId);
    }
    return { ok: true };
  }

  if (durationB > 0) {
    const resultB = await executePumpPulse(deviceId, 'NUTRIENT_B', durationB, source, rationale, reportId);
    return { ok: !!resultB };
  }

  return { ok: true };
}

// =============================================================================
// ML REPORT HANDLING
// =============================================================================

/** Drops reports that are too old or have already been acted upon. */
function resolveUsableReport(report, nowMs) {
  if (!report) return null;

  const reportTs = toMillis(report.timestamp);
  if (reportTs !== null && nowMs - reportTs > MAX_REPORT_AGE_MS) return null;

  const cooldownTill = toMillis(report.cooldownActiveTill);
  if (cooldownTill !== null && cooldownTill <= nowMs) return null; // already acted on, cooldown elapsed
  if (cooldownTill === null && report.id && consumedReportIds.has(report.id)) return null;

  return report;
}

// =============================================================================
// CORE DECISION FUNCTION (call only through runLocked)
// =============================================================================

async function evaluateInternal(deviceId, telemetry, rawReport, { recordReading = true } = {}) {
  const nowMs = Date.now();

  // ---- 0. Freshness & validation -------------------------------------------
  const telemetryTs = getTelemetryTimestamp(telemetry);
  if (telemetryTs !== null && nowMs - telemetryTs > MAX_TELEMETRY_AGE_MS) {
    return { status: 'DEFERRED', action: 'NONE', rationale: 'Telemetry is stale. No dosing performed.' };
  }

  const { sensors, error: sensorError } = normalizeSensors(telemetry?.sensors);
  if (sensorError) {
    cancelPendingPartB(deviceId);
    const msg = `Invalid sensor data: ${sensorError}. Dosing suspended.`;
    await triggerSystemAlert(deviceId, 'SENSOR_FAULT', 'HIGH', msg);
    return { status: 'LOCKOUT', action: 'NONE', rationale: msg };
  }
  await autoResolveAlert(deviceId, 'SENSOR_FAULT');

  const { ph, ec_ms_cm, water_level_pct } = sensors;
  if (recordReading) pushReading(deviceId, sensors, nowMs);

  // ---- 1. Priority safety gates (raw readings, react immediately) ----------
  if (water_level_pct < WATER_LEVEL_MIN_PCT) {
    cancelPendingPartB(deviceId);
    const msg = `Critical tank water level (${water_level_pct}% < ${WATER_LEVEL_MIN_PCT}%). Pumps halted to prevent dry motor burn.`;
    await triggerSystemAlert(deviceId, 'LOW_WATER_LEVEL', 'CRITICAL', msg);
    await stopAllPumpsOnce(deviceId);
    return {
      status: 'EMERGENCY',
      action: 'NONE',
      rationale: 'Water level < 15%. Pumps halted to prevent dry motor burn.',
    };
  }
  emergencyStopSent.delete(deviceId);
  await autoResolveAlert(deviceId, 'LOW_WATER_LEVEL');

  if (ph < PH_HARD_MIN) {
    cancelPendingPartB(deviceId);
    const msg = `Acidic crash detected (pH ${ph} < ${PH_HARD_MIN}). No pH Up pump available. Manual buffering required.`;
    await triggerSystemAlert(deviceId, 'ACIDIC_CRASH', 'CRITICAL', msg);
    return {
      status: 'LOCKOUT',
      action: 'MANUAL_INTERVENTION_REQUIRED',
      rationale: 'Hard Stop: No pH Up pump. Alert for manual buffering.',
    };
  }
  await autoResolveAlert(deviceId, 'ACIDIC_CRASH');

  if (ec_ms_cm > EC_HARD_CEILING) {
    cancelPendingPartB(deviceId);
    const msg = `Osmotic ceiling exceeded (EC ${ec_ms_cm} > ${EC_HARD_CEILING} mS/cm). Manual freshwater dilution required.`;
    await triggerSystemAlert(deviceId, 'OSMOTIC_TOXICITY', 'CRITICAL', msg);
    return {
      status: 'LOCKOUT',
      action: 'MANUAL_INTERVENTION_REQUIRED',
      rationale: 'Hard Stop: Over-concentrated. Alert for manual dilution.',
    };
  }
  await autoResolveAlert(deviceId, 'OSMOTIC_TOXICITY');

  // ---- 1b. Mixing lockout (restored from DB after a restart) ----------------
  await hydrateLockoutFromDb(deviceId);

  const activeLockoutTill = deviceMixingLockouts.get(deviceId) || 0;
  if (nowMs < activeLockoutTill) {
    const remainingSec = Math.round((activeLockoutTill - nowMs) / 1000);
    const rationale = `Mixing lockout active: ${remainingSec}s remaining for reservoir homogenization.`;

    // Throttle UI spam: at most one lockout broadcast per 30s while waiting
    if (nowMs - (lastLockoutEmitAt.get(deviceId) || 0) > 30000) {
      lastLockoutEmitAt.set(deviceId, nowMs);
      safeEmit('system:lockout', () =>
        emitSystemLockout({ deviceId, isActive: true, remainingSeconds: remainingSec, rationale })
      );
    }
    return { status: 'COOLDOWN', action: 'NONE', rationale };
  }

  // ---- 1c. Smoothed readings drive dosing decisions --------------------------
  const smoothed = getSmoothedReadings(deviceId, nowMs);
  if (!smoothed) {
    return {
      status: 'WARMUP',
      action: 'NONE',
      rationale: `Collecting sensor samples (${MIN_SAMPLES_BEFORE_DOSING} required) before dosing.`,
    };
  }
  const { ph: phS, ec: ecS } = smoothed;

  // ---- 2. Active crop recipe -------------------------------------------------
  const deviceRecord = await prisma.device.findUnique({
    where: { id: deviceId },
    include: { activeRecipe: true },
  });

  const activeRecipe = deviceRecord?.activeRecipe;
  const targetPhMax = activeRecipe?.targetPhMax ?? DEFAULT_TARGET_PH_MAX;
  const targetEcMin = activeRecipe?.targetEcMin ?? DEFAULT_TARGET_EC_MIN;
  const ecCeiling = Math.min(EC_HARD_CEILING, activeRecipe?.targetEcMax ?? EC_HARD_CEILING);

  // ---- ML report (age / already-consumed filtering, normalized labels) -------
  const mlReport = resolveUsableReport(rawReport, nowMs);
  const primaryLabel = String(mlReport?.primaryLabel ?? mlReport?.primary_label ?? 'HEALTHY').toUpperCase();
  const severity = String(mlReport?.severity ?? 'LOW').toUpperCase();

  const isBiotic = primaryLabel === 'BIOTIC_STRESS' || primaryLabel === 'PATHOGEN';
  // A report that already triggered a dose (visual cooldown active) is "acted on" and must never
  // be reported as a desync: EC is supposed to be in range *because* we just dosed.
  const isVisualCooldownActive = (toMillis(mlReport?.cooldownActiveTill) ?? 0) > nowMs;
  const isDesync =
    !!mlReport && !isVisualCooldownActive && primaryLabel !== 'HEALTHY' && !isBiotic && ecS >= targetEcMin;

  if (!isBiotic) await autoResolveAlert(deviceId, 'BIOTIC_STRESS');
  if (!isDesync) await autoResolveAlert(deviceId, 'DESYNC_WARNING');

  // ---- 3. pH drift -----------------------------------------------------------
  if (phS > targetPhMax) {
    const rationale =
      ecS >= targetEcMin
        ? 'Nutrients present but locked out by pH. Lower pH only.'
        : 'Standard closed-loop acid pulse. Hold nutrient salts.';

    const held = await holdForDoseCap(deviceId, [{ pumpType: 'PH_DOWN', durationMs: PH_DOWN_PULSE_MS }]);
    if (held) return held;

    const result = await executePumpPulse(deviceId, 'PH_DOWN', PH_DOWN_PULSE_MS, 'AUTONOMOUS_PH', rationale, null);
    if (!result) {
      return { status: 'FAILED', action: 'NONE', rationale: 'PH_DOWN command could not be delivered (MQTT).' };
    }

    return { status: 'DOSED', action: 'DOSE', pump: 'PH_DOWN', durationMs: PH_DOWN_PULSE_MS, rationale };
  }

  // ---- 4. Biotic stress / pathogen --------------------------------------------
  if (isBiotic) {
    const msg = `Biotic stress/pathogen detected (${primaryLabel}). Manual inspection required.`;
    await triggerSystemAlert(deviceId, 'BIOTIC_STRESS', 'HIGH', msg);

    if (BLOCK_NUTRIENTS_ON_BIOTIC) {
      return {
        status: 'ALERT',
        action: 'ALERT_DASHBOARD',
        rationale: 'Chemical dosing cannot resolve pests. Flag dashboard alert.',
      };
    }
  }

  // ---- 5. EC deficit & ML-biased dosing ---------------------------------------
  if (ecS < targetEcMin) {
    const useBalanced =
      !mlReport || isVisualCooldownActive || isBiotic || primaryLabel === 'HEALTHY' || severity === 'LOW';

    let durationA = NUTRIENT_BASE_PULSE_MS;
    let durationB = NUTRIENT_BASE_PULSE_MS;
    let rationale = '';
    let source = 'AUTONOMOUS_EC';
    let ratio = `1:1 (${NUTRIENT_BASE_PULSE_MS}ms / ${NUTRIENT_BASE_PULSE_MS}ms)`;
    let reportId = null;
    let applyVisualCooldown = false;

    if (useBalanced) {
      rationale = isVisualCooldownActive
        ? `${Math.round(VISION_LOCKOUT_MS / 3600000)}h visual cooldown active. Balanced 1:1 replenishment.`
        : isBiotic
        ? 'Biotic stress flagged (no chemical fix). Balanced 1:1 EC correction.'
        : primaryLabel === 'HEALTHY'
        ? 'Canopy healthy. Balanced 1:1 EC correction.'
        : 'Low symptom severity. Defaulting to safe 1:1 replenishment.';
    } else {
      // ML-biased formulations (each keeps ~5000ms total dose volume)
      const hi = severity === 'HIGH' || severity === 'CRITICAL';

      switch (primaryLabel) {
        case 'NITROGEN_DEFICIENCY':
          durationA = hi ? 3500 : 3000;
          durationB = hi ? 1500 : 2000;
          rationale = `A-Biased (${severity}): Nitrogen/Calcium Nitrate enrichment.`;
          break;
        case 'PHOSPHORUS_DEFICIENCY':
        case 'POTASSIUM_DEFICIENCY':
          durationA = hi ? 1500 : 2000;
          durationB = hi ? 3500 : 3000;
          rationale = `B-Biased (${severity}): Potassium/Phosphate enrichment.`;
          break;
        case 'CALCIUM_DEFICIENCY':
          durationA = hi ? 3750 : 3250;
          durationB = hi ? 1250 : 1750;
          rationale = `A-Biased (${severity}): Elevated Calcium Nitrate with basal Stock B floor.`;
          break;
        case 'MAGNESIUM_DEFICIENCY':
          durationA = hi ? 1250 : 1750;
          durationB = hi ? 3750 : 3250;
          rationale = `B-Biased (${severity}): Elevated Magnesium Sulfate with basal Stock A floor.`;
          break;
        case 'IRON_DEFICIENCY':
          durationA = hi ? 3500 : 3000;
          durationB = hi ? 1500 : 2000;
          rationale = `A-Biased (${severity}): Chelated Iron replenishment.`;
          break;
        default:
          rationale = 'Balanced 1:1 replenishment.';
          break;
      }

      source = 'ML_BIASED';
      ratio = `${durationA}ms / ${durationB}ms`;
      reportId = mlReport.id;
      applyVisualCooldown = true;
    }

    // Don't overshoot the EC ceiling in a single dose
    const projectedEc = ecS + ESTIMATED_EC_RISE_PER_PUMP_SECOND * ((durationA + durationB) / 1000);
    if (projectedEc > ecCeiling) {
      const heldRationale = `Dose held: projected EC ${projectedEc.toFixed(2)} would exceed ceiling ${ecCeiling} mS/cm.`;
      console.warn(`[Dosing Engine] [${deviceId}] ${heldRationale}`);
      return { status: 'HELD', action: 'NONE', rationale: heldRationale };
    }

    const held = await holdForDoseCap(deviceId, [
      { pumpType: 'NUTRIENT_A', durationMs: durationA },
      { pumpType: 'NUTRIENT_B', durationMs: durationB },
    ]);
    if (held) return held;

    const dispatch = await executeStaggeredNutrientDose(deviceId, durationA, durationB, source, rationale, reportId);
    if (!dispatch.ok) {
      return { status: 'FAILED', action: 'NONE', rationale: 'Nutrient command could not be delivered (MQTT).' };
    }

    let reportActionRecorded = false;
    if (applyVisualCooldown) {
      consumedReportIds.add(mlReport.id); // guards against re-use even if the DB write below fails
      const visualCooldownDate = new Date(nowMs + VISION_LOCKOUT_MS);
      try {
        await prisma.diagnosticReport.update({
          where: { id: mlReport.id },
          data: { cooldownActiveTill: visualCooldownDate, actionTaken: rationale },
        });
        reportActionRecorded = true;
      } catch (err) {
        console.error(`[Dosing Engine] [${deviceId}] Failed to persist visual cooldown:`, err.message);
      }

      safeEmit('vision:cooldown', () =>
        emitVisionCooldown({
          deviceId,
          isActive: true,
          reportId: mlReport.id,
          primaryLabel,
          activeTill: visualCooldownDate,
        })
      );
    }

    return {
      status: 'DOSED',
      action: 'DOSE',
      pumps: { durationA, durationB },
      ratio,
      rationale,
      reportActionRecorded,
    };
  }

  // ---- 6. False alarm / desync (EC already sufficient) ------------------------
  if (isDesync) {
    // One notification per report, so resolve/re-create flapping can't re-announce the same diagnosis.
    if (!desyncNotifiedReportIds.has(mlReport.id)) {
      desyncNotifiedReportIds.add(mlReport.id);
      const msg = `ML diagnosed ${primaryLabel}, but reservoir EC is optimal (${ecS} >= ${targetEcMin} mS/cm). Nutrients held to prevent burn.`;
      await triggerSystemAlert(deviceId, 'DESYNC_WARNING', 'MODERATE', msg);
    }

    return {
      status: 'OFF',
      action: 'SUPPRESSED',
      rationale: 'ML flags deficiency, but EC is optimal. Lock dosing to prevent burn.',
    };
  }

  // ---- 7. Nominal baseline ------------------------------------------------------
  if (isBiotic) {
    return {
      status: 'ALERT',
      action: 'ALERT_DASHBOARD',
      rationale: 'Biotic stress flagged for manual inspection. No dosing required.',
    };
  }

  return { status: 'BALANCED', action: 'NONE', rationale: 'System balanced. No dosing action required.' };
}

// =============================================================================
// PUBLIC API
// =============================================================================

const MISSING_DEVICE_RESULT = {
  status: 'REJECTED',
  action: 'NONE',
  rationale: 'Payload has no deviceId. Refusing to dose an unknown device.',
};

export async function evaluateDosingDecision(telemetry, mlReport = null) {
  const deviceId = resolveDeviceId(telemetry);
  if (!deviceId) return MISSING_DEVICE_RESULT;
  return runLocked(deviceId, () => evaluateInternal(deviceId, telemetry, mlReport));
}

export async function handleIncomingTelemetry(telemetry) {
  const deviceId = resolveDeviceId(telemetry);
  if (!deviceId) return MISSING_DEVICE_RESULT;

  // Report is fetched inside the lock so it can't be stale relative to an in-flight dose.
  return runLocked(deviceId, async () => {
    const latestReport = await prisma.diagnosticReport.findFirst({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
    });
    return evaluateInternal(deviceId, telemetry, latestReport);
  });
}

export async function handleIncomingDiagnosticReport(diagnosticReport) {
  const deviceId = resolveDeviceId(diagnosticReport);
  if (!deviceId) return MISSING_DEVICE_RESULT;

  const latestTelemetry = await getLatestTelemetry(deviceId);

  if (!latestTelemetry || !latestTelemetry.sensors) {
    console.warn(`[Dosing Engine] [${deviceId}] Awaiting initial sensor telemetry for ML report.`);
    return { status: 'DEFERRED', action: 'NONE', rationale: 'Awaiting sensor telemetry.' };
  }

  // Spread first so a stray deviceId in the Influx result can never override ours.
  const telemetryPayload = { ...latestTelemetry, deviceId };

  // recordReading:false -> the live telemetry stream feeds the smoothing buffer, not this Influx re-read.
  const result = await runLocked(deviceId, () =>
    evaluateInternal(deviceId, telemetryPayload, diagnosticReport, { recordReading: false })
  );

  const skipStatuses = ['DEFERRED', 'WARMUP', 'ERROR', 'REJECTED'];
  if (
    result.rationale &&
    !result.reportActionRecorded &&
    !diagnosticReport.cooldownActiveTill &&
    diagnosticReport.id &&
    !skipStatuses.includes(result.status)
  ) {
    try {
      await prisma.diagnosticReport.update({
        where: { id: diagnosticReport.id },
        data: { actionTaken: result.rationale },
      });
    } catch (err) {
      console.error(`[Dosing Engine] [${deviceId}] Failed to record actionTaken:`, err.message);
    }
  }

  return result;
}