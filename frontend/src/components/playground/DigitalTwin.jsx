'use client';

import { formatDuration } from '@/lib/playground/format';
import { ACTUATOR_LABELS } from '@/lib/playground/types';

const COLORS = {
  CIRCULATION_PUMP: '#38bdf8',
  PH_DOWN: '#f472b6',
  NUTRIENT_A: '#fbbf24',
  NUTRIENT_B: '#a78bfa',
};

/**
 * @typedef {Object} BottleDef
 * @property {PumpType} id
 * @property {number} x
 * @property {string} label
 */

const BOTTLES = [
  { id: 'PH_DOWN', x: 340, label: 'pH Down' },
  { id: 'NUTRIENT_A', x: 430, label: 'Nutrient A' },
  { id: 'NUTRIENT_B', x: 520, label: 'Nutrient B' },
];

const TANK = { x: 320, y: 180, w: 280, h: 190 };
const PUMP = { cx: 110, cy: 300+35, r: 34 };

function waterColor(ph) {
  if (ph < 5.5) return '#f59e0b';
  if (ph <= 6.5) return '#22c55e';
  return '#38bdf8';
}

/**
 * @typedef {Object} FlowPipeProps
 * @property {string} d
 * @property {string} color
 * @property {boolean} active
 */

function FlowPipe({ d, color, active }) {
  return (
    <g>
      <path d={d} fill="none" stroke="#334155" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      {active ? (
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="8 8"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="0.6s" repeatCount="indefinite" />
        </path>
      ) : null}
    </g>
  );
}

/**
 * @typedef {Object} Props
 * @property {SensorReadings} sensors
 * @property {Record<ActuatorId, ActuatorView>} actuators
 * @property {boolean} hardwareSync
 * @property {BridgeStatus | null} bridge
 * @property {(enabled: boolean) => void} onHardwareSyncChange
 * @property {(on: boolean) => void} onToggleCirculation
 * @property {(pump: PumpType, durationMs: number) => void} onManualPulse
 * @property {() => void} onStopAll
 */

