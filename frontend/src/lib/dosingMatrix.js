/**
 * Dosing Decision Matrix Engine
 * 
 * Evaluates current sensor readings + ML diagnosis to determine
 * which dosing scenario is active and what pump actions to take.
 */

// ── Scenario Definitions ──
export const SCENARIOS = [
  {
    id: 'HEALTHY_BASELINE',
    name: 'Healthy Baseline',
    phCondition: '5.8 ≤ pH ≤ 6.5',
    ecCondition: 'Target Band',
    pumps: { PH_DOWN: 'OFF', NUTRIENT_A: 'OFF', NUTRIENT_B: 'OFF' },
    durations: { PH_DOWN: 0, NUTRIENT_A: 0, NUTRIENT_B: 0 },
    rationale: 'System balanced. No dosing action required.',
    severity: 'nominal',
    icon: '✅',
  },
  {
    id: 'ROUTINE_HIGH_PH',
    name: 'Routine High pH Drift',
    phCondition: 'pH > 6.5',
    ecCondition: 'Any',
    pumps: { PH_DOWN: 'ON', NUTRIENT_A: 'OFF', NUTRIENT_B: 'OFF' },
    durations: { PH_DOWN: 2500, NUTRIENT_A: 0, NUTRIENT_B: 0 },
    rationale: 'Standard closed-loop acid pulse. Hold nutrient salts.',
    severity: 'action',
    icon: '⚗️',
  },
  {
    id: 'STANDARD_LOW_EC',
    name: 'Standard Low EC Drift',
    phCondition: '5.8 ≤ pH ≤ 6.5',
    ecCondition: 'EC < Target',
    pumps: { PH_DOWN: 'OFF', NUTRIENT_A: 'ON', NUTRIENT_B: 'ON' },
    durations: { PH_DOWN: 0, NUTRIENT_A: 2500, NUTRIENT_B: 2500 },
    rationale: 'Balanced 1:1 replenishment with 15s sequential delay.',
    severity: 'action',
    icon: '💧',
  },
  {
    id: 'NITROGEN_DEFICIENCY',
    name: 'Nitrogen Deficiency',
    phCondition: '5.8 ≤ pH ≤ 6.5',
    ecCondition: 'EC < Target',
    pumps: { PH_DOWN: 'OFF', NUTRIENT_A: 'ON', NUTRIENT_B: 'ON' },
    durations: { PH_DOWN: 0, NUTRIENT_A: 4000, NUTRIENT_B: 2000 },
    rationale: 'A-Biased (2:1 Ratio): High nitrate and calcium boost.',
    severity: 'warning',
    icon: '🌿',
    mlLabel: 'NITROGEN_DEFICIENCY',
  },
  {
    id: 'PHOSPHORUS_DEFICIENCY',
    name: 'Phosphorus Deficiency',
    phCondition: '5.8 ≤ pH ≤ 6.5',
    ecCondition: 'EC < Target',
    pumps: { PH_DOWN: 'OFF', NUTRIENT_A: 'ON', NUTRIENT_B: 'ON' },
    durations: { PH_DOWN: 0, NUTRIENT_A: 2000, NUTRIENT_B: 4000 },
    rationale: 'B-Biased (1:2 Ratio): Monopotassium phosphate boost.',
    severity: 'warning',
    icon: '🍂',
    mlLabel: 'PHOSPHORUS_DEFICIENCY',
  },
  {
    id: 'POTASSIUM_DEFICIENCY',
    name: 'Potassium Deficiency',
    phCondition: '5.8 ≤ pH ≤ 6.5',
    ecCondition: 'EC < Target',
    pumps: { PH_DOWN: 'OFF', NUTRIENT_A: 'ON', NUTRIENT_B: 'ON' },
    durations: { PH_DOWN: 0, NUTRIENT_A: 2000, NUTRIENT_B: 4000 },
    rationale: 'B-Biased (1:2 Ratio): Soluble potassium salt boost.',
    severity: 'warning',
    icon: '🥀',
    mlLabel: 'POTASSIUM_DEFICIENCY',
  },
  {
    id: 'CALCIUM_DEFICIENCY',
    name: 'Calcium Deficiency',
    phCondition: '5.8 ≤ pH ≤ 6.5',
    ecCondition: 'EC < Target',
    pumps: { PH_DOWN: 'OFF', NUTRIENT_A: 'ON', NUTRIENT_B: 'OFF' },
    durations: { PH_DOWN: 0, NUTRIENT_A: 4000, NUTRIENT_B: 0 },
    rationale: 'Stock A exclusive pulse (Calcium Nitrate).',
    severity: 'warning',
    icon: '🦴',
    mlLabel: 'CALCIUM_DEFICIENCY',
  },
  {
    id: 'MAGNESIUM_DEFICIENCY',
    name: 'Magnesium Deficiency',
    phCondition: '5.8 ≤ pH ≤ 6.5',
    ecCondition: 'EC < Target',
    pumps: { PH_DOWN: 'OFF', NUTRIENT_A: 'OFF', NUTRIENT_B: 'ON' },
    durations: { PH_DOWN: 0, NUTRIENT_A: 0, NUTRIENT_B: 4000 },
    rationale: 'Stock B exclusive pulse (Magnesium Sulfate).',
    severity: 'warning',
    icon: '🧪',
    mlLabel: 'MAGNESIUM_DEFICIENCY',
  },
  {
    id: 'IRON_DEFICIENCY',
    name: 'Iron Deficiency',
    phCondition: '5.8 ≤ pH ≤ 6.5',
    ecCondition: 'EC < Target',
    pumps: { PH_DOWN: 'OFF', NUTRIENT_A: 'ON', NUTRIENT_B: 'OFF' },
    durations: { PH_DOWN: 0, NUTRIENT_A: 4000, NUTRIENT_B: 0 },
    rationale: 'Stock A exclusive pulse (Chelated Iron).',
    severity: 'warning',
    icon: '⚙️',
    mlLabel: 'IRON_DEFICIENCY',
  },
  {
    id: 'ALKALINE_LOCKOUT',
    name: 'Alkaline Nutrient Lockout',
    phCondition: 'pH > 6.5',
    ecCondition: 'Normal / High',
    pumps: { PH_DOWN: 'ON', NUTRIENT_A: 'OFF', NUTRIENT_B: 'OFF' },
    durations: { PH_DOWN: 2500, NUTRIENT_A: 0, NUTRIENT_B: 0 },
    rationale: 'Nutrients present but locked out by pH. Lower pH only.',
    severity: 'action',
    icon: '🔒',
  },
  {
    id: 'ACIDIC_CRASH',
    name: 'Acidic Crash (Edge Case)',
    phCondition: 'pH < 5.5',
    ecCondition: 'Any',
    pumps: { PH_DOWN: 'LOCKOUT', NUTRIENT_A: 'LOCKOUT', NUTRIENT_B: 'LOCKOUT' },
    durations: { PH_DOWN: 0, NUTRIENT_A: 0, NUTRIENT_B: 0 },
    rationale: 'Hard Stop: No pH Up pump. Alert for manual buffering.',
    severity: 'critical',
    icon: '🚨',
  },
  {
    id: 'OSMOTIC_TOXICITY',
    name: 'Osmotic Toxicity (Edge)',
    phCondition: 'Any',
    ecCondition: 'EC > 2.4',
    pumps: { PH_DOWN: 'LOCKOUT', NUTRIENT_A: 'LOCKOUT', NUTRIENT_B: 'LOCKOUT' },
    durations: { PH_DOWN: 0, NUTRIENT_A: 0, NUTRIENT_B: 0 },
    rationale: 'Hard Stop: Over-concentrated. Alert for manual dilution.',
    severity: 'critical',
    icon: '☠️',
  },
  {
    id: 'FALSE_ALARM',
    name: 'False Alarm / Desync',
    phCondition: '5.8 ≤ pH ≤ 6.5',
    ecCondition: 'EC ≥ Target',
    pumps: { PH_DOWN: 'OFF', NUTRIENT_A: 'OFF', NUTRIENT_B: 'OFF' },
    durations: { PH_DOWN: 0, NUTRIENT_A: 0, NUTRIENT_B: 0 },
    rationale: 'ML flags deficiency, but EC is optimal. Lock dosing to prevent burn.',
    severity: 'info',
    icon: '⚠️',
  },
  {
    id: 'BIOTIC_STRESS',
    name: 'Biotic Stress / Pathogen',
    phCondition: 'Any',
    ecCondition: 'Any',
    pumps: { PH_DOWN: 'OFF', NUTRIENT_A: 'OFF', NUTRIENT_B: 'OFF' },
    durations: { PH_DOWN: 0, NUTRIENT_A: 0, NUTRIENT_B: 0 },
    rationale: 'Chemical dosing cannot resolve pests. Flag dashboard alert.',
    severity: 'warning',
    icon: '🦠',
    mlLabel: 'BIOTIC_STRESS',
  },
  {
    id: 'LOW_RESERVOIR',
    name: 'Low Reservoir Level',
    phCondition: 'Any',
    ecCondition: 'Any',
    pumps: { PH_DOWN: 'EMERGENCY', NUTRIENT_A: 'EMERGENCY', NUTRIENT_B: 'EMERGENCY' },
    durations: { PH_DOWN: 0, NUTRIENT_A: 0, NUTRIENT_B: 0 },
    rationale: 'Water level < 15%. Kill all pumps to prevent dry motor burn.',
    severity: 'critical',
    icon: '🔴',
  },
  {
    id: 'SYSTEM_MAINTENANCE',
    name: 'System Maintenance',
    phCondition: 'Any',
    ecCondition: 'Any',
    pumps: { PH_DOWN: 'LOCKOUT', NUTRIENT_A: 'LOCKOUT', NUTRIENT_B: 'LOCKOUT' },
    durations: { PH_DOWN: 0, NUTRIENT_A: 0, NUTRIENT_B: 0 },
    rationale: 'System in maintenance mode. All automated dosing suspended for safety.',
    severity: 'info',
    icon: '🔧',
  },
];

