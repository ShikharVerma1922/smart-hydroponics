'use client';

import { ShieldAlert, AlertOctagon, X, ZapOff, CheckCircle2 } from 'lucide-react';

export default function EmergencyModal({
  isOpen,
  onClose,
  isEmergencyActive,
  onConfirmEmergencyStop,
  onResetEmergencyStop,
}) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="modal-backdrop"
        style={{ zIndex: 1200, animation: 'fade-in 0.2s ease-out' }}
        onClick={onClose}
      />
      <div
        className="modal"
        style={{
          zIndex: 1201,
          maxWidth: '480px',
          background: 'linear-gradient(180deg, #180a0f 0%, #0d060a 100%)',
          border: '1px solid rgba(244, 63, 94, 0.4)',
          boxShadow: '0 0 50px rgba(244, 63, 94, 0.35)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            borderBottom: '1px solid rgba(244, 63, 94, 0.2)',
            paddingBottom: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertOctagon size={22} style={{ color: 'var(--accent-red)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Hardware Safety Interlock
            </h3>
          </div>
          <button
            className="btn--ghost"
            onClick={onClose}
            style={{ padding: '0.35rem', borderRadius: 4 }}
          >
            <X size={16} />
          </button>
        </div>

        {!isEmergencyActive ? (
          <div>
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.8125rem',
                color: '#fecdd3',
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: '#ffffff', display: 'block', marginBottom: '0.25rem' }}>
                ⚠️ IMMEDIATE ACTUATOR CUTOFF
              </strong>
              Executing an emergency stop will instantly cut power to:
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                <li>Pump 1: pH Down (Phosphoric Acid)</li>
                <li>Pump 2: Nutrient Stock A (Calcium Nitrate)</li>
                <li>Pump 3: Nutrient Stock B (Magnesium/Phosphorus)</li>
                <li>Submersible Circulation Pump</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn--ghost" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn btn-emergency"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.8125rem' }}
                onClick={() => {
                  onConfirmEmergencyStop();
                  onClose();
                }}
              >
                <ZapOff size={16} />
                CONFIRM EMERGENCY HALT
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div
              style={{
                background: 'rgba(0, 245, 155, 0.1)',
                border: '1px solid rgba(0, 245, 155, 0.3)',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.8125rem',
                color: '#a7f3d0',
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: '#ffffff', display: 'block', marginBottom: '0.25rem' }}>
                🟢 EMERGENCY STOP IS CURRENTLY ACTIVE
              </strong>
              All dosing and circulation actuators are currently frozen. Verify fluid lines and click below to clear the interlock and resume normal closed-loop operation.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn--ghost" onClick={onClose}>
                Keep Locked
              </button>
              <button
                className="btn btn--success"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.8125rem' }}
                onClick={() => {
                  onResetEmergencyStop();
                  onClose();
                }}
              >
                <CheckCircle2 size={16} />
                DISENGAGE & RESET SYSTEM
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
