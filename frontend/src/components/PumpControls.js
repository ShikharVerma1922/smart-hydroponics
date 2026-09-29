'use client';

import { useState } from 'react';
import { Droplets, Cog, Zap } from 'lucide-react';
import { actuatorAPI } from '@/lib/api';

export default function PumpControls({ deviceId, lockout }) {
  // Pump states
  const [pumps, setPumps] = useState([
    { id: 'PH_DOWN', name: 'Pump 1: pH Down (Phosphoric)', status: 'IDLE', volume: 12.5, duration: 2000 },
    { id: 'NUTRIENT_A', name: 'Pump 2: Nutrient Stock A', status: 'IDLE', volume: 8.3, duration: 2500 },
    { id: 'NUTRIENT_B', name: 'Pump 3: Nutrient Stock B', status: 'QUEUED', volume: 4.2, duration: 2500 },
  ]);
  const [activePump, setActivePump] = useState(null);
  const [error, setError] = useState(null);

  // Circulation state
  const [circMode, setCircMode] = useState('INTERVAL');
  const [runMin, setRunMin] = useState(15);
  const [restMin, setRestMin] = useState(15);
  const [circSaving, setCircSaving] = useState(false);

  const isLocked = lockout?.isActive;

  const handleManualPulse = async (pumpType, durationMs) => {
    setError(null);
    setActivePump(pumpType);
    try {
      await actuatorAPI.manualPulse(deviceId, pumpType, durationMs);
      // Animate dispensing state
      setPumps((prev) =>
        prev.map((p) =>
          p.id === pumpType ? { ...p, status: 'DISPENSING' } : p
        )
      );
      // Reset status after duration
      setTimeout(() => {
        setPumps((prev) =>
          prev.map((p) =>
            p.id === pumpType ? { ...p, status: 'IDLE' } : p
          )
        );
        setActivePump(null);
      }, durationMs + 500);
    } catch (err) {
      setError(err.data?.error || err.message);
      setActivePump(null);
    }
  };

  const handleDurationChange = (pumpId, value) => {
    setPumps((prev) =>
      prev.map((p) =>
        p.id === pumpId ? { ...p, duration: parseInt(value) || 0 } : p
      )
    );
  };

  const handleSaveCirculation = async () => {
    setCircSaving(true);
    try {
      await actuatorAPI.setCirculation(deviceId, circMode, runMin, restMin);
    } catch (err) {
      setError(err.message);
    } finally {
      setCircSaving(false);
    }
  };

  return (
    <div className="pump-grid" id="pump-controls">
      {/* Left: Peristaltic Dosing Pumps */}
      <div>
        <div className="section-title" style={{ fontSize: '0.9375rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Droplets size={16} />
            Peristaltic Dosing Pumps
          </span>
        </div>

        <div className="pump-cards">
          {pumps.map((pump) => {
            const isDispensing = pump.status === 'DISPENSING' || activePump === pump.id;
            const isQueued = pump.status === 'QUEUED';

            return (
              <div
                key={pump.id}
                className={`card pump-card ${isDispensing ? 'card--glow' : ''}`}
                id={`pump-${pump.id}`}
              >
                <div className="pump-card__header">
                  <div className="pump-card__name">{pump.name}</div>
                  {isDispensing ? (
                    <span className="pump-card__status-badge pump-card__status-badge--dispensing">
                      <Zap size={10} />
                      DISPENSING ({pump.duration}ms)
                    </span>
                  ) : isQueued ? (
                    <span className="pump-card__status-badge pump-card__status-badge--queued">
                      Standby
                    </span>
                  ) : (
                    <span className="pump-card__status-badge pump-card__status-badge--idle">
                      {pump.status}
                    </span>
                  )}
                </div>

                {!isQueued && (
                  <>
                    <div className="pump-card__volume">
                      {isQueued
                        ? 'Status: QUEUED for staggered sequence'
                        : `Volume Dosed Today: ${pump.volume} mL`}
                    </div>
                    <div className="pump-card__controls">
                      <input
                        type="number"
                        value={pump.duration}
                        onChange={(e) => handleDurationChange(pump.id, e.target.value)}
                        min={100}
                        max={5000}
                        step={100}
                        disabled={isLocked || isDispensing}
                        placeholder="ms"
                      />
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>ms</span>
                      <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => handleManualPulse(pump.id, pump.duration)}
                        disabled={isLocked || isDispensing}
                      >
                        Manual Prime
                      </button>
                    </div>
                  </>
                )}

                {isQueued && (
                  <div className="pump-card__volume" style={{ marginTop: '0.25rem' }}>
                    Status: QUEUED for staggered sequence
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-red)' }}>
            ⚠ {error}
          </div>
        )}
      </div>

      {/* Right: Submersible Circulation Pump */}
      <div>
        <div className="section-title" style={{ fontSize: '0.9375rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Cog size={16} />
            Submersible Circulation Pump
          </span>
        </div>

        <div className="card circulation-card" id="circulation-control">
          {/* Mode Tabs */}
          <div className="circulation-modes">
            {['CONTINUOUS', 'INTERVAL', 'OFF'].map((mode) => (
              <button
                key={mode}
                className={`circulation-mode ${circMode === mode ? 'circulation-mode--active' : ''}`}
                onClick={() => setCircMode(mode)}
              >
                {mode === 'INTERVAL' ? `Interval ${circMode === mode ? '(Active)' : ''}` : mode.charAt(0) + mode.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Status */}
          {circMode !== 'OFF' && (
            <div className="circulation-status">
              <span className="streaming-dot" />
              {circMode === 'CONTINUOUS'
                ? 'RUNNING (Continuous aeration)'
                : `RUNNING (Cycle: ${runMin}m Run / ${restMin}m Rest)`}
            </div>
          )}

          {/* Interval Fields */}
          {circMode === 'INTERVAL' && (
            <div className="circulation-fields">
              <div className="circulation-field">
                <label>Run Duration:</label>
                <div className="input-group">
                  <input
                    type="number"
                    value={runMin}
                    onChange={(e) => setRunMin(parseInt(e.target.value) || 0)}
                    min={1}
                    max={120}
                  />
                  <span>mins</span>
                </div>
              </div>
              <div className="circulation-field">
                <label>Rest Duration:</label>
                <div className="input-group">
                  <input
                    type="number"
                    value={restMin}
                    onChange={(e) => setRestMin(parseInt(e.target.value) || 0)}
                    min={1}
                    max={120}
                  />
                  <span>mins</span>
                </div>
              </div>
            </div>
          )}

          <button
            className="btn btn--primary"
            onClick={handleSaveCirculation}
            disabled={circSaving}
            style={{ alignSelf: 'center' }}
            id="save-schedule-btn"
          >
            {circSaving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
}
