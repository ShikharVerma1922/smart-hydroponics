import { getMlSplit } from './decisionEngine';

/**
 * @typedef {'routine' | 'attention' | 'urgent'} Urgency
 */

/**
 * @typedef {Object} Remediation
 * @property {string} title
 * @property {Urgency} urgency
 * @property {string} summary
 * @property {string[]} steps
 * @property {string | null} dosePlan - Human-readable description of what the autonomous dosing engine will do.
 */

/**
 * @typedef {Object} RemediationTemplate
 * @property {string} title
 * @property {string} summary
 * @property {string[]} steps
 */

const TEMPLATES = {
  HEALTHY: {
    title: 'Canopy looks healthy',
    summary: 'No deficiency or stress pattern was detected in this image.',
    steps: ['Continue the current recipe.', 'Re-scan weekly, or sooner if new symptoms appear.'],
  },
  NITROGEN_DEFICIENCY: {
    title: 'Nitrogen deficiency',
    summary: 'Uniform yellowing (chlorosis) of older, lower leaves is the classic signature.',
    steps: [
      'Confirm EC is not too low and pH sits at 5.8 to 6.3 so nitrogen stays available.',
      'Let the A-biased nutrient dose run; avoid manual top-ups on the same day.',
      'Re-image the same leaves in 48 to 72 hours to confirm recovery.',
    ],
  },
  PHOSPHORUS_DEFICIENCY: {
    title: 'Phosphorus deficiency',
    summary: 'Dark green or purplish leaves with stunted growth, mostly on older foliage.',
    steps: [
      'Check root-zone temperature; cold water blocks phosphorus uptake.',
      'Verify pH is below 6.5 so phosphate is not locked out.',
      'Let the B-biased nutrient dose run, then re-image in 72 hours.',
    ],
  },
  POTASSIUM_DEFICIENCY: {
    title: 'Potassium deficiency',
    summary: 'Yellowing and browning along leaf edges, starting on older leaves.',
    steps: [
      'Check for calcium or magnesium excess, which competes with potassium.',
      'Let the B-biased nutrient dose run.',
      'Re-image in 72 hours; edge scorch on existing leaves will not reverse.',
    ],
  },
  CALCIUM_DEFICIENCY: {
    title: 'Calcium deficiency',
    summary: 'Distorted or tip-burned new growth; calcium does not move to young tissue.',
    steps: [
      'Improve airflow and avoid very high humidity, which reduces transpiration-driven uptake.',
      'Let the A-biased dose run (calcium nitrate is in Stock A).',
      'Keep Stock A and Stock B separate; mixing them concentrated precipitates calcium.',
    ],
  },
  MAGNESIUM_DEFICIENCY: {
    title: 'Magnesium deficiency',
    summary: 'Interveinal yellowing on older leaves while the veins stay green.',
    steps: [
      'Check that potassium is not excessive, which antagonises magnesium.',
      'Let the B-biased dose run (magnesium sulfate is in Stock B).',
      'Re-image in 72 hours.',
    ],
  },
  IRON_DEFICIENCY: {
    title: 'Iron deficiency',
    summary: 'Interveinal yellowing on the newest leaves, often caused by high pH rather than low supply.',
    steps: [
      'Check pH first: above about 6.5, iron becomes unavailable even when present.',
      'Let the A-biased dose run for chelated iron replenishment.',
      'Re-image new growth in 5 to 7 days.',
    ],
  },
  BIOTIC_STRESS: {
    title: 'Possible pathogen or pest',
    summary: 'The pattern looks biotic rather than nutritional. Dosing cannot fix it.',
    steps: [
      'Inspect leaf undersides and the root zone by hand.',
      'Isolate or remove affected plants and sanitise tools.',
      'Check water temperature and reservoir cleanliness; consider a reservoir change.',
    ],
  },
  UNKNOWN: {
    title: 'Unrecognised pattern',
    summary: 'The model returned a class this playground does not map to a known diagnosis.',
    steps: ['Retake the photo in even light, filling the frame with a single leaf.', 'Compare against the preset samples.'],
  },
};

export function getRemediation(label, severity) {
  const t = TEMPLATES[label];

  let urgency = 'routine';
  if (label === 'BIOTIC_STRESS') urgency = severity === 'LOW' ? 'attention' : 'urgent';
  else if (label !== 'HEALTHY' && label !== 'UNKNOWN') {
    urgency = severity === 'HIGH' || severity === 'CRITICAL' ? 'urgent' : 'attention';
  }

  let dosePlan = null;
  const split = getMlSplit(label, severity);
  if (split && severity !== 'LOW' && severity !== 'NONE') {
    dosePlan =
      `On the next low-EC event the engine will pulse Nutrient A for ${split.a} ms, wait for dilution, ` +
      `then Nutrient B for ${split.b} ms (${split.note}). The report then enters a 24 h cooldown.`;
  } else if (split) {
    dosePlan = 'Severity is low, so the engine ignores the bias and uses a balanced 1:1 dose when EC drops.';
  } else if (label === 'BIOTIC_STRESS') {
    dosePlan = 'No chemical dose is prescribed. The engine raises a dashboard alert only.';
  }

  return { ...t, urgency, dosePlan };
}