/**
 * Evaluate current sensor state to determine active scenario.
 *
 * @param {Object} params
 * @param {number|null} params.ph           - Current pH reading
 * @param {number|null} params.ec           - Current EC reading (mS/cm)
 * @param {number|null} params.waterLevel   - Water level percentage (0-100)
 * @param {Object|null} params.targetEc     - { min, max } target EC band
 * @param {string|null} params.mlDiagnosis  - ML primary label (e.g. 'NITROGEN_DEFICIENCY')
 * @param {boolean}     params.isMaintenanceMode - System in maintenance?
 * @returns {{ scenario: Object, alerts: string[] }}
 */
export function evaluateDosingScenario({
  ph = null,
  ec = null,
  waterLevel = null,
  targetEc = { min: 1.2, max: 1.8 },
  mlDiagnosis = null,
  isMaintenanceMode = false,
}) {
  const alerts = [];

  // ── Priority 1: Emergency conditions ──

  // System Maintenance
  if (isMaintenanceMode) {
    return { scenario: findScenario('SYSTEM_MAINTENANCE'), alerts: ['System in maintenance mode'] };
  }

  // Low Reservoir — highest priority safety gate
  if (waterLevel != null && waterLevel < 15) {
    alerts.push('EMERGENCY: Water level critically low (< 15%). All pumps killed.');
    return { scenario: findScenario('LOW_RESERVOIR'), alerts };
  }

  // Acidic Crash
  if (ph != null && ph < 5.5) {
    alerts.push('CRITICAL: pH has crashed below 5.5. Manual buffering required.');
    return { scenario: findScenario('ACIDIC_CRASH'), alerts };
  }

  // Osmotic Toxicity
  if (ec != null && ec > 2.4) {
    alerts.push('CRITICAL: EC exceeds 2.4 mS/cm (osmotic toxicity risk). Manual dilution required.');
    return { scenario: findScenario('OSMOTIC_TOXICITY'), alerts };
  }

  // ── Priority 2: Sensor-based scenarios ──
  const phInRange = ph != null && ph >= 5.8 && ph <= 6.5;
  const phHigh = ph != null && ph > 6.5;
  const ecLow = ec != null && ec < targetEc.min;
  const ecInRange = ec != null && ec >= targetEc.min && ec <= targetEc.max;
  const ecHigh = ec != null && ec > targetEc.max;

  // Alkaline Nutrient Lockout: pH high + EC normal/high
  if (phHigh && (ecInRange || ecHigh)) {
    return { scenario: findScenario('ALKALINE_LOCKOUT'), alerts };
  }

  // Routine High pH Drift: pH high (any EC)
  if (phHigh) {
    return { scenario: findScenario('ROUTINE_HIGH_PH'), alerts };
  }

  // ── Priority 3: ML-driven deficiency scenarios (pH in range + EC low) ──
  if (phInRange && ecLow && mlDiagnosis) {
    // Biotic stress — no dosing
    if (mlDiagnosis === 'BIOTIC_STRESS') {
      alerts.push('Biotic stress detected. Chemical dosing cannot resolve — inspect for pests.');
      return { scenario: findScenario('BIOTIC_STRESS'), alerts };
    }

    // Find ML-specific deficiency scenario
    const mlScenario = SCENARIOS.find((s) => s.mlLabel === mlDiagnosis);
    if (mlScenario) {
      return { scenario: mlScenario, alerts };
    }
  }

  // ── Priority 4: False Alarm (ML says deficiency but EC is fine) ──
  if (phInRange && (ecInRange || ecHigh) && mlDiagnosis && mlDiagnosis !== 'HEALTHY') {
    alerts.push('ML flags deficiency but EC is within target. Dosing locked to prevent nutrient burn.');
    return { scenario: findScenario('FALSE_ALARM'), alerts };
  }

  // ── Priority 5: Standard Low EC Drift (no ML or ML says healthy) ──
  if (phInRange && ecLow) {
    return { scenario: findScenario('STANDARD_LOW_EC'), alerts };
  }

  // ── Default: Healthy Baseline ──
  return { scenario: findScenario('HEALTHY_BASELINE'), alerts };
}

