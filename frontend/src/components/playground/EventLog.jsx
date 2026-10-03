'use client';

import { formatClock } from '@/lib/playground/format';

const LEVEL_STYLES = {
  info: 'text-slate-300',
  dose: 'text-violet-300',
  warn: 'text-amber-300',
  error: 'text-red-300',
};

/**
 * @typedef {Object} Props
 * @property {readonly SimEvent[]} events
 */

export function EventLog({ events }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Event log</h2>
      {events.length === 0 ? (
        <p className="text-xs text-slate-500">No events yet. Move a slider or trigger a scenario.</p>
      ) : (
        <ul className="max-h-64 space-y-1 overflow-y-auto pr-1 font-mono text-xs">
          {events.map((e) => (
            <li key={e.id} className={LEVEL_STYLES[e.level]}>
              <span className="mr-2 text-slate-500">{formatClock(e.at)}</span>
              {e.message}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
