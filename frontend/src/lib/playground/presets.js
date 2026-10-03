
/**
 * @typedef {Object} SamplePreset
 * @property {string} id
 * @property {string} title
 * @property {DiagnosisLabel} expectedLabel
 * @property {string} src - Put real sample photos at these paths under frontend/public.
 * @property {number} hue - Tint used for the gallery tile and the placeholder if the file is missing.
 */

export const SAMPLE_PRESETS = [
  { id: 'healthy', title: 'Healthy lettuce', expectedLabel: 'HEALTHY', src: '/playground/samples/healthy.jpg', hue: 120 },
  { id: 'nitrogen', title: 'Nitrogen deficiency', expectedLabel: 'NITROGEN_DEFICIENCY', src: '/playground/samples/nitrogen.jpg', hue: 60 },
  { id: 'phosphorus', title: 'Phosphorus deficiency', expectedLabel: 'PHOSPHORUS_DEFICIENCY', src: '/playground/samples/phosphorus.jpg', hue: 280 },
  { id: 'potassium', title: 'Potassium deficiency', expectedLabel: 'POTASSIUM_DEFICIENCY', src: '/playground/samples/potassium.jpg', hue: 35 },
  { id: 'calcium', title: 'Calcium deficiency', expectedLabel: 'CALCIUM_DEFICIENCY', src: '/playground/samples/calcium.jpg', hue: 90 },
  { id: 'magnesium', title: 'Magnesium deficiency', expectedLabel: 'MAGNESIUM_DEFICIENCY', src: '/playground/samples/magnesium.jpg', hue: 75 },
  { id: 'iron', title: 'Iron deficiency', expectedLabel: 'IRON_DEFICIENCY', src: '/playground/samples/iron.jpg', hue: 50 },
  { id: 'pathogen', title: 'Leaf blight', expectedLabel: 'BIOTIC_STRESS', src: '/playground/samples/pathogen.jpg', hue: 20 },
];

/**
 * Draws a simple labelled leaf so the gallery and upload flow work even before real
 * sample photos are added. A placeholder is NOT a meaningful input for the YOLO model.
 */
function renderPlaceholder(preset) {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('Canvas is not available in this browser'));

  const bg = ctx.createLinearGradient(0, 0, 640, 480);
  bg.addColorStop(0, '#0f172a');
  bg.addColorStop(1, '#1e293b');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 640, 480);

  ctx.fillStyle = `hsl(${preset.hue} 55% 38%)`;
  ctx.beginPath();
  ctx.ellipse(320, 240, 210, 130, -0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `hsl(${preset.hue} 45% 62%)`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(130, 330);
  ctx.lineTo(510, 150);
  ctx.stroke();

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '600 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Placeholder: ${preset.title}`, 320, 440);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(new File([blob], `${preset.id}-placeholder.png`, { type: 'image/png' }));
      else reject(new Error('Could not export placeholder image'));
    }, 'image/png');
  });
}

/**
 * @typedef {Object} LoadedPreset
 * @property {File} file
 * @property {boolean} isPlaceholder
 */

export async function loadPresetFile(preset) {
  try {
    const res = await fetch(preset.src);
    const type = res.headers.get('content-type') ?? '';
    if (res.ok && type.startsWith('image/')) {
      const blob = await res.blob();
      return { file: new File([blob], `${preset.id}.jpg`, { type: blob.type }), isPlaceholder: false };
    }
  } catch {
    /* fall through to the placeholder */
  }
  return { file: await renderPlaceholder(preset), isPlaceholder: true };
}
