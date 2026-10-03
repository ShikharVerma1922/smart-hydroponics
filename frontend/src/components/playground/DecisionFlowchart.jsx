'use client';

import { formatDuration } from '@/lib/playground/format';

/**
 * @typedef {Object} SpineDef
 * @property {SpineNodeId} id
 * @property {string} title
 * @property {string} sub
 * @property {TerminalId} terminal
 */

/** Every spine node is phrased as a problem question: "yes" exits right, "no" continues down. */
const SPINE = [
  { id: 'validate', title: 'Sensor fault?', sub: 'finite values, valid ranges', terminal: 'T_FAULT' },
  { id: 'water', title: 'Water below 15%?', sub: 'dry-run protection', terminal: 'T_EMERGENCY' },
  { id: 'acid', title: 'pH below 5.5?', sub: 'acidic crash', terminal: 'T_ACID' },
  { id: 'osmotic', title: 'EC above 2.4?', sub: 'osmotic ceiling', terminal: 'T_OSMOTIC' },
  { id: 'lockout', title: 'Mixing lockout active?', sub: 'homogenization wait', terminal: 'T_COOLDOWN' },
  { id: 'ph', title: 'pH above target max?', sub: 'acid correction first', terminal: 'T_PH_DOSE' },
  { id: 'biotic', title: 'Biotic report?', sub: 'pathogen / pest flag', terminal: 'T_BIOTIC' },
  { id: 'ec', title: 'EC below target min?', sub: 'ML-biased or balanced', terminal: 'T_EC_DOSE' },
  { id: 'desync', title: 'Unacted ML flag, EC ok?', sub: 'desync guard', terminal: 'T_DESYNC' },
];

/**
 * @typedef {Object} TerminalDef
 * @property {string} label
 * @property {string} color
 */

const TERMINALS = {
  T_FAULT: { label: 'SENSOR_FAULT: suspend dosing', color: '#f87171' },
  T_EMERGENCY: { label: 'EMERGENCY: stop all pumps', color: '#f87171' },
  T_ACID: { label: 'ACIDIC_CRASH: manual buffer', color: '#f87171' },
  T_OSMOTIC: { label: 'OSMOTIC: manual dilution', color: '#f87171' },
  T_COOLDOWN: { label: 'COOLDOWN: wait for mixing', color: '#fbbf24' },
  T_PH_DOSE: { label: 'DOSE: PH_DOWN pulse', color: '#f472b6' },
  T_BIOTIC: { label: 'ALERT: biotic stress', color: '#fb923c' },
  T_EC_DOSE: { label: 'DOSE: Nutrient A then B', color: '#a78bfa' },
  T_DESYNC: { label: 'OFF: dosing suppressed', color: '#fb923c' },
  T_BALANCED: { label: 'BALANCED: no action', color: '#34d399' },
};

const NODE_W = 220;
const NODE_H = 48;
const ROW_H = 80;
const TOP = 16;
const SPINE_X = 20;
const TERM_X = 430;
const TERM_W = 250;
const TERM_H = 40;
const SPINE_CX = SPINE_X + NODE_W / 2;

const OFF_STROKE = '#475569';
const ON_STROKE = '#34d399';

const rowY = (index) => TOP + index * ROW_H;

/**
 * @typedef {Object} Props
 * @property {EngineResult | null} result
 * @property {number} lockoutRemainingMs
 * @property {number} lockoutTotalMs
 * @property {number} reportCooldownRemainingMs
 */

