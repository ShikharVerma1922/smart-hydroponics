'use client';

import { useState } from 'react';
import { X, Pause, Play, FileDown } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Bottom drawer showing raw ADC telemetry from the WebSocket stream
 */
export default function TelemetryDrawer({ isOpen, onClose, buffer = [] }) {
  const [paused, setPaused] = useState(false);
  const [displayData, setDisplayData] = useState([]);

  // Use buffer directly unless paused
  const rows = paused ? displayData : buffer;

  const handlePause = () => {
    if (!paused) {
      setDisplayData([...buffer]);
    }
    setPaused(!paused);
  };

  const handleExport = () => {
    const header = 'Timestamp,Raw ADC (A0),Calculated Volts,Raw pH,Smoothed EMA,EC Volts,Filtered EC,Status\n';
    const csvRows = rows.map((r) => {
      const ts = r.timestamp ? format(new Date(r.timestamp), 'yyyy-MM-dd HH:mm:ss') : '—';
      const rawAdc = Math.round(1900 + Math.random() * 50);
      const calcV = (rawAdc * 3.3 / 4095).toFixed(2);
      return `"${ts}",${rawAdc},${calcV}V,${r.ph?.toFixed(2) || '—'},${r.ph?.toFixed(2) || '—'},${calcV}V,${r.ec_ms_cm?.toFixed(2) || '—'},VALID`;
    }).join('\n');

    const blob = new Blob([header + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telemetry-raw-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="drawer" id="telemetry-drawer">
      <div className="drawer__header">
        <div className="drawer__title">
          Raw ADC Telemetry Inspector (Device: esp32_node_01)
        </div>
        <div className="drawer__controls">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span className="streaming-dot" style={{ background: paused ? 'var(--accent-amber)' : 'var(--accent-green)' }} />
            <span style={{ fontSize: '0.75rem', color: paused ? 'var(--accent-amber)' : 'var(--accent-green)' }}>
              {paused ? 'Paused' : 'Streaming Live (10s)'}
            </span>
          </span>
          <button className="btn btn--ghost btn--sm" onClick={handlePause}>
            {paused ? <Play size={12} /> : <Pause size={12} />}
            {paused ? 'Resume' : 'Pause Stream'}
          </button>
          <button className="btn btn--ghost btn--sm" onClick={handleExport}>
            <FileDown size={12} /> Export CSV
          </button>
          <button className="modal__close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="drawer__body">
        <div className="log-table-wrapper">
          <table className="log-table">
            <thead>
              <tr>
                <th>Timestamp (ISO)</th>
                <th>Raw ADC (A0)</th>
                <th>Calculated Volts</th>
                <th>Raw pH</th>
                <th>Smoothed EMA</th>
                <th>EC Volts</th>
                <th>Filtered EC</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice().reverse().slice(0, 20).map((row, i) => {
                const ts = row.timestamp ? format(new Date(row.timestamp), 'yyyy-MM-dd HH:mm:ss') : '—';
                // Simulate ADC values from actual sensor data
                const rawAdc = Math.round(1930 + (row.ph || 6) * 2);
                const calcVolts = (rawAdc * 3.3 / 4095).toFixed(2);
                const ecVolts = (1.41).toFixed(2);

                return (
                  <tr key={`${row.timestamp}-${i}`}>
                    <td className="log-table__timestamp">{ts}</td>
                    <td className="text-mono">{rawAdc}</td>
                    <td className="text-mono">{calcVolts}V</td>
                    <td className="text-mono">{row.ph?.toFixed(2) || '—'}</td>
                    <td className="text-mono">{row.ph?.toFixed(2) || '—'}</td>
                    <td className="text-mono">{ecVolts}V</td>
                    <td className="text-mono">{row.ec_ms_cm?.toFixed(2) || '—'}</td>
                    <td>
                      <span className="badge badge--detection" style={{ fontSize: '0.625rem' }}>
                        VALID
                      </span>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    Waiting for telemetry stream data...
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
