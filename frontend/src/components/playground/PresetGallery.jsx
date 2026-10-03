'use client';

/**
 * @typedef {Object} Props
 * @property {readonly SamplePreset[]} presets
 * @property {string | null} loadingId
 * @property {string | null} selectedId
 * @property {boolean} [disabled]
 * @property {(preset: SamplePreset) => void} onSelect
 */

export function PresetGallery({ presets, loadingId, selectedId, disabled = false, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {presets.map((p) => {
        const selected = selectedId === p.id;
        return (
          <button
            key={p.id}
            type="button"
            disabled={disabled || loadingId !== null}
            onClick={() => onSelect(p)}
            className={`group relative overflow-hidden rounded-lg border text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
              selected ? 'border-emerald-400' : 'border-slate-700 hover:border-slate-500'
            }`}
          >
            <div
              className="h-20 w-full"
              style={{ background: `linear-gradient(135deg, hsl(${p.hue} 55% 30%), hsl(${p.hue} 45% 18%))` }}
            >
              {/* Real sample photos (if present) cover the gradient; a missing file just hides the <img>. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="px-2 py-1.5">
              <span className="block truncate text-xs font-medium text-slate-100">{p.title}</span>
              <span className="block truncate text-[10px] text-slate-500">
                {loadingId === p.id ? 'Loading…' : p.expectedLabel.replace(/_/g, ' ').toLowerCase()}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