export function DecisionFlowchart({ result, lockoutRemainingMs, lockoutTotalMs, reportCooldownRemainingMs }) {
  const visited = new Set(result?.trace ?? []);
  const activeTerminal = result?.terminal ?? null;
  // The last spine node on the path is the one that produced the terminal outcome.
  const lastSpine = [...(result?.trace ?? [])].reverse().find((id) => SPINE.some((n) => n.id === id));
  const height = rowY(SPINE.length) + NODE_H + 16;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Decision flow</h2>
        {result ? (
          <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-xs text-slate-200">{result.status}</span>
        ) : null}
      </div>

      <svg viewBox={`0 0 700 ${height}`} className="h-auto w-full" role="img" aria-label="Dosing decision flowchart">
        <defs>
          <marker id="arrow-on" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L8,4 L0,8 z" fill={ON_STROKE} />
          </marker>
          <marker id="arrow-off" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L8,4 L0,8 z" fill={OFF_STROKE} />
          </marker>
        </defs>

        {SPINE.map((node, i) => {
          const y = rowY(i);
          const midY = y + NODE_H / 2;
          const isVisited = visited.has(node.id);
          const isDeciding = node.id === lastSpine && activeTerminal === node.terminal;
          const terminal = TERMINALS[node.terminal];
          const terminalVisited = visited.has(node.terminal);

          const nextVisited =
            i + 1 < SPINE.length ? visited.has(SPINE[i + 1].id) : visited.has('T_BALANCED');
          const downOn = isVisited && nextVisited;
          // A trailing biotic alert (non-blocking mode) is drawn from the biotic row.
          const exitOn = isDeciding || (node.id === 'biotic' && isVisited && visited.has('T_BIOTIC'));

          let subText = node.sub;
          if (node.id === 'biotic' && reportCooldownRemainingMs > 0) {
            subText = `report cooldown ${formatDuration(reportCooldownRemainingMs)}`;
          }
          if (node.id === 'lockout') {
            subText = lockoutRemainingMs > 0 ? `active, ${formatDuration(lockoutRemainingMs)} left` : 'inactive';
          }

          const stroke = isDeciding ? terminal.color : isVisited ? ON_STROKE : OFF_STROKE;

          return (
            <g key={node.id}>
              <rect
                x={SPINE_X}
                y={y}
                width={NODE_W}
                height={NODE_H}
                rx={10}
                fill={isDeciding ? `${terminal.color}22` : isVisited ? '#064e3b55' : '#0f172a'}
                stroke={stroke}
                strokeWidth={isDeciding ? 3 : 1.5}
              />
              <text x={SPINE_X + 12} y={y + 20} fill={isVisited ? '#f1f5f9' : '#94a3b8'} fontSize={13} fontWeight={600}>
                {node.title}
              </text>
              <text x={SPINE_X + 12} y={y + 37} fill="#94a3b8" fontSize={11}>
                {subText}
              </text>

              {node.id === 'lockout' && lockoutRemainingMs > 0 && lockoutTotalMs > 0 ? (
                <g>
                  <rect x={SPINE_X + 12} y={y + NODE_H - 7} width={NODE_W - 24} height={3} rx={1.5} fill="#334155" />
                  <rect
                    x={SPINE_X + 12}
                    y={y + NODE_H - 7}
                    width={(NODE_W - 24) * Math.min(1, lockoutRemainingMs / lockoutTotalMs)}
                    height={3}
                    rx={1.5}
                    fill="#fbbf24"
                  />
                </g>
              ) : null}

              {/* "yes" edge to the terminal on the right */}
              <line
                x1={SPINE_X + NODE_W}
                y1={midY}
                x2={TERM_X - 2}
                y2={midY}
                stroke={exitOn ? terminal.color : OFF_STROKE}
                strokeWidth={exitOn ? 2.5 : 1.5}
                markerEnd={exitOn ? 'url(#arrow-on)' : 'url(#arrow-off)'}
              />
              <text x={SPINE_X + NODE_W + 10} y={midY - 6} fill="#64748b" fontSize={11}>
                yes
              </text>
              <rect
                x={TERM_X}
                y={midY - TERM_H / 2}
                width={TERM_W}
                height={TERM_H}
                rx={8}
                fill={terminalVisited ? `${terminal.color}22` : '#0f172a'}
                stroke={terminalVisited ? terminal.color : OFF_STROKE}
                strokeWidth={terminalVisited ? 2.5 : 1.2}
              />
              <text
                x={TERM_X + TERM_W / 2}
                y={midY + 4}
                textAnchor="middle"
                fill={terminalVisited ? '#f8fafc' : '#94a3b8'}
                fontSize={12}
                fontWeight={terminalVisited ? 700 : 500}
              >
                {terminal.label}
              </text>

              {/* "no" edge down the spine */}
              <line
                x1={SPINE_CX}
                y1={y + NODE_H}
                x2={SPINE_CX}
                y2={rowY(i + 1) - 2}
                stroke={downOn ? ON_STROKE : OFF_STROKE}
                strokeWidth={downOn ? 2.5 : 1.5}
                markerEnd={downOn ? 'url(#arrow-on)' : 'url(#arrow-off)'}
              />
              <text x={SPINE_CX + 8} y={y + NODE_H + 18} fill="#64748b" fontSize={11}>
                no
              </text>
            </g>
          );
        })}

        {/* final terminal on the spine */}
        {(() => {
          const y = rowY(SPINE.length);
          const t = TERMINALS.T_BALANCED;
          const on = visited.has('T_BALANCED');
          return (
            <g>
              <rect
                x={SPINE_X}
                y={y}
                width={NODE_W}
                height={NODE_H}
                rx={10}
                fill={on ? `${t.color}22` : '#0f172a'}
                stroke={on ? t.color : OFF_STROKE}
                strokeWidth={on ? 3 : 1.5}
              />
              <text
                x={SPINE_CX}
                y={y + NODE_H / 2 + 4}
                textAnchor="middle"
                fill={on ? '#f8fafc' : '#94a3b8'}
                fontSize={13}
                fontWeight={700}
              >
                {t.label}
              </text>
            </g>
          );
        })()}
      </svg>

      {result ? (
        <p className="mt-2 rounded-md bg-slate-800/70 px-3 py-2 text-xs leading-relaxed text-slate-300">{result.rationale}</p>
      ) : (
        <p className="mt-2 text-xs text-slate-500">Waiting for the first evaluation.</p>
      )}
    </section>
  );
}
