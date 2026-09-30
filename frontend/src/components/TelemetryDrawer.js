'use client';

import { useState } from 'react';
import { X, Pause, Play, FileDown } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Bottom drawer showing recent telemetry history.
 */
export default function TelemetryDrawer({ isOpen, onClose, buffer = [] }) {
  const [paused, setPaused] = useState(false);
  const [displayData, setDisplayData] = useState([]);

  // Use live buffer unless paused.
  const rows = paused ? displayData : buffer;

  // Show newest readings first, up to 50.
  const visibleRows = rows.slice().reverse().slice(0, 50);

  const handlePause = () => {
    if (!paused) {
      setDisplayData([...buffer]);
    }

    setPaused(!paused);
  };

  // Supports the actual telemetry structure:
  // {
  //   deviceId,
  //   sensors: {
  //     ph,
  //     ec_ms_cm,
  //     water_temp_c,
  //     water_level_pct,
  //     air_temp_c,
  //     humidity_pct
  //   },
  //   circulation_pump_state,
  //   timestamp
  // }
const getSensors = (row) => row?.sensors || row || {};

  const getValue = (value, suffix = '') => {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    return `${value}${suffix}`;
  };

  const handleExport = () => {
    const header =
      'Timestamp,Device ID,pH,EC (mS/cm),Water Temperature (°C),Water Level (%),Air Temperature (°C),Humidity (%),Circulation Pump\n';

    const csvRows = visibleRows
      .map((row) => {
        const sensors = getSensors(row);

        const ts = row.timestamp
          ? format(
              new Date(row.timestamp),
              'yyyy-MM-dd HH:mm:ss'
            )
          : '—';

        return [
          ts,
          row.deviceId || '—',
          sensors.ph ?? '—',
          sensors.ec_ms_cm ?? '—',
          sensors.water_temp_c ?? '—',
          sensors.water_level_pct ?? '—',
          sensors.air_temp_c ?? '—',
          sensors.humidity_pct ?? '—',
          row.circulation_pump_state || '—',
        ]
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(',');
      })
      .join('\n');

    const blob = new Blob(
      [header + csvRows],
      { type: 'text/csv' }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `telemetry-history-${format(
      new Date(),
      'yyyy-MM-dd-HHmmss'
    )}.csv`;

    a.click();

    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div
      className="drawer"
      id="telemetry-drawer"
    >
      {/* Header */}
      <div className="drawer__header">
        <div className="drawer__title">
          Recent Telemetry
        </div>

        <div className="drawer__controls">
          {/* Stream status */}
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <span
              className="streaming-dot"
              style={{
                background: paused
                  ? 'var(--accent-amber)'
                  : 'var(--accent-green)',
              }}
            />

            <span
              style={{
                fontSize: '0.75rem',
                color: paused
                  ? 'var(--accent-amber)'
                  : 'var(--accent-green)',
              }}
            >
              {paused
                ? 'Paused'
                : 'Streaming Live'}
            </span>
          </span>

          {/* Pause / Resume */}
          <button
            className="btn btn--ghost btn--sm"
            onClick={handlePause}
          >
            {paused ? (
              <Play size={12} />
            ) : (
              <Pause size={12} />
            )}

            {paused
              ? 'Resume'
              : 'Pause Stream'}
          </button>

          {/* Export */}
          <button
            className="btn btn--ghost btn--sm"
            onClick={handleExport}
          >
            <FileDown size={12} />
            Export CSV
          </button>

          {/* Close */}
          <button
            className="modal__close"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="drawer__body">
        <div className="log-table-wrapper">
          <table className="log-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Device ID</th>
                <th>pH</th>
                <th>EC (mS/cm)</th>
                <th>Water Temp</th>
                <th>Water Level</th>
                <th>Air Temp</th>
                <th>Humidity</th>
                <th>Circulation Pump</th>
              </tr>
            </thead>

            <tbody>
              {visibleRows.map((row, i) => {
                const sensors = getSensors(row);

                const timestamp = row.timestamp
                  ? format(
                      new Date(row.timestamp),
                      'yyyy-MM-dd HH:mm:ss'
                    )
                  : '—';

                return (
                  <tr
                    key={`${row.timestamp}-${row.deviceId}-${i}`}
                  >
                    {/* Timestamp */}
                    <td className="log-table__timestamp">
                      {timestamp}
                    </td>

                    {/* Device ID */}
                    <td className="text-mono">
                      {row.deviceId || '—'}
                    </td>

                    {/* pH */}
                    <td className="text-mono">
                      {getValue(sensors.ph)}
                    </td>

                    {/* EC */}
                    <td className="text-mono">
                      {getValue(
                        sensors.ec_ms_cm
                      )}
                    </td>

                    {/* Water temperature */}
                    <td className="text-mono">
                      {getValue(
                        sensors.water_temp_c,
                        '°C'
                      )}
                    </td>

                    {/* Water level */}
                    <td className="text-mono">
                      {getValue(
                        sensors.water_level_pct,
                        '%'
                      )}
                    </td>

                    {/* Air temperature */}
                    <td className="text-mono">
                      {getValue(
                        sensors.air_temp_c,
                        '°C'
                      )}
                    </td>

                    {/* Humidity */}
                    <td className="text-mono">
                      {getValue(
                        sensors.humidity_pct,
                        '%'
                      )}
                    </td>

                    {/* Circulation pump */}
                    <td>
                      <span
                        className="badge badge--detection"
                        style={{
                          fontSize: '0.625rem',
                        }}
                      >
                        {row.circulation_pump_state ||
                          '-'}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* Empty state */}
              {visibleRows.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      padding: '2rem',
                    }}
                  >
                    No recent telemetry history
                    available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}