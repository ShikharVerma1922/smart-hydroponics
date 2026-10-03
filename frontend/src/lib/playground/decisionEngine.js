/**
 * Pure, side-effect-free port of the production dosing decision tree.
 *
 * Same thresholds, priority order and ML dose table as dosing_service.js, minus everything
 * that needs infrastructure: no database, no MQTT, no smoothing buffer, no 24h dose caps.
 * Every evaluation records the nodes it visited so the UI can highlight the active path.
 */

export const DEFAULT_ENGINE_CONFIG = {
  waterMinPct: 15,
  phHardMin: 5.5,
  ecCeiling: 2.4,
  targetPhMax: 6.5,
  targetEcMin: 1.2,
  phPulseMs: 2500,
  basePulseMs: 2500,
  partBDelayMs: 15_000,
  blockNutrientsOnBiotic: false,
};

/* ---------- ML dose table (Nutrient A ms / Nutrient B ms) ---------- */

/**
 * @typedef {Object} SplitEntry
 * @property {readonly [number, number]} moderate
 * @property {readonly [number, number]} high
 * @property {string} note
 */

const ML_SPLITS = {
  NITROGEN_DEFICIENCY: {
    moderate: [3000, 2000],
    high: [3500, 1500],
    note: 'A-biased: nitrogen / calcium nitrate enrichment',
  },
  PHOSPHORUS_DEFICIENCY: {
    moderate: [2000, 3000],
    high: [1500, 3500],
    note: 'B-biased: potassium / phosphate enrichment',
  },
  POTASSIUM_DEFICIENCY: {
    moderate: [2000, 3000],
    high: [1500, 3500],
    note: 'B-biased: potassium / phosphate enrichment',
  },
  CALCIUM_DEFICIENCY: {
    moderate: [3250, 1750],
    high: [3750, 1250],
    note: 'A-biased: elevated calcium nitrate with a basal Stock B floor',
  },
  MAGNESIUM_DEFICIENCY: {
    moderate: [1750, 3250],
    high: [1250, 3750],
    note: 'B-biased: elevated magnesium sulfate with a basal Stock A floor',
  },
  IRON_DEFICIENCY: {
    moderate: [3000, 2000],
    high: [3500, 1500],
    note: 'A-biased: chelated iron replenishment',
  },
};

export function getMlSplit(
  label,
  severity,
) {
  const entry = ML_SPLITS[label];
  if (!entry) return null;
  const [a, b] = severity === 'HIGH' || severity === 'CRITICAL' ? entry.high : entry.moderate;
  return { a, b, note: entry.note };
}

/* ---------- Helpers ---------- */

/**
 * @typedef {Object} EngineContext
 * @property {number} nowMs
 * @property {number} lockoutUntilMs
 * @property {MlReport | null} report
 * @property {EngineConfig} config
 */

export function isReportOnCooldown(report, nowMs) {
  return report !== null && report.cooldownUntilMs !== null && report.cooldownUntilMs > nowMs;
}

/** A report whose cooldown has elapsed was already acted on and must be ignored. */
function usableReport(report, nowMs) {
  if (!report) return null;
  if (report.cooldownUntilMs !== null && report.cooldownUntilMs <= nowMs) return null;
  return report;
}

function validateSensors(s) {
  const core = [
    ['pH', s.ph],
    ['EC', s.ecMsCm],
    ['water level', s.waterLevelPct],
  ];
  for (const [name, value] of core) {
    if (!Number.isFinite(value)) return `${name} is missing or not a number`;
  }
  if (s.ph <= 0 || s.ph > 14) return `pH out of valid range (${s.ph.toFixed(2)})`;
  if (s.ecMsCm < 0) return `EC out of valid range (${s.ecMsCm.toFixed(2)})`;
  if (s.waterLevelPct < 0 || s.waterLevelPct > 100) return `water level out of range (${s.waterLevelPct})`;
  return null;
}

function nutrientPulses(a, b, partBDelayMs) {
  return [
    { pump: 'NUTRIENT_A', durationMs: a, delayMs: 0 },
    { pump: 'NUTRIENT_B', durationMs: b, delayMs: partBDelayMs },
  ];
}

/**
 * @typedef {Object} EcPlanInput
 * @property {MlReport | null} report
 * @property {boolean} isBiotic
 * @property {boolean} cooldownActive
 * @property {EngineConfig} cfg
 */

function buildEcPlan({ report, isBiotic, cooldownActive, cfg }) {
  const useBalanced =
    !report ||
    cooldownActive ||
    isBiotic ||
    report.label === 'HEALTHY' ||
    report.label === 'UNKNOWN' ||
    report.severity === 'LOW' ||
    report.severity === 'NONE';

  if (useBalanced) {
    const rationale = cooldownActive
      ? 'Visual cooldown active. Balanced 1:1 replenishment.'
      : isBiotic
        ? 'Biotic stress flagged (no chemical fix). Balanced 1:1 EC correction.'
        : !report
          ? 'No usable ML report. Balanced 1:1 EC correction.'
          : report.severity === 'LOW' || report.severity === 'NONE'
            ? 'Low symptom severity. Defaulting to safe 1:1 replenishment.'
            : 'Canopy healthy. Balanced 1:1 EC correction.';
    return {
      rationale,
      plan: {
        source: 'AUTONOMOUS_EC',
        pulses: nutrientPulses(cfg.basePulseMs, cfg.basePulseMs, cfg.partBDelayMs),
        ratio: `1:1 (${cfg.basePulseMs} ms / ${cfg.basePulseMs} ms)`,
        consumesReport: false,
      },
    };
  }

  // report is non-null here
  const split = getMlSplit(report.label, report.severity);
  const a = split?.a ?? cfg.basePulseMs;
  const b = split?.b ?? cfg.basePulseMs;
  return {
    rationale: `${report.label.replace(/_/g, ' ').toLowerCase()} (${report.severity}): ${split?.note ?? 'balanced 1:1 replenishment'}.`,
    plan: {
      source: 'ML_BIASED',
      pulses: nutrientPulses(a, b, cfg.partBDelayMs),
      ratio: `${a} ms / ${b} ms`,
      consumesReport: true,
    },
  };
}

