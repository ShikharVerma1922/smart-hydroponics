'use client';

import { useState, useEffect } from 'react';
import { FileDown, ClipboardList } from 'lucide-react';
import { dosingAPI } from '@/lib/api';
import { format } from 'date-fns';

const SOURCE_FILTERS = [
  { label: 'All Sources', value: '' },
  { label: 'Autonomous', value: 'AUTONOMOUS_PH,AUTONOMOUS_EC' },
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

export default function DosingLog({ deviceId, newLogEntry }) {
  const pageSize = 5;
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: pageSize });
const [sourceFilter, setSourceFilter] = useState('');
const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(true);
const socketLog = newLogEntry?.deviceId === deviceId
  ? newLogEntry.log
  : null;

const socketLogMatchesFilter =
  socketLog &&
  (
    !sourceFilter ||
    sourceFilter.split(',').includes(socketLog.source)
  );

const hasUnfetchedSocketLog =
  socketLogMatchesFilter &&
  !logs.some((log) => log.id === socketLog.id);
  const totalCount = pagination.total + (hasUnfetchedSocketLog ? 1 : 0);
  const totalPages = Math.max(1, pagination.pages, Math.ceil(totalCount / pageSize));
  const currentLogs = currentPage === 1 && hasUnfetchedSocketLog
    ? [socketLog, ...logs].slice(0, pageSize)
    : logs;

  useEffect(() => {
    let isCurrent = true;

    const loadLogs = async () => {
      try {
        const params = { deviceId, page: currentPage, limit: pageSize,   range: dateRange, };
        if (sourceFilter) params.source = sourceFilter;
        const res = await dosingAPI.getLogs(params);
        if (!isCurrent) return;
        setLogs(res.data || []);
        setPagination(res.pagination || { total: 0, page: currentPage, pages: 1, limit: pageSize });
      } catch {
        if (isCurrent) {
          setLogs([]);
          setPagination({ total: 0, page: currentPage, pages: 1, limit: pageSize });
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    loadLogs();
    return () => {
      isCurrent = false;
    };
  }, [deviceId, currentPage, sourceFilter, dateRange]);

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
                onClick={() => {
                  if (sourceFilter === f.value) return;
                  setLoading(true);
                  setCurrentPage(1);
                  setSourceFilter(f.value);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select
  className="btn btn--ghost btn--sm"
  style={{ background: 'var(--bg-input)', fontSize: '0.6875rem' }}
  value={dateRange}
  onChange={(e) => {
    setLoading(true);
    setCurrentPage(1);
    setDateRange(e.target.value);
  }}
>
  <option value="today">Today</option>
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
          Showing {totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
          {Math.min(currentPage * pageSize, totalCount)} of {totalCount} events
        </div>
        <div className="pagination__controls">
          <button
            className="pagination__btn"
            disabled={currentPage <= 1}
            onClick={() => {
              setLoading(true);
              setCurrentPage(currentPage - 1);
            }}
            id="pagination-prev"
          >
            ‹ Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`pagination__btn ${currentPage === p ? 'pagination__btn--active' : ''}`}
              onClick={() => {
                if (currentPage === p) return;
                setLoading(true);
                setCurrentPage(p);
              }}
              id={`pagination-page-${p}`}
            >
              {p}
            </button>
          ))}
          <button
            className="pagination__btn"
            disabled={currentPage >= totalPages}
            onClick={() => {
              setLoading(true);
              setCurrentPage(currentPage + 1);
            }}
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
