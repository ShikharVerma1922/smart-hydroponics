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
  ReferenceArea,
} from 'recharts';
import { ExternalLink } from 'lucide-react';
import { telemetryAPI } from '@/lib/api';
import { format } from 'date-fns';

const RANGE_OPTIONS = [
  '1h',
  '6h',
  '24h',
  '7d',
];

const INTERVAL_OPTIONS = [
  { value: '1m', label: '1 min' },
  { value: '5m', label: '5 min' },
  { value: '15m', label: '15 min' },
  { value: '30m', label: '30 min' },
  { value: '1h', label: '1 hour' },
];

const METRICS = [
  {
    key: 'ph',
    label: 'pH',
    color: '#06b6d4',
    yAxisId: 'left',
  },
  {
    key: 'ec_ms_cm',
    label: 'EC',
    color: '#f1f5f9',
    yAxisId: 'right',
  },
  {
    key: 'water_temp_c',
    label: 'Water Temp',
    color: '#f59e0b',
    yAxisId: 'left',
  },
];

export default function TelemetryChart({
  deviceId,
  liveBuffer = [],
  onOpenTelemetryDrawer,
}) {
  const [range, setRange] = useState('6h');
  const [interval, setInterval] = useState('5m');
  const [displayMode, setDisplayMode] = useState('smoothed');

  const [data, setData] = useState([]);
  const [activeMetrics, setActiveMetrics] = useState([
    'ph',
    'ec_ms_cm',
  ]);

  const [loading, setLoading] = useState(true);

  /*
   * Apply Exponential Moving Average.
   * This is display-only. Raw backend data remains unchanged.
   */
  const applyEma = (points, alpha = 0.25) => {
    if (!points.length) return points;

    let phEma;
    let ecEma;
    let tempEma;

    return points.map((point) => {
      const ph = Number(point.ph);
      const ec = Number(point.ec_ms_cm);
      const temp = Number(point.water_temp_c);

      if (Number.isFinite(ph)) {
        phEma =
          phEma == null
            ? ph
            : alpha * ph + (1 - alpha) * phEma;
      }

      if (Number.isFinite(ec)) {
        ecEma =
          ecEma == null
            ? ec
            : alpha * ec + (1 - alpha) * ecEma;
      }

      if (Number.isFinite(temp)) {
        tempEma =
          tempEma == null
            ? temp
            : alpha * temp + (1 - alpha) * tempEma;
      }

      return {
        ...point,

        ph: Number.isFinite(phEma)
          ? Number(phEma.toFixed(2))
          : point.ph,

        ec_ms_cm: Number.isFinite(ecEma)
          ? Number(ecEma.toFixed(2))
          : point.ec_ms_cm,

        water_temp_c: Number.isFinite(tempEma)
          ? Number(tempEma.toFixed(1))
          : point.water_temp_c,
      };
    });
  };

  /*
   * Fetch historical telemetry.
   *
   * IMPORTANT:
   * range and interval are both sent to the backend.
   */
  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    telemetryAPI
      .getHistory(deviceId, range, interval)
      .then((res) => {
        if (cancelled) return;

        const history = Array.isArray(res.data)
          ? res.data
          : [];

        const points = history
          .map((point) => {
            const time = new Date(
              point.timestamp
            ).getTime();

            return {
              ...point,
              time,
              timeLabel: Number.isFinite(time)
                ? format(
                    new Date(time),
                    range === '7d'
                      ? 'dd MMM HH:mm'
                      : 'HH:mm'
                  )
                : '',
            };
          })
          .filter((point) =>
            Number.isFinite(point.time)
          )
          .sort((a, b) => a.time - b.time);

        setData(points);
        setLoading(false);
      })
      .catch((error) => {
        console.error(
          '[TelemetryChart] Failed to load history:',
          error
        );

        if (!cancelled) {
          setData([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [deviceId, range, interval]);

/*
 * Merge live Socket.IO telemetry into the chart according
 * to the selected sampling interval.
 *
 * Socket events may arrive every 10 seconds, while the chart
 * may be configured for 1m / 5m / 15m etc.
 *
 * Multiple socket readings inside the same interval are
 * collapsed into a single chart point.
 */
useEffect(() => {
  const intervalMs = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '30m': 30 * 60 * 1000,
    '1h': 60 * 60 * 1000,
  }[interval];

  if (!intervalMs) return;

  const livePoints = liveBuffer
    .filter(
      (point) =>
        point?.deviceId === deviceId &&
        point?.timestamp
    )
    .map((point) => {
      const time = new Date(
        point.timestamp
      ).getTime();

      return {
        ...point,
        time,
      };
    })
    .filter((point) =>
      Number.isFinite(point.time)
    );

  if (!livePoints.length) return;

  setData((previous) => {
    const byBucket = new Map();

    /*
     * Put existing historical points into their
     * corresponding interval buckets.
     */
    previous.forEach((point) => {
      if (!Number.isFinite(point.time)) return;

      const bucketTime =
        Math.floor(point.time / intervalMs) *
        intervalMs;

      byBucket.set(bucketTime, {
        ...point,
        time: bucketTime,
        timestamp: new Date(
          bucketTime
        ).toISOString(),
        timeLabel: format(
          new Date(bucketTime),
          range === '7d'
            ? 'dd MMM HH:mm'
            : 'HH:mm'
        ),
      });
    });

    /*
     * Add live readings to the same interval buckets.
     *
     * If several socket events arrive during the same
     * interval, calculate their average instead of
     * creating multiple chart points.
     */
    const liveBuckets = new Map();

    livePoints.forEach((point) => {
      const bucketTime =
        Math.floor(point.time / intervalMs) *
        intervalMs;

      if (!liveBuckets.has(bucketTime)) {
        liveBuckets.set(bucketTime, []);
      }

      liveBuckets
        .get(bucketTime)
        .push(point);
    });

    liveBuckets.forEach(
      (points, bucketTime) => {
        const existing =
          byBucket.get(bucketTime);

        const average = (key) => {
          const values = points
            .map((point) =>
              Number(point?.[key])
            )
            .filter(Number.isFinite);

          /*
           * If the live packet doesn't contain
           * a valid value, preserve the existing
           * historical value.
           */
          if (!values.length) {
            return existing?.[key];
          }

          return (
            values.reduce(
              (sum, value) =>
                sum + value,
              0
            ) / values.length
          );
        };

        const latest =
          points[points.length - 1];

        byBucket.set(bucketTime, {
          ...(existing || {}),
          ...latest,

          time: bucketTime,

          timestamp: new Date(
            bucketTime
          ).toISOString(),

          timeLabel: format(
            new Date(bucketTime),
            range === '7d'
              ? 'dd MMM HH:mm'
              : 'HH:mm'
          ),

          ph: average('ph'),

          ec_ms_cm: average(
            'ec_ms_cm'
          ),

          water_temp_c: average(
            'water_temp_c'
          ),
        });
      }
    );

    /*
     * Sort chronologically.
     */
    const merged = Array.from(
      byBucket.values()
    ).sort(
      (a, b) => a.time - b.time
    );

    /*
     * Keep only the selected time range.
     */
    const rangeMs = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
    }[range];

    if (!rangeMs) {
      return merged;
    }

    const cutoff =
      Date.now() - rangeMs;

    return merged.filter(
      (point) =>
        point.time >= cutoff
    );
  });
}, [
  liveBuffer,
  deviceId,
  range,
  interval,
]);

  /*
   * Data actually displayed by the chart.
   */
  const chartData = useMemo(() => {
    if (displayMode === 'raw') {
      return data;
    }

    return applyEma(data);
  }, [data, displayMode]);

  const toggleMetric = (key) => {
    setActiveMetrics((previous) =>
      previous.includes(key)
        ? previous.filter(
            (metric) => metric !== key
          )
        : [...previous, key]
    );
  };

  /*
   * Calculate pH Y-axis domain.
   */
const phValues = chartData
  .map((point) => Number(point.ph))
  .filter(
    (value) =>
      Number.isFinite(value) &&
      value >= 0 &&
      value <= 14
  );

// Keep pH axis stable for all intervals, including 1 min.
const phMin = 5.0;
const phMax = 7.5;
  
  return (
    <div
      className="card chart-section"
      id="telemetry-chart"
    >
      <div className="chart-section__header">
        <div
          className="card__title"
          style={{ margin: 0 }}
        >
          Sensor analytics time-series card
          for IoT hydroponics
        </div>

        <button
          className="section-title__link"
          onClick={
            onOpenTelemetryDrawer
          }
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Inspect Raw Telemetry Stream{' '}
          <ExternalLink size={12} />
        </button>
      </div>

      <div className="chart-section__controls">
        {/* Range */}
        <div className="chart-tabs">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option}
              className={`chart-tab ${
                range === option
                  ? 'chart-tab--active'
                  : ''
              }`}
              onClick={() =>
                setRange(option)
              }
            >
              {option}
            </button>
          ))}
        </div>

        {/* Display mode */}
        <select
          className="btn btn--ghost btn--sm"
          style={{
            background:
              'var(--bg-input)',
          }}
          value={displayMode}
          onChange={(event) =>
            setDisplayMode(
              event.target.value
            )
          }
        >
          <option value="smoothed">
            Smoothed (EMA)
          </option>

          <option value="raw">
            Raw
          </option>
        </select>

        {/* Data interval */}
        <select
          className="btn btn--ghost btn--sm"
          style={{
            background:
              'var(--bg-input)',
          }}
          value={interval}
          onChange={(event) =>
            setInterval(
              event.target.value
            )
          }
        >
          {INTERVAL_OPTIONS.map(
            (option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            )
          )}
        </select>

        {/* Metrics */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            marginLeft: '0.5rem',
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              color:
                'var(--text-muted)',
              marginRight:
                '0.25rem',
            }}
          >
            Metrics
          </span>

          <div className="metric-toggle">
            {METRICS.map((metric) => (
              <button
                key={metric.key}
                className={`metric-toggle__btn ${
                  activeMetrics.includes(
                    metric.key
                  )
                    ? 'metric-toggle__btn--active'
                    : ''
                }`}
                style={
                  activeMetrics.includes(
                    metric.key
                  )
                    ? {
                        background:
                          metric.color,
                        borderColor:
                          metric.color,
                        color:
                          metric.key ===
                          'ec_ms_cm'
                            ? '#060a13'
                            : undefined,
                      }
                    : {}
                }
                onClick={() =>
                  toggleMetric(
                    metric.key
                  )
                }
              >
                {metric.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        className="chart-container"
        style={{
          marginTop: '0.75rem',
        }}
      >
        {loading ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems:
                'center',
              justifyContent:
                'center',
            }}
          >
            <div
              className="skeleton"
              style={{
                width: '90%',
                height: '80%',
              }}
            />
          </div>
        ) : chartData.length === 0 ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems:
                'center',
              justifyContent:
                'center',
              color:
                'var(--text-muted)',
              fontSize: '0.85rem',
            }}
          >
            No telemetry data
            available for this range.
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <ComposedChart
              data={chartData}
              margin={{
                top: 10,
                right: 15,
                left: 0,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient
                  id="phGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#06b6d4"
                    stopOpacity={0.15}
                  />

                  <stop
                    offset="100%"
                    stopColor="#06b6d4"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(30, 43, 74, 0.5)"
              />

              <XAxis
                dataKey="timeLabel"
                tick={{
                  fill: '#5a6f94',
                  fontSize: 11,
                }}
                axisLine={{
                  stroke: '#1c2b4a',
                }}
                tickLine={false}
                interval="preserveStartEnd"
              />

             <YAxis
  yAxisId="left"
  domain={[phMin, phMax]}
  allowDataOverflow={false}
  tick={{
    fill: '#5a6f94',
    fontSize: 11,
  }}
  axisLine={{
    stroke: '#1c2b4a',
  }}
  tickLine={false}
  label={{
    value: 'Solution pH',
    angle: -90,
    position: 'insideLeft',
    fill: '#5a6f94',
    fontSize: 11,
    dx: -5,
  }}
/>

              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{
                  fill: '#5a6f94',
                  fontSize: 11,
                }}
                axisLine={{
                  stroke: '#1c2b4a',
                }}
                tickLine={false}
                label={{
                  value:
                    'EC (mS/cm)',
                  angle: 90,
                  position:
                    'insideRight',
                  fill: '#5a6f94',
                  fontSize: 11,
                  dx: 5,
                }}
              />

              {/* Target pH band */}
              {activeMetrics.includes(
                'ph'
              ) && (
                <ReferenceArea
                  yAxisId="left"
                  y1={5.8}
                  y2={6.4}
                  fill="rgba(16, 185, 129, 0.08)"
                  stroke="rgba(16, 185, 129, 0.2)"
                  strokeDasharray="4 4"
                  label={{
                    value:
                      'Target 5.8 - 6.4',
                    position:
                      'insideTopLeft',
                    fill: '#10b981',
                    fontSize: 10,
                  }}
                />
              )}

              <Tooltip
                contentStyle={{
                  background:
                    '#0f1629',
                  border:
                    '1px solid #1c2b4a',
                  borderRadius: 6,
                  fontSize: 12,
                  color: '#f1f5f9',
                }}
                labelStyle={{
                  color: '#8b9dc3',
                }}
              />

              {/* pH */}
              {activeMetrics.includes(
                'ph'
              ) && (
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
                    activeDot={{
                      r: 4,
                      fill: '#06b6d4',
                    }}
                  />
                </>
              )}

              {/* EC */}
              {activeMetrics.includes(
                'ec_ms_cm'
              ) && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="ec_ms_cm"
                  stroke="#f1f5f9"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: '#f1f5f9',
                  }}
                  strokeDasharray="4 2"
                />
              )}

              {/* Water temperature */}
              {activeMetrics.includes(
                'water_temp_c'
              ) && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="water_temp_c"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: '#f59e0b',
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="chart-legend">
        {METRICS
          .filter((metric) =>
            activeMetrics.includes(
              metric.key
            )
          )
          .map((metric) => {
            const lastValue =
              chartData.length > 0
                ? chartData[
                    chartData.length - 1
                  ][metric.key]
                : null;

            return (
              <div
                key={metric.key}
                className="chart-legend__item"
              >
                <div
                  className="chart-legend__dot"
                  style={{
                    background:
                      metric.color,
                  }}
                />

                <span>
                  {metric.label}
                </span>

                <strong
                  style={{
                    color:
                      metric.color,
                  }}
                >
                  {lastValue != null &&
                  Number.isFinite(
                    Number(lastValue)
                  )
                    ? Number(
                        lastValue
                      ).toFixed(
                        metric.key ===
                          'water_temp_c'
                          ? 1
                          : 2
                      )
                    : '—'}
                </strong>
              </div>
            );
          })}
      </div>
    </div>
  );
}