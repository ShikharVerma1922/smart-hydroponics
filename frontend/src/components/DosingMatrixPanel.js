'use client';

import { useMemo } from 'react';
import { Activity, ShieldAlert, Zap, Lock, AlertTriangle } from 'lucide-react';
import { SCENARIOS, evaluateDosingScenario, getPumpStateStyle, getSeverityStyle } from '@/lib/dosingMatrix';

/**
 * Live Dosing Decision Matrix panel.
 * Shows the full 16-scenario table with the currently active row highlighted,
 * plus a live status indicator at the top.
 */
export default function DosingMatrixPanel({ sensors, targetEc, mlDiagnosis, waterLevel, isMaintenanceMode }) {
  // Evaluate current scenario
  const { scenario: activeScenario, alerts: matrixAlerts } = useMemo(() => {
    return evaluateDosingScenario({
      ph: sensors?.ph,
      ec: sensors?.ec_ms_cm,
      waterLevel: waterLevel,
      targetEc: targetEc || { min: 1.2, max: 1.8 },
      mlDiagnosis: mlDiagnosis,
      isMaintenanceMode: isMaintenanceMode || false,
    });
  }, [sensors?.ph, sensors?.ec_ms_cm, waterLevel, targetEc, mlDiagnosis, isMaintenanceMode]);

  const severityStyle = getSeverityStyle(activeScenario.severity);

  return (
    <div className="card" id="dosing-matrix" style={{ padding: 0, overflow: 'hidden' }}>
      {/* ── Header: Active Scenario Indicator ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--border-default)',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Activity size={16} />
          <span style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
            Dosing Decision Matrix
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            Live closed-loop dosing logic • 16 scenarios
          </span>
        </div>

        {/* Active Scenario Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.85rem',
          borderRadius: '8px',
          background: severityStyle.bg,
          border: `1px solid ${severityStyle.border}`,
          animation: activeScenario.severity === 'critical' ? 'glow-pulse 1.5s ease-in-out infinite' : 'none',
        }}>
          <span style={{ fontSize: '1rem' }}>{activeScenario.icon}</span>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: severityStyle.color }}>
              {activeScenario.name}
            </div>
            <div style={{ fontSize: '0.6875rem', color: severityStyle.color, opacity: 0.8 }}>
              {activeScenario.rationale}
            </div>
          </div>
        </div>
      </div>

      {/* ── Live Pump Status Strip ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        padding: '0.6rem 1.25rem',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-default)',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          Active Pump Commands:
        </span>
        {[
          { key: 'PH_DOWN', label: 'Pump 1 (pH Down)' },
          { key: 'NUTRIENT_A', label: 'Pump 2 (Part A)' },
          { key: 'NUTRIENT_B', label: 'Pump 3 (Part B)' },
        ].map(({ key, label }) => {
          const state = activeScenario.pumps[key];
          const style = getPumpStateStyle(state);
          const duration = activeScenario.durations[key];
          return (
            <div key={key} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              background: style.bg,
              border: `1px solid ${style.color}33`,
            }}>
              {state === 'ON' && <Zap size={11} style={{ color: style.color }} />}
              {state === 'LOCKOUT' && <Lock size={11} style={{ color: style.color }} />}
              {state === 'EMERGENCY' && <ShieldAlert size={11} style={{ color: style.color }} />}
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: style.color }}>
                {label}: {style.label}
                {duration > 0 && ` (${duration}ms)`}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Matrix Alerts ── */}
      {matrixAlerts.length > 0 && (
        <div style={{ padding: '0.5rem 1.25rem', borderBottom: '1px solid var(--border-default)' }}>
          {matrixAlerts.map((alert, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.6rem',
              borderRadius: '6px',
              background: severityStyle.bg,
              fontSize: '0.75rem',
              fontWeight: 500,
              color: severityStyle.color,
              marginBottom: i < matrixAlerts.length - 1 ? '0.25rem' : 0,
            }}>
              <AlertTriangle size={12} />
              {alert}
            </div>
          ))}
        </div>
      )}

      {/* ── Full Decision Table ── */}
      <div className="log-table-wrapper" style={{ maxHeight: '420px', overflowY: 'auto' }}>
        <table className="log-table" style={{ fontSize: '0.75rem' }}>
          <thead>
            <tr>
              <th style={{ width: 30 }}></th>
              <th>Scenario / Diagnosis</th>
              <th>pH Condition</th>
              <th>EC Condition</th>
              <th>Pump 1 (pH Down)</th>
              <th>Pump 2 (Part A)</th>
              <th>Pump 3 (Part B)</th>
              <th>Execution & Safety Rationale</th>
            </tr>
          </thead>
          <tbody>
            {SCENARIOS.map((s) => {
              const isActive = s.id === activeScenario.id;
              const rowSevStyle = getSeverityStyle(s.severity);
              return (
                <tr
                  key={s.id}
                  id={`matrix-row-${s.id}`}
                  style={{
                    background: isActive ? `${rowSevStyle.bg}` : undefined,
                    borderLeft: isActive ? `3px solid ${rowSevStyle.color}` : '3px solid transparent',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <td style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                    {isActive ? (
                      <span style={{ animation: 'pulse-dot 1.5s infinite' }}>{s.icon}</span>
                    ) : (
                      <span style={{ opacity: 0.4 }}>{s.icon}</span>
                    )}
                  </td>
                  <td>
                    <span style={{
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? rowSevStyle.color : 'var(--text-secondary)',
                    }}>
                      {s.name}
                    </span>
                    {isActive && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        marginLeft: '0.4rem',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '999px',
                        background: rowSevStyle.bg,
                        border: `1px solid ${rowSevStyle.border}`,
                        fontSize: '0.5625rem',
                        fontWeight: 700,
                        color: rowSevStyle.color,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}>
                        <span className="streaming-dot" style={{ width: 5, height: 5, background: rowSevStyle.color }} />
                        ACTIVE
                      </span>
                    )}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: isActive ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.6875rem' }}>
                    {s.phCondition}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: isActive ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.6875rem' }}>
                    {s.ecCondition}
                  </td>
                  {/* Pump cells */}
                  {['PH_DOWN', 'NUTRIENT_A', 'NUTRIENT_B'].map((pumpKey) => {
                    const pState = s.pumps[pumpKey];
                    const pStyle = getPumpStateStyle(pState);
                    const dur = s.durations[pumpKey];
                    return (
                      <td key={pumpKey}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: isActive ? pStyle.bg : 'transparent',
                          color: isActive ? pStyle.color : (pState === 'OFF' ? 'var(--text-muted)' : pStyle.color),
                          fontWeight: isActive ? 700 : 500,
                          fontSize: '0.6875rem',
                          fontFamily: 'var(--font-mono)',
                          opacity: isActive ? 1 : 0.7,
                        }}>
                          {pStyle.label}
                          {dur > 0 && (
                            <span style={{ fontSize: '0.5625rem', opacity: 0.8 }}>
                              ({dur}ms)
                            </span>
                          )}
                        </span>
                      </td>
                    );
                  })}
                  <td style={{
                    maxWidth: 240,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: isActive ? 500 : 400,
                    fontSize: '0.6875rem',
                    lineHeight: 1.5,
                  }}>
                    {s.rationale}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Footer: Sensor Input Summary ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.6rem 1.25rem',
        borderTop: '1px solid var(--border-default)',
        background: 'var(--bg-secondary)',
        fontSize: '0.6875rem',
        color: 'var(--text-muted)',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <span>
          Inputs: pH={sensors?.ph?.toFixed(2) ?? '—'} • EC={sensors?.ec_ms_cm?.toFixed(2) ?? '—'} mS/cm •
          Target EC=[{targetEc?.min ?? 1.2}–{targetEc?.max ?? 1.8}] •
          Water={waterLevel ?? '—'}% •
          ML={mlDiagnosis ?? 'None'}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          Priority order: Emergency → Safety → ML → Sensor → Default
        </span>
      </div>
    </div>
  );
}
