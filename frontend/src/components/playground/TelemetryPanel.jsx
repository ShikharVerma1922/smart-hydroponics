'use client';

/**
 * @typedef {Object} SliderSpec
 * @property {keyof SensorReadings} key
 * @property {string} label
 * @property {string} unit
 * @property {number} min
 * @property {number} max
 * @property {number} step
 * @property {number} decimals
 * @property {boolean} decision - true = read by the decision engine; false = display/telemetry only.
 */

const SENSOR_SLIDERS = [
  { key: 'ph', label: 'pH', unit: '', min: 0, max: 14, step: 0.01, decimals: 2, decision: true },
  { key: 'ecMsCm', label: 'EC', unit: 'mS/cm', min: 0, max: 4, step: 0.01, decimals: 2, decision: true },
  { key: 'waterLevelPct', label: 'Water level', unit: '%', min: 0, max: 100, step: 0.5, decimals: 1, decision: true },
  // { key: 'waterTempC', label: 'Water temp', unit: '°C', min: 10, max: 35, step: 0.1, decimals: 1, decision: false },
  // { key: 'airTempC', label: 'Air temp', unit: '°C', min: 10, max: 40, step: 0.1, decimals: 1, decision: false },
  // { key: 'humidityPct', label: 'Humidity', unit: '%', min: 20, max: 100, step: 0.5, decimals: 1, decision: false },
];

/**
 * @typedef {Object} SliderRowProps
 * @property {string} label
 * @property {string} unit
 * @property {number} value
 * @property {number} min
 * @property {number} max
 * @property {number} step
 * @property {number} decimals
 * @property {string} [badge]
 * @property {(value: number) => void} onChange
 */

function SliderRow({ label, unit, value, min, max, step, decimals, badge, onChange }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-slate-300">
          {label}
          {badge ? (
            <span className="ml-2 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-300">
              {badge}
            </span>
          ) : null}
        </span>
        <span className="font-mono tabular-nums text-slate-100">
          {value.toFixed(decimals)} {unit}
        </span>
      </div>
      <input
        type="range"
        className="mt-1 w-full accent-emerald-500"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

/**
 * @typedef {Object} Props
 * @property {SensorReadings} sensors
 * @property {RecipeTargets} targets
 * @property {number} lockoutSeconds
 * @property {boolean} autoEvaluate
 * @property {(patch: Partial<SensorReadings>) => void} onSensorChange
 * @property {(patch: Partial<RecipeTargets>) => void} onTargetsChange
 * @property {(seconds: number) => void} onLockoutSecondsChange
 * @property {(enabled: boolean) => void} onAutoEvaluateChange
 * @property {() => void} onEvaluateNow
 * @property {() => void} onClearLockout
 * @property {() => void} onReset
 */

export function TelemetryPanel({
  sensors,
  targets,
  lockoutSeconds,
  autoEvaluate,
  onSensorChange,
  onTargetsChange,
  onLockoutSecondsChange,
  onAutoEvaluateChange,
  onEvaluateNow,
  onClearLockout,
  onReset,
}) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Telemetry</h2>

      <div className="space-y-3">
        {SENSOR_SLIDERS.map((s) => (
          <SliderRow
            key={s.key}
            label={s.label}
            unit={s.unit}
            value={sensors[s.key]}
            min={s.min}
            max={s.max}
            step={s.step}
            decimals={s.decimals}
            badge={s.decision ? 'decision input' : undefined}
            onChange={(v) => onSensorChange({ [s.key]: v })}
          />
        ))}
      </div>

      <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">Recipe targets</h3>
      <div className="space-y-3">
        <SliderRow
          label="Target pH max"
          unit=""
          value={targets.targetPhMax}
          min={5.8}
          max={7.5}
          step={0.05}
          decimals={2}
          onChange={(v) => onTargetsChange({ targetPhMax: v })}
        />
        <SliderRow
          label="Target EC min"
          unit="mS/cm"
          value={targets.targetEcMin}
          min={0.4}
          max={2.4}
          step={0.05}
          decimals={2}
          onChange={(v) => onTargetsChange({ targetEcMin: v })}
        />
        <SliderRow
          label="Mixing lockout"
          unit="s"
          value={lockoutSeconds}
          min={5}
          max={600}
          step={5}
          decimals={0}
          badge="prod = 600 s"
          onChange={onLockoutSecondsChange}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            className="h-4 w-4 accent-emerald-500"
            checked={autoEvaluate}
            onChange={(e) => onAutoEvaluateChange(e.target.checked)}
          />
          Auto-evaluate every 1 s
        </label>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={onEvaluateNow}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
          >
            Evaluate now
          </button>
          <button
            type="button"
            onClick={onClearLockout}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
          >
            Clear lockout
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
          >
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}