export function DigitalTwin({
  sensors,
  actuators,
  hardwareSync,
  bridge,
  onHardwareSyncChange,
  onToggleCirculation,
  onManualPulse,
  onStopAll,
}) {
  const level = Math.min(100, Math.max(0, sensors.waterLevelPct));
  const innerH = TANK.h - 14;
  const waterH = (level / 100) * innerH;
  const waterY = TANK.y + TANK.h - 7 - waterH;
  const circ = actuators.CIRCULATION_PUMP;

  let syncLabel = 'Off';
  let syncColor = 'bg-slate-700 text-slate-300';
  if (hardwareSync) {
    if (!bridge) {
      syncLabel = 'Backend unreachable';
      syncColor = 'bg-red-500/20 text-red-300';
    } else if (!bridge.mqttConnected) {
      syncLabel = 'MQTT disconnected';
      syncColor = 'bg-red-500/20 text-red-300';
    } else if (!bridge.rigOnline) {
      syncLabel = 'Rig offline';
      syncColor = 'bg-amber-500/20 text-amber-300';
    } else {
      syncLabel = `Rig ${bridge.rigId} online`;
      syncColor = 'bg-emerald-500/20 text-emerald-300';
    }
  }

  const ledOrder = ['CIRCULATION_PUMP', 'PH_DOWN', 'NUTRIENT_A', 'NUTRIENT_B'];

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Digital twin</h2>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            className="h-4 w-4 accent-emerald-500"
            checked={hardwareSync}
            onChange={(e) => onHardwareSyncChange(e.target.checked)}
          />
          Hardware sync
          <span className={`rounded px-2 py-0.5 text-xs ${syncColor}`}>{syncLabel}</span>
        </label>
      </div>

      <svg viewBox="0 0 640 440" className="h-auto w-full" role="img" aria-label="Reservoir digital twin">
        {/* ---- dosing bottles and tubes ---- */}
        {BOTTLES.map((b) => {
          const view = actuators[b.id];
          const color = COLORS[b.id];
          const cx = b.x + 30;
          return (
            <g key={b.id}>
              <rect x={b.x} y={24} width={60} height={96} rx={10} fill="#0f172a" stroke={view.on ? color : '#475569'} strokeWidth={view.on ? 3 : 1.5} />
              <rect x={b.x + 6} y={52} width={48} height={62} rx={6} fill={color} opacity={0.35} />
              <text x={cx} y={16} textAnchor="middle" fontSize={11} fill="#cbd5e1">
                {b.label}
              </text>
              <FlowPipe d={`M ${cx} 120 V 214`} color={color} active={view.on} />
              {view.on && level > 3 ? (
                <circle cx={cx} r={4} fill={color}>
                  <animate attributeName="cy" values="214;250" dur="0.5s" repeatCount="indefinite" />
                </circle>
              ) : null}
            </g>
          );
        })}

        {/* ---- tank ---- */}
        <rect x={TANK.x} y={TANK.y} width={TANK.w} height={TANK.h} rx={12} fill="#0b1220" stroke="#64748b" strokeWidth={3} />
        <rect x={TANK.x + 7} y={waterY} width={TANK.w - 14} height={waterH} rx={6} fill={waterColor(sensors.ph)} opacity={0.55} />
        {level > 1 ? (
          <path
            d={`M ${TANK.x + 7} ${waterY} q 35 -6 70 0 t 70 0 t 70 0 t 56 0`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={1.5}
            opacity={0.5}
          />
        ) : null}
        <text x={TANK.x + TANK.w / 2} y={TANK.y + TANK.h - 14} textAnchor="middle" fontSize={12} fill="#f8fafc" fontWeight={600}>
          pH {sensors.ph.toFixed(2)} · EC {sensors.ecMsCm.toFixed(2)} · {level.toFixed(0)}%
        </text>

        {/* ---- circulation loop ---- */}
        <FlowPipe d={`M ${TANK.x} 335 H ${PUMP.cx + PUMP.r}`} color={COLORS.CIRCULATION_PUMP} active={circ.on} />
        <FlowPipe
          d={`M ${PUMP.cx} ${PUMP.cy - PUMP.r - 2} V 150 H ${TANK.x + 20} V ${TANK.y + 40}`}
          color={COLORS.CIRCULATION_PUMP}
          active={circ.on}
        />
        <circle cx={PUMP.cx} cy={PUMP.cy} r={PUMP.r} fill="#0f172a" stroke={circ.on ? COLORS.CIRCULATION_PUMP : '#475569'} strokeWidth={circ.on ? 3 : 1.5} />
        <g>
          {circ.on ? (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${PUMP.cx} ${PUMP.cy}`}
              to={`360 ${PUMP.cx} ${PUMP.cy}`}
              dur="0.8s"
              repeatCount="indefinite"
            />
          ) : null}
          {[0, 90, 180, 270].map((deg) => (
            <line
              key={deg}
              x1={PUMP.cx}
              y1={PUMP.cy}
              x2={PUMP.cx + 24 * Math.cos((deg * Math.PI) / 180)}
              y2={PUMP.cy + 24 * Math.sin((deg * Math.PI) / 180)}
              stroke={circ.on ? COLORS.CIRCULATION_PUMP : '#64748b'}
              strokeWidth={5}
              strokeLinecap="round"
            />
          ))}
        </g>
        <text x={PUMP.cx} y={PUMP.cy + PUMP.r + 18} textAnchor="middle" fontSize={11} fill="#cbd5e1">
          Circulation
        </text>

        {/* ---- breadboard LED mirror ---- */}
        <text x={20} y={392} fontSize={11} fill="#94a3b8">
          Rig LEDs
        </text>
        {ledOrder.map((id, i) => {
          const view = actuators[id];
          const cx = 34 + i * 150;
          return (
            <g key={id}>
              <circle cx={cx} cy={415} r={9} fill={view.on ? COLORS[id] : '#1e293b'} stroke="#64748b" strokeWidth={1.5} />
              {view.on ? <circle cx={cx} cy={415} r={15} fill={COLORS[id]} opacity={0.25} /> : null}
              <text x={cx + 18} y={419} fontSize={11} fill={view.on ? '#f1f5f9' : '#94a3b8'}>
                {ACTUATOR_LABELS[id]}
                {view.on && view.remainingMs > 0 ? ` ${formatDuration(view.remainingMs)}` : ''}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onToggleCirculation(!circ.on)}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
        >
          Circulation {circ.on ? 'OFF' : 'ON'}
        </button>
        {BOTTLES.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onManualPulse(b.id, 2500)}
            disabled={actuators[b.id].on}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Pulse {b.label} 2.5 s
          </button>
        ))}
        <button
          type="button"
          onClick={onStopAll}
          className="ml-auto rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500"
        >
          Stop all
        </button>
      </div>
    </section>
  );
}