function findScenario(id) {
  return SCENARIOS.find((s) => s.id === id) || SCENARIOS[0];
}

/**
 * Get CSS class / color for pump state
 */
export function getPumpStateStyle(state) {
  switch (state) {
    case 'ON': return { color: 'var(--accent-green)', bg: 'var(--accent-green-dim)', label: 'ON' };
    case 'OFF': return { color: 'var(--text-muted)', bg: 'var(--bg-surface)', label: 'OFF' };
    case 'LOCKOUT': return { color: 'var(--accent-amber)', bg: 'var(--accent-amber-dim)', label: 'LOCKOUT' };
    case 'EMERGENCY': return { color: 'var(--accent-red)', bg: 'var(--accent-red-dim)', label: 'EMERGENCY' };
    default: return { color: 'var(--text-muted)', bg: 'var(--bg-surface)', label: state };
  }
}

/**
 * Get severity badge style
 */
export function getSeverityStyle(severity) {
  switch (severity) {
    case 'critical': return { color: '#fca5a5', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.35)' };
    case 'warning': return { color: '#fcd34d', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' };
    case 'action': return { color: '#67e8f9', bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.3)' };
    case 'info': return { color: '#c4b5fd', bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.3)' };
    case 'nominal': return { color: '#6ee7b7', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' };
    default: return { color: 'var(--text-secondary)', bg: 'var(--bg-surface)', border: 'var(--border-default)' };
  }
}
