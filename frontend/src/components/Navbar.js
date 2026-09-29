'use client';

import { Menu, Leaf, ChevronDown } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';

export default function Navbar({
  devices = [],
  selectedDevice,
  onDeviceChange,
  isConnected,
  latencyMs,
  lastPing,
  onEmergencyStop,
  onOpenMenu,
  isSimulated,
  onToggleSimulation,
  isEmergencyActive,
}) {
  const pingLabel = lastPing
    ? `Ping: ${formatDistanceToNowStrict(lastPing, { addSuffix: true })}`
    : 'Live';

  return (
    <nav className="navbar" id="navbar">
      {/* Hamburger Navigation Menu Button */}
      <button
        className="btn--ghost"
        id="navbar-menu-btn"
        onClick={onOpenMenu}
        style={{
          padding: '0.45rem',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        title="Open Navigation Menu"
      >
        <Menu size={18} />
      </button>

      <div className="navbar__brand">
        <Leaf size={18} />
        Smart Hydroponics Core
      </div>

      <div className="navbar__device-select">
        <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>Target device</span>
        <select
          id="device-selector"
          value={selectedDevice}
          onChange={(e) => onDeviceChange(e.target.value)}
        >
          {devices.length > 0 ? (
            devices.map((d) => (
              <option key={d.id} value={d.id}>{d.id}</option>
            ))
          ) : (
            <option value="esp32_node_01">esp32_node_01</option>
          )}
        </select>
      </div>

      <div className="navbar__meta">
        {/* Node Online / Simulation Pill (Clickable to toggle mode) */}
        <button
          className={`pill ${isConnected ? 'pill--online' : 'pill--offline'}`}
          onClick={onToggleSimulation}
          title="Click to toggle Live Simulation / Physical Hardware"
          style={{ cursor: 'pointer', border: 'none' }}
          id="status-node-pill"
        >
          {isConnected ? `Node Online (${pingLabel})` : 'Node Offline'}
        </button>

        {/* WebSocket Latency */}
        <span className="pill pill--latency" id="status-latency-pill">
          WebSocket latency{' '}
          <strong style={{ color: 'var(--accent-cyan)', marginLeft: 3 }}>
            {latencyMs != null ? `${latencyMs}ms` : '18ms'}
          </strong>
        </span>

        {/* Emergency Stop Button */}
        <button
          className={`btn-emergency ${isEmergencyActive ? 'btn-emergency--active' : ''}`}
          id="emergency-stop-btn"
          onClick={onEmergencyStop}
          style={{
            background: isEmergencyActive
              ? 'linear-gradient(135deg, #f43f5e 0%, #991b1b 100%)'
              : undefined,
            boxShadow: isEmergencyActive
              ? '0 0 20px rgba(244, 63, 94, 0.8)'
              : undefined,
            animation: isEmergencyActive ? 'pulse-dot 1s infinite' : undefined,
          }}
        >
          {isEmergencyActive ? '⚠️ STOP ENGAGED' : 'Emergency stop'}
        </button>
      </div>
    </nav>
  );
}
