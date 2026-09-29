'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function AlertBanners({
  alerts = [],
  lockout = { isActive: false, remainingSeconds: 0 },
  onResolveAlert,
}) {
  const [lockoutRemaining, setLockoutRemaining] = useState(lockout.remainingSeconds);



  useEffect(() => {
    setLockoutRemaining(lockout.remainingSeconds);
  }, [lockout.remainingSeconds]);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}m:${s}s`;
  };

  const lockoutPct = lockout.isActive
    ? ((lockoutRemaining / 600) * 100).toFixed(0)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* Critical Alerts */}
      {alerts.filter((a) => !a.isResolved).map((alert) => (
        <div
          key={alert.id}
          className={`alert-banner ${
            alert.severity === 'CRITICAL' ? 'alert-banner--critical' : 'alert-banner--warning'
          }`}
          id={`alert-${alert.id}`}
        >
          <AlertTriangle size={18} className="alert-banner__icon" />
          <div className="alert-banner__content">
            <strong>{alert.severity}: </strong>
            {alert.message}
          </div>
          <div className="alert-banner__action">
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => onResolveAlert(alert.id)}
            >
              Acknowledge Alert
            </button>
          </div>
        </div>
      ))}

      {/* Equilibrium Lockout Banner */}
      {lockout.isActive && lockoutRemaining > 0 && (
        <div className="alert-banner alert-banner--warning" id="lockout-banner">
          <AlertTriangle size={18} className="alert-banner__icon" />
          <div className="alert-banner__content" style={{ flex: 1 }}>
            <strong>Equilibrium Lockout:</strong> Solution stabilizing after {lockout.lastPump || 'dosing'} injection. Dosing locked for {formatTime(lockoutRemaining)}
            <div className="lockout-bar">
              <div
                className="lockout-bar__fill"
                style={{ width: `${lockoutPct}%` }}
              />
            </div>
          </div>
          <span className="lockout-bar__label">{lockoutPct}%</span>
        </div>
      )}
    </div>
  );
}
