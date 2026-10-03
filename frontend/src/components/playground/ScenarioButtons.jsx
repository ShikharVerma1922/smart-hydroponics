'use client';

/**
 * @typedef {Object} Props
 * @property {readonly Scenario[]} scenarios
 * @property {(scenario: Scenario) => void} onApply
 */

export function ScenarioButtons({ scenarios, onApply }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Edge-case scenarios</h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {scenarios.map((s) => (
          <button
            key={s.id}
            type="button"
            title={s.description}
            onClick={() => onApply(s)}
            className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-left transition hover:border-emerald-500/60 hover:bg-slate-800"
          >
            <span className="block text-sm font-medium text-slate-100">{s.title}</span>
            <span className="mt-0.5 block text-xs leading-snug text-slate-400">{s.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
