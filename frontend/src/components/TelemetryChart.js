'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { ExternalLink } from 'lucide-react';
import { telemetryAPI } from '@/lib/api';
import { format } from 'date-fns';

const RANGE_OPTIONS = ['1h', '6h', '24h', '7d'];
const METRICS = [
  { key: 'ph', label: 'pH', color: '#06b6d4', yAxisId: 'left' },
  { key: 'ec_ms_cm', label: 'EC', color: '#f1f5f9', yAxisId: 'right' },
  { key: 'water_temp_c', label: 'Water Temp', color: '#f59e0b', yAxisId: 'left' },
];

export default function TelemetryChart({ deviceId, onOpenTelemetryDrawer }) {
  const [range, setRange] = useState('6h');
  const [data, setData] = useState([]);
  const [activeMetrics, setActiveMetrics] = useState(['ph', 'ec_ms_cm']);
  const [loading, setLoading] = useState(true);

  // Generate demo fallback chart data
  const generateDemoData = () => {
    const points = [];
    const now = Date.now();
    const count = range === '1h' ? 20 : range === '6h' ? 36 : range === '24h' ? 48 : 56;
    const intervalMs = (range === '1h' ? 3600 : range === '6h' ? 21600 : range === '24h' ? 86400 : 604800) * 1000 / count;
    
    for (let i = count; i >= 0; i--) {
      const t = now - i * intervalMs;
      const ph = +(6.15 + Math.sin(i / 4) * 0.18 + (Math.random() * 0.06 - 0.03)).toFixed(2);
      const ec = +(1.42 + Math.cos(i / 5) * 0.12 + (Math.random() * 0.04 - 0.02)).toFixed(2);
      const temp = +(22.2 + Math.sin(i / 6) * 0.8).toFixed(1);
      points.push({
        timestamp: new Date(t).toISOString(),
        time: t,
        timeLabel: format(new Date(t), 'HH:mm'),
        ph,
        ec_ms_cm: ec,
        water_temp_c: temp,
      });
    }
    return points;
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    telemetryAPI.getHistory(deviceId, range).then((res) => {
      if (cancelled) return;
      if (res.data && res.data.length > 0) {
        setData(
          res.data.map((d) => ({
            ...d,
            time: new Date(d.timestamp).getTime(),
            timeLabel: format(new Date(d.timestamp), 'HH:mm'),
          }))
        );
      } else {
        setData(generateDemoData());
      }
      setLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setData(generateDemoData());
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [deviceId, range]);

  const toggleMetric = (key) => {
    setActiveMetrics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Calculate pH domain
  const phValues = data.map((d) => d.ph).filter(Boolean);
  const phMin = phValues.length ? Math.floor(Math.min(...phValues) * 10) / 10 - 0.4 : 5.2;
  const phMax = phValues.length ? Math.ceil(Math.max(...phValues) * 10) / 10 + 0.4 : 7.4;

  return (
    <div className="card chart-section" id="telemetry-chart">
      <div className="chart-section__header">
        <div className="card__title" style={{ margin: 0 }}>
          Sensor analytics time-series card for IoT hydroponics
        </div>
        <button
          className="section-title__link"
          onClick={onOpenTelemetryDrawer}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Inspect Raw Telemetry Stream <ExternalLink size={12} />
        </button>
      </div>

      <div className="chart-section__controls">
        {/* Range Tabs */}
        <div className="chart-tabs">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r}
              className={`chart-tab ${range === r ? 'chart-tab--active' : ''}`}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>

        <select
          className="btn btn--ghost btn--sm"
          style={{ background: 'var(--bg-input)' }}
          defaultValue="smoothed"
        >
          <option value="smoothed">Smoothed (5m EMA)</option>
          <option value="raw">Raw</option>
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>
            Metrics
          </span>
          <div className="metric-toggle">
            {METRICS.map((m) => (
              <button
                key={m.key}
                className={`metric-toggle__btn ${activeMetrics.includes(m.key) ? 'metric-toggle__btn--active' : ''}`}
                style={activeMetrics.includes(m.key) ? { background: m.color, borderColor: m.color, color: m.key === 'ec_ms_cm' ? '#060a13' : undefined } : {}}
                onClick={() => toggleMetric(m.key)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container" style={{ marginTop: '0.75rem' }}>
        {loading ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="skeleton" style={{ width: '90%', height: '80%' }} />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="phGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 43, 74, 0.5)" />

              <XAxis
                dataKey="timeLabel"
                tick={{ fill: '#5a6f94', fontSize: 11 }}
                axisLine={{ stroke: '#1c2b4a' }}
                tickLine={false}
                interval="preserveStartEnd"
              />

              <YAxis
                yAxisId="left"
                domain={[phMin, phMax]}
                tick={{ fill: '#5a6f94', fontSize: 11 }}
                axisLine={{ stroke: '#1c2b4a' }}
                tickLine={false}
                label={{ value: 'Solution pH', angle: -90, position: 'insideLeft', fill: '#5a6f94', fontSize: 11, dx: -5 }}
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#5a6f94', fontSize: 11 }}
                axisLine={{ stroke: '#1c2b4a' }}
                tickLine={false}
                label={{ value: 'EC (mS/cm)', angle: 90, position: 'insideRight', fill: '#5a6f94', fontSize: 11, dx: 5 }}
              />

              {/* Target pH band */}
              {activeMetrics.includes('ph') && (
                <ReferenceArea
                  yAxisId="left"
                  y1={5.8}
                  y2={6.4}
                  fill="rgba(16, 185, 129, 0.08)"
                  stroke="rgba(16, 185, 129, 0.2)"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Target 5.8 - 6.4',
                    position: 'insideTopLeft',
                    fill: '#10b981',
                    fontSize: 10,
                  }}
                />
              )}

              <Tooltip
                contentStyle={{
                  background: '#0f1629',
                  border: '1px solid #1c2b4a',
                  borderRadius: 6,
                  fontSize: 12,
                  color: '#f1f5f9',
                }}
                labelStyle={{ color: '#8b9dc3' }}
              />

              {/* pH line */}
              {activeMetrics.includes('ph') && (
                <>
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="ph"
                    stroke="none"
                    fill="url(#phGradient)"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="ph"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#06b6d4' }}
                  />
                </>
              )}

              {/* EC line */}
              {activeMetrics.includes('ec_ms_cm') && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="ec_ms_cm"
                  stroke="#f1f5f9"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, fill: '#f1f5f9' }}
                  strokeDasharray="4 2"
                />
              )}

              {/* Water Temp line */}
              {activeMetrics.includes('water_temp_c') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="water_temp_c"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, fill: '#f59e0b' }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="chart-legend">
        {METRICS.filter((m) => activeMetrics.includes(m.key)).map((m) => {
          const lastVal = data.length > 0 ? data[data.length - 1][m.key] : null;
          return (
            <div key={m.key} className="chart-legend__item">
              <div className="chart-legend__dot" style={{ background: m.color }} />
              <span>{m.label}</span>
              <strong style={{ color: m.color }}>
                {lastVal != null ? lastVal.toFixed(2) : '—'}
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}
