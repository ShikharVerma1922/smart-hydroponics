
/**
 * @typedef {Object} ReportSpec
 * @property {DiagnosisLabel} label
 * @property {Severity} severity
 * @property {number} confidence
 */

/**
 * @typedef {Object} Scenario
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {Partial<SensorReadings>} sensors
 * @property {ReportSpec | null} report - null clears any active ML report.
 */

export const SCENARIOS = [
  {
    id: 'nominal',
    title: 'Nominal tank',
    description: 'Everything in range. Expect BALANCED.',
    sensors: { ph: 6.0, ecMsCm: 1.6, waterLevelPct: 80 },
    report: null,
  },
  {
    id: 'ph-drift',
    title: 'pH drifting high',
    description: 'pH above target max with healthy EC. Expect a PH_DOWN pulse.',
    sensors: { ph: 7.0, ecMsCm: 1.6, waterLevelPct: 80 },
    report: null,
  },
  {
    id: 'low-ec',
    title: 'Low EC (no ML)',
    description: 'EC below minimum, no diagnosis. Expect balanced 1:1 A then B.',
    sensors: { ph: 6.0, ecMsCm: 0.8, waterLevelPct: 80 },
    report: null,
  },
  {
    id: 'low-ec-nitrogen',
    title: 'Low EC + nitrogen (HIGH)',
    description: 'ML-biased A-heavy dose, then the report goes on cooldown.',
    sensors: { ph: 6.0, ecMsCm: 0.8, waterLevelPct: 80 },
    report: { label: 'NITROGEN_DEFICIENCY', severity: 'HIGH', confidence: 0.91 },
  },
  {
    id: 'low-ec-potassium',
    title: 'Low EC + potassium (MODERATE)',
    description: 'ML-biased B-heavy dose.',
    sensors: { ph: 6.0, ecMsCm: 0.8, waterLevelPct: 80 },
    report: { label: 'POTASSIUM_DEFICIENCY', severity: 'MODERATE', confidence: 0.67 },
  },
  {
    id: 'desync',
    title: 'ML/sensor desync',
    description: 'Deficiency diagnosed but EC is fine. Expect dosing suppressed.',
    sensors: { ph: 6.0, ecMsCm: 1.6, waterLevelPct: 80 },
    report: { label: 'MAGNESIUM_DEFICIENCY', severity: 'HIGH', confidence: 0.84 },
  },
  {
    id: 'biotic',
    title: 'Pathogen detected',
    description: 'Biotic stress raises an alert; nutrients are not blocked by default.',
    sensors: { ph: 6.0, ecMsCm: 1.6, waterLevelPct: 80 },
    report: { label: 'BIOTIC_STRESS', severity: 'HIGH', confidence: 0.88 },
  },
  {
    id: 'acidic',
    title: 'Acidic crash',
    description: 'pH below 5.5. Hard stop, manual buffering.',
    sensors: { ph: 4.8, ecMsCm: 1.6, waterLevelPct: 80 },
    report: null,
  },
  {
    id: 'osmotic',
    title: 'Osmotic overload',
    description: 'EC above 2.4 mS/cm. Hard stop, manual dilution.',
    sensors: { ph: 6.0, ecMsCm: 2.8, waterLevelPct: 80 },
    report: null,
  },
  {
    id: 'dry-tank',
    title: 'Dry tank',
    description: 'Water below 15%. Emergency: all pumps stop.',
    sensors: { ph: 6.0, ecMsCm: 1.6, waterLevelPct: 8 },
    report: null,
  },
  {
    id: 'probe-fault',
    title: 'Dead pH probe',
    description: 'pH reads 0. Treated as a sensor fault, dosing suspended.',
    sensors: { ph: 0, ecMsCm: 1.6, waterLevelPct: 80 },
    report: null,
  },
];
