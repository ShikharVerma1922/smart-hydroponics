'use client';

import { formatDuration } from '@/lib/playground/format';
import { getRemediation } from '@/lib/playground/remediation';

const URGENCY_STYLES = {
  routine: { badge: 'bg-emerald-500/15 text-emerald-300', label: 'Routine' },
  attention: { badge: 'bg-amber-500/15 text-amber-300', label: 'Needs attention' },
  urgent: { badge: 'bg-red-500/15 text-red-300', label: 'Urgent' },
};

/**
 * @typedef {Object} Props
 * @property {DiagnosisLabel} label
 * @property {Severity} severity
 * @property {number} confidence
 * @property {'service' | 'derived'} severitySource
 * @property {number} cooldownRemainingMs
 */

export function RemediationCard({ label, severity, confidence, severitySource, cooldownRemainingMs }) {
  const r = getRemediation(label, severity);
  const urgency = URGENCY_STYLES[r.urgency];

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold text-slate-100">{r.title}</h3>
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${urgency.badge}`}>{urgency.label}</span>
        <span className="ml-auto font-mono text-xs text-slate-400">
          {(confidence * 100).toFixed(0)}% confidence · {severity}
          {severitySource === 'derived' ? ' (derived)' : ''}
        </span>
      </div>

      <p className="mt-2 text-sm text-slate-300">{r.summary}</p>

      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-300">
        {r.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      {r.dosePlan ? (
        <div className="mt-3 rounded-md border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs leading-relaxed text-violet-200">
          <span className="font-semibold">Dosing plan: </span>
          {r.dosePlan}
        </div>
      ) : null}

      {cooldownRemainingMs > 0 ? (
        <p className="mt-2 text-xs text-amber-300">
          This report has already driven a dose. Visual cooldown: {formatDuration(cooldownRemainingMs)} left.
        </p>
      ) : null}
    </div>
  );
}