/* ---------- Evaluation ---------- */

export function evaluate(sensors, ctx) {
  const { config: cfg, nowMs } = ctx;
  const trace = [];
  const alerts = [];

  const finish = (
    terminal,
    status,
    action,
    rationale,
    dose = null,
  ) => {
    trace.push(terminal);
    return { status, action, rationale, trace, terminal, dose, alerts };
  };

  // 0. Sensor validation
  trace.push('validate');
  const invalid = validateSensors(sensors);
  if (invalid) {
    alerts.push(`SENSOR_FAULT: ${invalid}`);
    return finish('T_FAULT', 'LOCKOUT', 'NONE', `Invalid sensor data (${invalid}). Dosing suspended.`);
  }

  // 1. Hard safety gates (raw readings, fixed priority)
  trace.push('water');
  if (sensors.waterLevelPct < cfg.waterMinPct) {
    alerts.push('LOW_WATER_LEVEL (CRITICAL)');
    return finish(
      'T_EMERGENCY',
      'EMERGENCY',
      'NONE',
      `Water level ${sensors.waterLevelPct.toFixed(1)}% is below ${cfg.waterMinPct}%. All pumps halted (dry-run protection).`,
    );
  }

  trace.push('acid');
  if (sensors.ph < cfg.phHardMin) {
    alerts.push('ACIDIC_CRASH (CRITICAL)');
    return finish(
      'T_ACID',
      'LOCKOUT',
      'MANUAL',
      `pH ${sensors.ph.toFixed(2)} is below ${cfg.phHardMin}. No pH Up pump: manual buffering required.`,
    );
  }

  trace.push('osmotic');
  if (sensors.ecMsCm > cfg.ecCeiling) {
    alerts.push('OSMOTIC_TOXICITY (CRITICAL)');
    return finish(
      'T_OSMOTIC',
      'LOCKOUT',
      'MANUAL',
      `EC ${sensors.ecMsCm.toFixed(2)} exceeds ${cfg.ecCeiling} mS/cm. Manual freshwater dilution required.`,
    );
  }

  // 2. Mixing lockout
  trace.push('lockout');
  if (nowMs < ctx.lockoutUntilMs) {
    const remaining = Math.ceil((ctx.lockoutUntilMs - nowMs) / 1000);
    return finish('T_COOLDOWN', 'COOLDOWN', 'NONE', `Mixing lockout active: ${remaining}s remaining for homogenization.`);
  }

  const report = usableReport(ctx.report, nowMs);
  const cooldownActive = isReportOnCooldown(report, nowMs);
  const isBiotic = report !== null && report.label === 'BIOTIC_STRESS';
  const isDesync =
    report !== null &&
    !cooldownActive &&
    report.label !== 'HEALTHY' &&
    report.label !== 'UNKNOWN' &&
    !isBiotic &&
    sensors.ecMsCm >= cfg.targetEcMin;

  // 3. pH drift
  trace.push('ph');
  if (sensors.ph > cfg.targetPhMax) {
    const ecOk = sensors.ecMsCm >= cfg.targetEcMin;
    return finish(
      'T_PH_DOSE',
      'DOSED',
      'DOSE',
      ecOk
        ? 'Nutrients present but locked out by pH. Lower pH only.'
        : 'Standard closed-loop acid pulse. Hold nutrient salts.',
      {
        source: 'AUTONOMOUS_PH',
        pulses: [{ pump: 'PH_DOWN', durationMs: cfg.phPulseMs, delayMs: 0 }],
        ratio: `${cfg.phPulseMs} ms`,
        consumesReport: false,
      },
    );
  }

  // 4. Biotic stress (alert only unless configured to block nutrients)
  trace.push('biotic');
  if (isBiotic) {
    alerts.push('BIOTIC_STRESS (HIGH)');
    if (cfg.blockNutrientsOnBiotic) {
      return finish('T_BIOTIC', 'ALERT', 'ALERT', 'Chemical dosing cannot resolve pests. Dashboard alert raised.');
    }
  }

  // 5. EC deficit
  trace.push('ec');
  if (sensors.ecMsCm < cfg.targetEcMin) {
    const { plan, rationale } = buildEcPlan({ report, isBiotic, cooldownActive, cfg });
    return finish('T_EC_DOSE', 'DOSED', 'DOSE', rationale, plan);
  }

  // 6. ML flags a deficiency but EC is already fine
  trace.push('desync');
  if (isDesync && report) {
    alerts.push('DESYNC_WARNING (MODERATE)');
    return finish(
      'T_DESYNC',
      'OFF',
      'SUPPRESSED',
      `ML flags ${report.label.replace(/_/g, ' ').toLowerCase()}, but EC is optimal. Dosing suppressed to prevent burn.`,
    );
  }

  if (isBiotic) {
    return finish('T_BIOTIC', 'ALERT', 'ALERT', 'Biotic stress flagged for manual inspection. No dosing required.');
  }

  return finish('T_BALANCED', 'BALANCED', 'NONE', 'System balanced. No dosing action required.');
}
