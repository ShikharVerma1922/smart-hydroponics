'use client';

import { useState, useEffect } from 'react';
import { FileDown, ClipboardList } from 'lucide-react';
import { dosingAPI } from '@/lib/api';
import { format } from 'date-fns';

const SOURCE_FILTERS = [
  { label: 'All Sources', value: '' },
  { label: 'Autonomous', value: 'AUTONOMOUS_EC' },
  { label: 'ML-Biased', value: 'ML_BIASED' },
  { label: 'Manual', value: 'MANUAL_OVERRIDE' },
];

const SOURCE_BADGE_MAP = {
  AUTONOMOUS_EC: 'badge--autonomous-ec',
  AUTONOMOUS_PH: 'badge--autonomous-ph',
  ML_BIASED: 'badge--ml-biased',
  MANUAL_OVERRIDE: 'badge--manual',
};

// Estimate volume from duration (rough: 1.7 mL/sec)
const estimateVolume = (durationMs) => ((durationMs / 1000) * 1.7).toFixed(1);

const ALL_DEMO_LOGS = [
  { id: '1', timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), pumpType: 'NUTRIENT_A', durationMs: 4000, source: 'ML_BIASED', rationale: 'Nitrogen deficiency detected (94.2% conf). A-biased pulse.', diagnosticReportId: 'rep_0042' },
  { id: '2', timestamp: new Date(Date.now() - 1000 * 60 * 8 + 15000).toISOString(), pumpType: 'NUTRIENT_B', durationMs: 2000, source: 'ML_BIASED', rationale: 'Secondary Part B pulse after 15s sequential anti-precipitation delay.', diagnosticReportId: 'rep_0042' },
  { id: '3', timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), pumpType: 'PH_DOWN', durationMs: 2500, source: 'AUTONOMOUS_PH', rationale: 'Routine high pH drift (pH 6.64 > 6.50 target threshold).' },
  { id: '4', timestamp: new Date(Date.now() - 1000 * 60 * 72).toISOString(), pumpType: 'NUTRIENT_A', durationMs: 2500, source: 'AUTONOMOUS_EC', rationale: 'Standard 1:1 replenishment pulse (EC 1.14 mS/cm < 1.20 min band).' },
  { id: '5', timestamp: new Date(Date.now() - 1000 * 60 * 72 + 15000).toISOString(), pumpType: 'NUTRIENT_B', durationMs: 2500, source: 'AUTONOMOUS_EC', rationale: 'Standard 1:1 replenishment Part B pulse (EC balanced).' },
  { id: '6', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), pumpType: 'PH_DOWN', durationMs: 2000, source: 'AUTONOMOUS_PH', rationale: 'pH drift correction pulse.' },
  { id: '7', timestamp: new Date(Date.now() - 1000 * 60 * 165).toISOString(), pumpType: 'NUTRIENT_B', durationMs: 4000, source: 'ML_BIASED', rationale: 'Phosphorus deficiency detected. Stock B exclusive pulse (Monopotassium).', diagnosticReportId: 'rep_0038' },
  { id: '8', timestamp: new Date(Date.now() - 1000 * 60 * 220).toISOString(), pumpType: 'NUTRIENT_A', durationMs: 2500, source: 'AUTONOMOUS_EC', rationale: 'Autonomous nutrient EC restoration.' },
  { id: '9', timestamp: new Date(Date.now() - 1000 * 60 * 280).toISOString(), pumpType: 'PH_DOWN', durationMs: 1500, source: 'MANUAL_OVERRIDE', rationale: 'Operator manual pump priming and line flush.' },
  { id: '10', timestamp: new Date(Date.now() - 1000 * 60 * 340).toISOString(), pumpType: 'NUTRIENT_A', durationMs: 4000, source: 'ML_BIASED', rationale: 'Calcium deficiency diagnosis. Stock A boost.', diagnosticReportId: 'rep_0035' },
  { id: '11', timestamp: new Date(Date.now() - 1000 * 60 * 410).toISOString(), pumpType: 'NUTRIENT_B', durationMs: 4000, source: 'ML_BIASED', rationale: 'Magnesium deficiency diagnosis. Stock B boost.', diagnosticReportId: 'rep_0031' },
  { id: '12', timestamp: new Date(Date.now() - 1000 * 60 * 480).toISOString(), pumpType: 'PH_DOWN', durationMs: 2500, source: 'AUTONOMOUS_PH', rationale: 'Night-cycle alkaline buffering pulse.' },
  { id: '13', timestamp: new Date(Date.now() - 1000 * 60 * 550).toISOString(), pumpType: 'NUTRIENT_A', durationMs: 2500, source: 'AUTONOMOUS_EC', rationale: 'Autonomous EC maintenance.' },
  { id: '14', timestamp: new Date(Date.now() - 1000 * 60 * 550 + 15000).toISOString(), pumpType: 'NUTRIENT_B', durationMs: 2500, source: 'AUTONOMOUS_EC', rationale: 'Autonomous EC maintenance sequence.' },
  { id: '15', timestamp: new Date(Date.now() - 1000 * 60 * 620).toISOString(), pumpType: 'PH_DOWN', durationMs: 1500, source: 'MANUAL_OVERRIDE', rationale: 'Reservoir refresh calibration injection.' },
];

