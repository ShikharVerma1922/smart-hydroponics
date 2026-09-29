'use client';

import { useEffect, useState } from 'react';
import { Droplets, Cog, Zap } from 'lucide-react';
import { actuatorAPI } from '@/lib/api';

export default function PumpControls({ deviceId, lockout }) {
  const [pumps, setPumps] = useState([
    { id: 'PH_DOWN', name: 'pH Down', duration: 2000 },
    { id: 'NUTRIENT_A', name: 'Nutrient A', duration: 2500 },
    { id: 'NUTRIENT_B', name: 'Nutrient B', duration: 2500 },
  ]);

  const [activePump, setActivePump] = useState(null);
  const [error, setError] = useState(null);

  const [circMode, setCircMode] = useState('INTERVAL');
  const [runMin, setRunMin] = useState(15);
  const [restMin, setRestMin] = useState(15);
  const [circSaving, setCircSaving] = useState(false);
  const [circLoading, setCircLoading] = useState(true);
  const [circUpdatedAt, setCircUpdatedAt] = useState(null);

  const isLocked = Boolean(lockout?.isActive);

  // Load the actual persisted circulation state from backend
  useEffect(() => {
    let cancelled = false;

    const loadCirculation = async () => {
      setCircLoading(true);
      setError(null);

      try {
        const response = await actuatorAPI.getCirculation(deviceId);
        const data = response?.data;

        if (cancelled || !data) return;

        setCircMode(data.mode || 'INTERVAL');
        setRunMin(Number(data.runMin) || 15);
        setRestMin(Number(data.restMin) || 15);
        setCircUpdatedAt(data.updatedAt || null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.data?.error ||
              err.message ||
              'Failed to load circulation status'
          );
        }
      } finally {
        if (!cancelled) {
          setCircLoading(false);
        }
      }
    };

    loadCirculation();

    return () => {
      cancelled = true;
    };
  }, [deviceId]);

  const handleManualPulse = async (pumpType, durationMs) => {
    if (isLocked || activePump) return;

    setError(null);
    setActivePump(pumpType);

    try {
      await actuatorAPI.manualPulse(
        deviceId,
        pumpType,
        durationMs
      );

      setTimeout(
        () => setActivePump(null),
        durationMs + 500
      );
    } catch (err) {
      setError(
        err.data?.error ||
          err.message ||
          'Failed to run pump'
      );

      setActivePump(null);
    }
  };

  const handleDurationChange = (pumpId, value) => {
    const duration = Number(value);

    setPumps((prev) =>
      prev.map((pump) =>
        pump.id === pumpId
          ? {
              ...pump,
              duration: Number.isFinite(duration)
                ? duration
                : 0,
            }
          : pump
      )
    );
  };

  const handleSaveCirculation = async () => {
    setError(null);
    setCircSaving(true);

    try {
      const response = await actuatorAPI.setCirculation(
        deviceId,
        circMode,
        runMin,
        restMin
      );

      const data = response?.data;

      if (data) {
        setCircMode(data.mode || circMode);
        setRunMin(Number(data.runMin) || 0);
        setRestMin(Number(data.restMin) || 0);
        setCircUpdatedAt(data.timestamp || null);
      }
    } catch (err) {
      setError(
        err.data?.error ||
          err.message ||
          'Failed to save schedule'
      );
    } finally {
      setCircSaving(false);
    }
  };

  return (
    <div
      className="card"
      id="pump-controls"
      style={{ padding: '0.75rem' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Manual dosing pumps */}
        <div
          style={{
            flex: '1 1 520px',
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <Droplets size={15} />
            Manual Dosing
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(3, minmax(0, 1fr))',
              gap: '0.5rem',
            }}
          >
            {pumps.map((pump) => {
              const isRunning =
                activePump === pump.id;

              return (
                <div
                  key={pump.id}
                  style={{
                    border:
                      '1px solid var(--border-color, #1c2b4a)',
                    borderRadius: 7,
                    padding: '0.55rem',
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      marginBottom: '0.4rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {pump.name}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <input
                      type="number"
                      value={pump.duration}
                      onChange={(e) =>
                        handleDurationChange(
                          pump.id,
                          e.target.value
                        )
                      }
                      min={100}
                      max={5000}
                      step={100}
                      disabled={
                        isLocked ||
                        Boolean(activePump)
                      }
                      aria-label={`${pump.name} duration in milliseconds`}
                      style={{
                        width: '68px',
                        minWidth: 0,
                        padding: '0.3rem 0.35rem',
                        fontSize: '0.72rem',
                      }}
                    />

                    <span
                      style={{
                        fontSize: '0.65rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      ms
                    </span>

                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() =>
                        handleManualPulse(
                          pump.id,
                          pump.duration
                        )
                      }
                      disabled={
                        isLocked ||
                        Boolean(activePump) ||
                        pump.duration < 100 ||
                        pump.duration > 5000
                      }
                      style={{
                        padding:
                          '0.3rem 0.45rem',
                        fontSize: '0.7rem',
                        marginLeft: 'auto',
                      }}
                    >
                      <Zap size={11} />
                      {isRunning ? '...' : 'Run'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Circulation pump */}
        <div
          style={{
            flex: '1 1 360px',
            minWidth: 0,
            borderLeft:
              '1px solid var(--border-color, #1c2b4a)',
            paddingLeft: '1rem',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              marginBottom: '0.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              <Cog size={15} />
              Circulation
            </div>

            <span
              style={{
                fontSize: '0.62rem',
                color: circLoading
                  ? 'var(--text-muted)'
                  : 'var(--text-secondary)',
              }}
            >
              {circLoading
                ? 'Loading…'
                : circUpdatedAt
                  ? `Updated ${new Date(
                      circUpdatedAt
                    ).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`
                  : 'Current'}
            </span>
          </div>

          {circLoading ? (
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                padding: '0.4rem 0',
              }}
            >
              Loading circulation settings…
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                {/* Mode buttons */}
                <div
                  className="circulation-modes"
                  style={{ margin: 0 }}
                >
                  {[
                    'CONTINUOUS',
                    'INTERVAL',
                    'OFF',
                  ].map((mode) => (
                    <button
                      key={mode}
                      className={`circulation-mode ${
                        circMode === mode
                          ? 'circulation-mode--active'
                          : ''
                      }`}
                      onClick={() =>
                        setCircMode(mode)
                      }
                      disabled={circSaving}
                    >
                      {mode === 'INTERVAL'
                        ? 'Interval'
                        : mode.charAt(0) +
                          mode
                            .slice(1)
                            .toLowerCase()}
                    </button>
                  ))}
                </div>

                {/* Interval settings */}
                {circMode === 'INTERVAL' && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.7rem',
                    }}
                  >
                    <input
                      type="number"
                      value={runMin}
                      onChange={(e) =>
                        setRunMin(
                          Number(e.target.value) || 0
                        )
                      }
                      min={1}
                      max={120}
                      disabled={circSaving}
                      aria-label="Run duration in minutes"
                      style={{
                        width: '52px',
                        padding: '0.3rem',
                      }}
                    />

                    <span>run</span>

                    <span
                      style={{
                        color: 'var(--text-muted)',
                      }}
                    >
                      /
                    </span>

                    <input
                      type="number"
                      value={restMin}
                      onChange={(e) =>
                        setRestMin(
                          Number(e.target.value) || 0
                        )
                      }
                      min={1}
                      max={120}
                      disabled={circSaving}
                      aria-label="Rest duration in minutes"
                      style={{
                        width: '52px',
                        padding: '0.3rem',
                      }}
                    />

                    <span>rest</span>
                  </div>
                )}

                {/* Save */}
                <button
                  className="btn btn--primary btn--sm"
                  onClick={handleSaveCirculation}
                  disabled={
                    circSaving ||
                    (circMode === 'INTERVAL' &&
                      (runMin < 1 ||
                        runMin > 120 ||
                        restMin < 1 ||
                        restMin > 120))
                  }
                  style={{
                    marginLeft: 'auto',
                  }}
                >
                  {circSaving
                    ? 'Saving...'
                    : 'Save'}
                </button>
              </div>

              {/* Current status */}
              <div
                style={{
                  marginTop: '0.45rem',
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)',
                }}
              >
                Current mode:{' '}
                <span
                  style={{
                    color:
                      'var(--text-secondary)',
                    fontWeight: 600,
                  }}
                >
                  {circMode === 'CONTINUOUS'
                    ? 'Continuous'
                    : circMode === 'INTERVAL'
                      ? `${runMin} min run / ${restMin} min rest`
                      : 'Off'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error / lockout message */}
      {(isLocked || error) && (
        <div
          style={{
            marginTop: '0.5rem',
            fontSize: '0.7rem',
            color: error
              ? 'var(--accent-red)'
              : 'var(--text-muted)',
          }}
        >
          {error
            ? `⚠ ${error}`
            : 'Manual dosing disabled during system lockout.'}
        </div>
      )}
    </div>
  );
}