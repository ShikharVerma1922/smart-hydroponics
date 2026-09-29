'use client';

import { useEffect, useRef } from 'react';

/**
 * SVG arc gauge — renders a half-circle gauge with animated needle and value.
 * Used for pH and EC cards.
 */
export function ArcGauge({ value, min, max, label, unit, color = 'var(--accent-cyan)' }) {
  // Calculate angle for value on a 180° arc
  const clampedValue = Math.max(min, Math.min(max, value ?? min));
  const fraction = (clampedValue - min) / (max - min || 1);

  // Arc path params
  const cx = 75, cy = 75, r = 58;
  const totalArc = Math.PI * r;
  const filledArc = Math.max(2, fraction * totalArc);

  // Determine vibrant state colors
  const isDanger = fraction < 0.15 || fraction > 0.85;
  const isWarning = fraction < 0.28 || fraction > 0.72;

  const gradientId = `arc-grad-${unit || 'val'}-${Math.round(min)}-${Math.round(max)}`;
  const filterId = `arc-glow-${unit || 'val'}`;

  // Needle endpoint
  const needleAngle = Math.PI - (fraction * Math.PI);
  const needleLen = r - 12;
  const nx = cx + needleLen * Math.cos(needleAngle);
  const ny = cy - needleLen * Math.sin(needleAngle);

  const valueColor = isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#00f59b';

  return (
    <div className="gauge-visual" style={{ width: 170, height: 115 }}>
      <svg viewBox="0 0 150 95" className="svg-gauge" style={{ position: 'absolute', top: 0, width: '100%', height: '100%' }}>
        <defs>
          {/* Gradient definition */}
          <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          {/* Glow Filter */}
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer subtle glow arc */}
        <path
          d={describeArc(cx, cy, r, 180, 360)}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Background Track */}
        <path
          d={describeArc(cx, cy, r, 180, 360)}
          className="svg-gauge__track"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Nominal Target Zone Arc (middle 50%) */}
        <path
          d={describeArc(cx, cy, r, 180 + 45, 360 - 45)}
          fill="none"
          stroke="rgba(16, 185, 129, 0.25)"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Filled active arc with gradient */}
        <path
          d={describeArc(cx, cy, r, 180, 360)}
          className="svg-gauge__fill"
          stroke={isDanger ? '#ef4444' : isWarning ? '#f59e0b' : `url(#${gradientId})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${totalArc}`}
          strokeDashoffset={`${totalArc - filledArc}`}
          filter={!isDanger && !isWarning ? `url(#${filterId})` : undefined}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />

        {/* Tick marks */}
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
          const tAngle = Math.PI - (f * Math.PI);
          const x1 = cx + (r + 7) * Math.cos(tAngle);
          const y1 = cy - (r + 7) * Math.sin(tAngle);
          const x2 = cx + (r + 11) * Math.cos(tAngle);
          const y2 = cy - (r + 11) * Math.sin(tAngle);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth={i === 2 ? "1.5" : "1"}
            />
          );
        })}

        {/* Needle pointer */}
        <line
          x1={cx} y1={cy}
          x2={nx} y2={ny}
          stroke="#f8fafc"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))', transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
        {/* Pivot center hub */}
        <circle cx={cx} cy={cy} r="4.5" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
      </svg>

      <div style={{ position: 'absolute', bottom: -2, textAlign: 'center', width: '100%' }}>
        <div className="gauge-visual__value" style={{
          color: valueColor,
          textShadow: `0 0 20px ${valueColor}55`,
          letterSpacing: '-0.03em',
        }}>
          {value != null ? value.toFixed(2) : '—'}
        </div>
        {unit && <div className="gauge-visual__unit">{unit}</div>}
      </div>
    </div>
  );
}

/**
 * Realistic dynamic liquid water level gauge with multi-wave simulation,
 * rising bubbles, glass refraction highlight, and thermal status.
 */
export function WaterGauge({ percentage = 0, waterTemp }) {
  const fillHeight = Math.max(5, Math.min(100, percentage));
  
  // Temp status color
  const getTempColor = (t) => {
    if (t == null) return 'var(--accent-cyan)';
    if (t >= 18 && t <= 23) return '#10b981'; // Optimal green
    if (t > 23 && t <= 26) return '#06b6d4'; // Good cyan
    if (t > 26 && t <= 29) return '#f59e0b'; // Warm amber
    if (t > 29) return '#ef4444'; // Hot red
    return '#38bdf8'; // Cool blue
  };

  const tempColor = getTempColor(waterTemp);
  const isLow = percentage < 20;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
      <div className={`dynamic-water-tank ${isLow ? 'dynamic-water-tank--low' : ''}`}>
        {/* Outer glass glow & rim */}
        <div className="water-tank__glass-rim" />
        
        {/* Liquid container clipped to circle */}
        <div className="water-tank__fluid-container" style={{ height: `${fillHeight}%` }}>
          {/* Back Wave (Deep layer) */}
          <div className="water-wave water-wave--back" />
          
          {/* Front Wave (Primary fluid surface) */}
          <div className="water-wave water-wave--front" />
          
          {/* Internal fluid depth gradient & glow */}
          <div className="water-tank__liquid-body" />

          {/* Floating animated micro-bubbles */}
          <div className="water-bubble water-bubble--1" />
          <div className="water-bubble water-bubble--2" />
          <div className="water-bubble water-bubble--3" />
          <div className="water-bubble water-bubble--4" />
          <div className="water-bubble water-bubble--5" />
        </div>

        {/* Specular glass reflection sheen */}
        <div className="water-tank__glass-sheen" />

        {/* Dynamic percentage readout */}
        <div className="water-tank__label">
          <span className="water-tank__percent">{Math.round(percentage)}</span>
          <span className="water-tank__symbol">%</span>
        </div>

        {/* Submerged status tag if low */}
        {isLow && (
          <div className="water-tank__low-warning">LOW LEVEL</div>
        )}
      </div>

      {/* Water temperature readout with dynamic thermal dot */}
      {waterTemp != null && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.15rem',
          marginTop: '0.2rem',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${tempColor}44`,
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: tempColor,
              boxShadow: `0 0 8px ${tempColor}`,
              animation: 'pulse-dot 2s infinite',
            }} />
            <span style={{ fontSize: '1.125rem', fontWeight: 800, color: tempColor, letterSpacing: '-0.02em' }}>
              {waterTemp.toFixed(1)}°C
            </span>
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Reservoir Temp
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Simple sparkline using SVG polyline
 */
export function Sparkline({ data = [], width = 70, height = 30, color = 'var(--accent-cyan)' }) {
  if (data.length < 2) return <div className="sparkline-container" />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="sparkline-container" style={{ width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// SVG arc path helper
function describeArc(cx, cy, r, startAngleDeg, endAngleDeg) {
  const startRad = (startAngleDeg * Math.PI) / 180;
  const endRad = (endAngleDeg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const largeArc = endAngleDeg - startAngleDeg > 180 ? 1 : 0;

  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

export default ArcGauge;
