'use client';

import {
  X,
  Activity,
  Droplets,
  Eye,
  Sliders,
  FileText,
  Radio,
  Cpu,
  ShieldAlert,
  Archive,
  RefreshCw,
  Layers,
  Leaf,
} from 'lucide-react';

export default function NavigationMenu({
  isOpen,
  onClose,
  onOpenTelemetryDrawer,
  onOpenArchive,
  onEmergencyStop,
  isSimulated,
  onToggleSimulation,
  isEmergencyActive,
}) {
  if (!isOpen) return null;

  const scrollToSection = (id) => {
    onClose();
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop"
        style={{ zIndex: 1100, animation: 'fade-in 0.25s ease-out' }}
        onClick={onClose}
      />

      {/* Slide-out Sidebar Drawer */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '320px',
          maxWidth: '85vw',
          background: 'linear-gradient(180deg, #0b1326 0%, #070c18 100%)',
          borderRight: '1px solid var(--border-default)',
          boxShadow: '10px 0 40px rgba(0,0,0,0.8)',
          zIndex: 1101,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slide-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-default)',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #00f59b 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#050a14',
              }}
            >
              <Leaf size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Smart Hydroponics System
              </div>
              {/* <div style={{ fontSize: '0.6875rem', color: 'var(--accent-green)', fontWeight: 600 }}>
                {isSimulated ? '● Simulation Active' : '● Hardware Live'}
              </div> */}
            </div>
          </div>
          <button
            className="btn--ghost"
            onClick={onClose}
            style={{ padding: '0.4rem', borderRadius: '6px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1rem' }}>
          {/* Section: Jump Navigation */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                fontSize: '0.6875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                fontWeight: 700,
                padding: '0 0.5rem',
                marginBottom: '0.5rem',
              }}
            >
              Dashboard Modules
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {[
                { label: 'Real-Time Sensor Gauges', icon: Activity, id: 'gauge-ph', color: '#00f59b' },
                { label: 'Telemetry Trends & Analytics', icon: Radio, id: 'telemetry-chart', color: '#00f0ff' },
                { label: 'Canopy Vision & ML Inference', icon: Eye, id: 'vision-panel', color: '#c084fc' },
                { label: 'Dosing Decision Matrix', icon: Layers, id: 'dosing-matrix', color: '#fbbf24' },
                { label: 'Peristaltic Pumps & Circulation', icon: Droplets, id: 'pump-controls', color: '#38bdf8' },
                { label: 'Dosing Audit Log', icon: FileText, id: 'dosing-log', color: '#94a3b8' },
              ].map(({ label, icon: Icon, id, color }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.15s ease',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                >
                  <Icon size={16} style={{ color }} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Section: Diagnostics & Modals */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                fontSize: '0.6875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                fontWeight: 700,
                padding: '0 0.5rem',
                marginBottom: '0.5rem',
              }}
            >
              Diagnostic Tools
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <button
                onClick={() => {
                  onClose();
                  onOpenTelemetryDrawer();
                }}
                className="btn btn--ghost"
                style={{
                  justifyContent: 'flex-start',
                  padding: '0.65rem 0.75rem',
                  fontSize: '0.8125rem',
                  width: '100%',
                }}
              >
                <Cpu size={16} style={{ color: 'var(--accent-cyan)' }} />
                Raw ADC Telemetry Inspector
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenArchive();
                }}
                className="btn btn--ghost"
                style={{
                  justifyContent: 'flex-start',
                  padding: '0.65rem 0.75rem',
                  fontSize: '0.8125rem',
                  width: '100%',
                }}
              >
                <Archive size={16} style={{ color: 'var(--accent-purple)' }} />
                Canopy Scan Archive
              </button>
            </div>
          </div>

          {/* Section: Live Simulation Toggle */}
          {/* <div
            style={{
              padding: '1rem',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-default)',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.4rem',
              }}
            >
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Live Stream Mode
              </span>
              <button
                onClick={onToggleSimulation}
                style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  background: isSimulated ? 'var(--accent-green)' : 'var(--bg-surface)',
                  color: isSimulated ? '#040d1a' : 'var(--text-secondary)',
                  border: '1px solid var(--border-default)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {isSimulated ? 'ACTIVE' : 'OFFLINE'}
              </button>
            </div>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {isSimulated
                ? 'Simulating live ESP32 telemetry updates, heartbeat pings & active dosing'
                : 'Listening for real physical WebSocket hardware'}
            </p>
          </div> */}
        </div>

        {/* Drawer Footer: Emergency Stop Action */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--border-default)',
            background: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <button
            onClick={() => {
              onClose();
              onEmergencyStop();
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              background: isEmergencyActive
                ? 'linear-gradient(135deg, #00f59b 0%, #06b6d4 100%)'
                : 'linear-gradient(135deg, #f43f5e 0%, #dc2626 100%)',
              color: isEmergencyActive ? '#050a14' : '#ffffff',
              fontWeight: 800,
              fontSize: '0.8125rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: isEmergencyActive
                ? '0 0 20px rgba(0, 245, 155, 0.4)'
                : '0 0 20px rgba(244, 63, 94, 0.4)',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <ShieldAlert size={18} />
            {isEmergencyActive ? 'Reset Emergency Stop' : 'Emergency Stop'}
          </button>
        </div>
      </aside>
    </>
  );
}
