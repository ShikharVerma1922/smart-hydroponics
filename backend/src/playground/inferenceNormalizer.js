
const KNOWN_LABELS = new Set([
  'HEALTHY',
  'NITROGEN_DEFICIENCY',
  'PHOSPHORUS_DEFICIENCY',
  'POTASSIUM_DEFICIENCY',
  'CALCIUM_DEFICIENCY',
  'MAGNESIUM_DEFICIENCY',
  'IRON_DEFICIENCY',
  'BIOTIC_STRESS',
]);

const SEVERITIES = new Set(['NONE', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL']);

/** Keyword fallbacks so class names like "nitrogen-def" or "leaf blight" still map. */
const LABEL_KEYWORDS = [
  [/NITROGEN/, 'NITROGEN_DEFICIENCY'],
  [/PHOSPH/, 'PHOSPHORUS_DEFICIENCY'],
  [/POTASS/, 'POTASSIUM_DEFICIENCY'],
  [/CALCIUM/, 'CALCIUM_DEFICIENCY'],
  [/MAGNES/, 'MAGNESIUM_DEFICIENCY'],
  [/IRON/, 'IRON_DEFICIENCY'],
  [/PATHOGEN|DISEASE|BLIGHT|MILDEW|BLOTCH|ROT|PEST|BIOTIC|FUNG/, 'BIOTIC_STRESS'],
  [/HEALTHY|NORMAL/, 'HEALTHY'],
];

export function normalizeLabel(raw) {
  const s = raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (KNOWN_LABELS.has(s)) return s;
  for (const [pattern, label] of LABEL_KEYWORDS) {
    if (pattern.test(s)) return label;
  }
  return 'UNKNOWN';
}

function toNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Accepts 0..1 fractions or 0..100 percentages and returns a clamped 0..1 fraction. */
function toFraction(value) {
  const n = toNumber(value);
  if (n === null) return null;
  const fraction = n > 1 && n <= 100 ? n / 100 : n;
  return Math.min(1, Math.max(0, fraction));
}

/**
 * Production rule (mirrors the live upload endpoint): HEALTHY -> NONE, anything else -> MODERATE,
 * unless the model service reports a severity itself.
 */
function defaultSeverity(label) {
  return label === 'HEALTHY' ? 'NONE' : 'MODERATE';
}

/** Accepts { LABEL: p, ... } or [{ label, probability }, ...]. Sorted high to low. */
function parseClassProbabilities(raw) {
  const out = [];

  const push = (name, value) => {
    if (typeof name !== 'string') return;
    const probability = toFraction(value);
    if (probability === null) return;
    out.push({ label: normalizeLabel(name), rawLabel: name, probability });
  };

  if (isRecord(raw)) {
    for (const [name, value] of Object.entries(raw)) push(name, value);
  } else if (Array.isArray(raw)) {
    for (const item of raw) {
      if (isRecord(item)) push(item.label ?? item.class ?? item.name, item.probability ?? item.score ?? item.confidence);
    }
  }
  return out.sort((a, b) => b.probability - a.probability);
}

/* ---------- optional bounding boxes (the current classifier does not return any) ---------- */

function parseBox(candidate) {
  if (Array.isArray(candidate) && candidate.length === 4) {
    const nums = candidate.map(toNumber);
    if (nums.every((n) => n !== null)) {
      const [x1, y1, x2, y2] = nums;
      return { x1: x1, y1: y1, x2: x2, y2: y2 };
    }
    return null;
  }
  if (!isRecord(candidate)) return null;

  const x1 = toNumber(candidate.x1);
  const y1 = toNumber(candidate.y1);
  const x2 = toNumber(candidate.x2);
  const y2 = toNumber(candidate.y2);
  if (x1 !== null && y1 !== null && x2 !== null && y2 !== null) return { x1, y1, x2, y2 };

  const x = toNumber(candidate.x);
  const y = toNumber(candidate.y);
  const w = toNumber(candidate.w ?? candidate.width);
  const h = toNumber(candidate.h ?? candidate.height);
  if (x !== null && y !== null && w !== null && h !== null) return { x1: x, y1: y, x2: x + w, y2: y + h };

  return null;
}

function parseDetection(raw) {
  if (!isRecord(raw)) return null;

  const rawLabelValue = raw.label ?? raw.class_name ?? raw.class ?? raw.name ?? raw.class_label;
  const rawLabel =
    typeof rawLabelValue === 'string' || typeof rawLabelValue === 'number' ? String(rawLabelValue) : 'unknown';

  const confidence = toFraction(raw.confidence ?? raw.score ?? raw.conf);
  const box = parseBox(raw.bbox ?? raw.box ?? raw.xyxy ?? raw.bounding_box);
  if (confidence === null || box === null) return null;

  const maxCoord = Math.max(box.x1, box.y1, box.x2, box.y2);
  return { label: normalizeLabel(rawLabel), rawLabel, confidence, box, normalized: maxCoord <= 1.0001 };
}

function extractDetections(record) {
  const list = record.detections ?? record.predictions ?? record.boxes;
  if (!Array.isArray(list)) return [];
  return list
    .map(parseDetection)
    .filter((d) => d !== null)
    .sort((a, b) => b.confidence - a.confidence);
}

/* ---------- public API ---------- */

/**
 * Normalizes the model service response. Handles the classifier contract
 * { primary_label, confidence, severity?, class_probabilities } and, if ever present, boxes.
 */
export function normalizeInference(raw, latencyMs) {
  const record = isRecord(raw) ? raw : {};

  const classProbabilities = parseClassProbabilities(record.class_probabilities ?? record.classProbabilities);
  const detections = extractDetections(record);

  const labelSource = record.primary_label ?? record.primaryLabel;

  let rawPrimaryLabel;
  let primaryLabel;
  let confidence;

  if (typeof labelSource === 'string' && labelSource.trim() !== '') {
    rawPrimaryLabel = labelSource;
    primaryLabel = normalizeLabel(labelSource);
    confidence =
      toFraction(record.confidence) ??
      classProbabilities.find((p) => p.label === primaryLabel)?.probability ??
      0;
  } else if (detections[0]) {
    rawPrimaryLabel = detections[0].rawLabel;
    primaryLabel = detections[0].label;
    confidence = detections[0].confidence;
  } else if (classProbabilities[0]) {
    rawPrimaryLabel = classProbabilities[0].rawLabel;
    primaryLabel = classProbabilities[0].label;
    confidence = classProbabilities[0].probability;
  } else {
    rawPrimaryLabel = 'HEALTHY';
    primaryLabel = 'HEALTHY';
    confidence = 0;
  }

  let severity = defaultSeverity(primaryLabel);
  let severitySource = 'derived';
  if (typeof record.severity === 'string') {
    const s = record.severity.trim().toUpperCase();
    if (SEVERITIES.has(s)) {
      severity = s;
      severitySource = 'service';
    }
  }

  return {
    detections,
    primaryLabel,
    rawPrimaryLabel,
    severity,
    severitySource,
    confidence,
    classProbabilities,
    latencyMs,
    mocked: false,
  };
}

/** Used only when the model service is down and the caller explicitly asked for a mock label. */
export function buildMockResult(label) {
  return {
    detections: [],
    primaryLabel: label,
    rawPrimaryLabel: label,
    severity: defaultSeverity(label),
    severitySource: 'derived',
    confidence: 1,
    classProbabilities: [{ label, rawLabel: label, probability: 1 }],
    latencyMs: 0,
    mocked: true,
  };
}