export default function DosingLog({ deviceId, newLogEntry }) {
  const [allLogs, setAllLogs] = useState(ALL_DEMO_LOGS);
  const [currentPage, setCurrentPage] = useState(1);
  const [sourceFilter, setSourceFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const pageSize = 5;

  // Filter logs by source if filter applied
  const filteredLogs = sourceFilter
    ? allLogs.filter((l) => l.source === sourceFilter)
    : allLogs;

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  
  // Slice logs for current page view
  const currentLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const fetchLogs = async (page = 1) => {
    setCurrentPage(page);
    try {
      const params = { deviceId, page, limit: pageSize };
      if (sourceFilter) params.source = sourceFilter;
      const res = await dosingAPI.getLogs(params);
      if (res.data && res.data.length > 0) {
        setAllLogs(res.data);
      }
    } catch (err) {
      // Keep interactive local dataset when backend is offline
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [sourceFilter]);

  // Prepend new entries from WebSocket
  useEffect(() => {
    if (newLogEntry?.log) {
      setLogs((prev) => [newLogEntry.log, ...prev].slice(0, pagination.limit));
      setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
    }
  }, [newLogEntry]);

  const isRecent = (timestamp) => {
    return Date.now() - new Date(timestamp).getTime() < 60000;
  };

  const handleExport = () => {
    // Build CSV
    const header = 'Timestamp,Actuator,Duration(ms),Volume(mL),Source,Rationale\n';
    const rows = logs.map((l) =>
      `"${l.timestamp}","${l.pumpType}",${l.durationMs},${estimateVolume(l.durationMs)},"${l.source}","${l.rationale}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dosing-audit-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="card log-section" id="dosing-log">
      <div className="log-section__header">
        <div className="section-title" style={{ margin: 0, fontSize: '0.9375rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ClipboardList size={16} />
            Actuator Dosing & Safety Event Log
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Source Filters */}
          <div className="log-filters">
            {SOURCE_FILTERS.map((f) => (
              <button
                key={f.value}
                className={`log-filter ${sourceFilter === f.value ? 'log-filter--active' : ''}`}
                onClick={() => setSourceFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select
            className="btn btn--ghost btn--sm"
            style={{ background: 'var(--bg-input)', fontSize: '0.6875rem' }}
            defaultValue="7d"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>

          <button className="btn btn--ghost btn--sm" onClick={handleExport} id="export-csv-btn">
            <FileDown size={12} /> Export Audit CSV
          </button>
        </div>
      </div>

      <div className="log-table-wrapper">
        <table className="log-table">
          <thead>
            <tr>
              <th>Timestamp (ISO)</th>
              <th>Actuator / Pump</th>
              <th>Duration</th>
              <th>Volume (Est.)</th>
              <th>Trigger Source</th>
              <th>Rationale & Setpoint Error</th>
              <th>Linked Scan</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="skeleton" style={{ width: '60%', height: 16, margin: '0 auto' }} />
                </td>
              </tr>
            ) : currentLogs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No dosing events recorded
                </td>
              </tr>
            ) : (
              currentLogs.map((log) => (
                <tr key={log.id}>
                  <td className="log-table__timestamp">
                    {isRecent(log.timestamp) && <span className="log-table__recent-dot" />}
                    {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                  <td>{formatPumpType(log.pumpType)}</td>
                  <td>{log.durationMs} ms</td>
                  <td>{estimateVolume(log.durationMs)} mL</td>
                  <td>
                    <span className={`badge badge--source ${SOURCE_BADGE_MAP[log.source] || ''}`}>
                      {log.source}
                    </span>
                  </td>
                  <td style={{ maxWidth: 250, fontSize: '0.75rem' }}>
                    {log.rationale || '—'}
                  </td>
                  <td>
                    {log.diagnosticReportId ? (
                      <span className="log-table__scan-link">
                        Scan #{log.diagnosticReportId.substring(0, 8)}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        <div className="pagination__info">
          Showing {filteredLogs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
          {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} events
        </div>
        <div className="pagination__controls">
          <button
            className="pagination__btn"
            disabled={currentPage <= 1}
            onClick={() => fetchLogs(currentPage - 1)}
            id="pagination-prev"
          >
            ‹ Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`pagination__btn ${currentPage === p ? 'pagination__btn--active' : ''}`}
              onClick={() => fetchLogs(p)}
              id={`pagination-page-${p}`}
            >
              {p}
            </button>
          ))}
          <button
            className="pagination__btn"
            disabled={currentPage >= totalPages}
            onClick={() => fetchLogs(currentPage + 1)}
            id="pagination-next"
          >
            Next ›
          </button>
        </div>
      </div>
    </div>
  );
}

function formatPumpType(type) {
  const map = {
    PH_DOWN: 'pH Down (Acid)',
    NUTRIENT_A: 'Nutrient Stock A',
    NUTRIENT_B: 'Nutrient Stock B',
  };
  return map[type] || type;
}
