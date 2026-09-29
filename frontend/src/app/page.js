'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { ArcGauge, WaterGauge, Sparkline } from '@/components/Gauges';
import AlertBanners from '@/components/AlertBanners';
import TelemetryChart from '@/components/TelemetryChart';
import VisionPanel from '@/components/VisionPanel';
import PumpControls from '@/components/PumpControls';
import DosingMatrixPanel from '@/components/DosingMatrixPanel';
import DosingLog from '@/components/DosingLog';
import TelemetryDrawer from '@/components/TelemetryDrawer';
import ArchiveModal from '@/components/ArchiveModal';
import NavigationMenu from '@/components/NavigationMenu';
import EmergencyModal from '@/components/EmergencyModal';

import {
  useSocket,
  useTelemetryStream,
  useDosingEvents,
  useLockoutState,
  useSystemAlerts,
  useVisionCooldown,
  useDeviceHeartbeat,
} from '@/hooks/useSocket';

import { telemetryAPI, systemAPI, visionAPI, cropAPI } from '@/lib/api';

export default function Dashboard() {
  // ── Device selector ──
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('esp32_node_01');

  // ── Demo fallback data (shown when backend is unavailable) ──
  const DEMO_SENSORS = {
    ph: 6.22,
    ec_ms_cm: 1.45,
    water_temp_c: 22.4,
    water_level_pct: 82,
  };
  const DEMO_CLIMATE = { air_temp_c: 24.8, humidity_pct: 62 };
  const DEMO_PH_HISTORY = [6.18, 6.15, 6.20, 6.22, 6.19, 6.24, 6.21, 6.18, 6.22, 6.25, 6.20, 6.22, 6.27, 6.24, 6.22];
  const DEMO_EC_HISTORY = [1.42, 1.40, 1.43, 1.45, 1.44, 1.46, 1.45, 1.43, 1.45, 1.44, 1.42, 1.45, 1.47, 1.46, 1.45];

  // ── Telemetry state ──
  const [sensors, setSensors] = useState(DEMO_SENSORS);
  const [climate, setClimate] = useState(DEMO_CLIMATE);
  const [phHistory, setPhHistory] = useState(DEMO_PH_HISTORY);
  const [ecHistory, setEcHistory] = useState(DEMO_EC_HISTORY);
  const [dataLoaded, setDataLoaded] = useState(false);

  // ── System state ──
  const [systemStatus, setSystemStatus] = useState(null);
  const [latestReport, setLatestReport] = useState(null);
  const [recipe, setRecipe] = useState(null);

  // ── UI state ──
  const [telemetryDrawerOpen, setTelemetryDrawerOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  // ── Socket.io & Simulation ──
  const { socket, isConnected, latencyMs, lastPing, isSimulated, toggleSimulation } = useSocket();
  const { latest: liveTelemetry, buffer: telemetryBuffer } = useTelemetryStream(socket);
  const { lastLogged } = useDosingEvents(socket);
  const lockout = useLockoutState(socket);
  const { alerts, setAlerts } = useSystemAlerts(socket);
  const visionCooldown = useVisionCooldown(socket);
  const heartbeat = useDeviceHeartbeat(socket);

  // ── Initial data fetch ──
  useEffect(() => {
    // Fetch devices list
    systemAPI.getDevices()
      .then((res) => setDevices(res.data || []))
      .catch(() => setDevices([{ id: 'esp32_node_01', name: 'Default Node' }]));
  }, []);

  useEffect(() => {
    // Fetch telemetry snapshot
    telemetryAPI.getLatest(selectedDevice)
      .then((res) => {
        if (res.data?.sensors) {
          setSensors(res.data.sensors);
          setDataLoaded(true);
        }
      })
      .catch(() => {
        // Keep demo data when backend is offline
        if (!dataLoaded) {
          setSensors(DEMO_SENSORS);
          setClimate(DEMO_CLIMATE);
        }
      });

    // Fetch system status (alerts, lockouts)
    systemAPI.getStatus(selectedDevice)
      .then((res) => {
        setSystemStatus(res);
        if (res.activeAlerts) setAlerts(res.activeAlerts);
      })
      .catch(() => {});

    // Fetch latest vision report
    visionAPI.getLatest(selectedDevice)
      .then((res) => setLatestReport(res.data))
      .catch(() => {});

    // Fetch crop recipe
    cropAPI.getRecipe(selectedDevice)
      .then((res) => setRecipe(res.recipe))
      .catch(() => {});
  }, [selectedDevice]);

  // ── Update sensors from live WebSocket stream ──
  useEffect(() => {
    if (liveTelemetry?.sensors) {
      setSensors(liveTelemetry.sensors);
      // Track climate data (air_temp_c, humidity_pct come in telemetry:update)
      if (liveTelemetry.sensors.air_temp_c != null) {
        setClimate({
          air_temp_c: liveTelemetry.sensors.air_temp_c,
          humidity_pct: liveTelemetry.sensors.humidity_pct,
        });
      }
      // Build sparkline history
      setPhHistory((prev) => [...prev, liveTelemetry.sensors.ph].slice(-20));
      setEcHistory((prev) => [...prev, liveTelemetry.sensors.ec_ms_cm].slice(-20));
    }
  }, [liveTelemetry]);

  // ── Emergency Stop Lockout override ──
  const effectiveLockout = isEmergencyActive
    ? { isActive: true, remainingSeconds: 9999, lastPump: 'EMERGENCY_HALT' }
    : lockout.isActive
    ? lockout
    : systemStatus?.mixingLockout || { isActive: false, remainingSeconds: 0 };

  // ── Merge vision cooldown from system status ──
  const effectiveCooldown = visionCooldown || systemStatus?.visualCooldown || null;

  // ── Handlers ──
  const handleResolveAlert = async (alertId) => {
    try {
      await systemAPI.resolveAlert(alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    }
  };

  const handleOpenEmergencyModal = () => {
    setEmergencyModalOpen(true);
  };

  const handleConfirmEmergencyStop = () => {
    setIsEmergencyActive(true);
    setAlerts((prev) => [
      {
        id: 'emergency-stop-active',
        severity: 'CRITICAL',
        message: 'EMERGENCY HARDWARE INTERLOCK ACTIVE: All peristaltic pumps and circulation flow halted by operator command.',
      },
      ...prev.filter((a) => a.id !== 'emergency-stop-active'),
    ]);
  };

  const handleResetEmergencyStop = () => {
    setIsEmergencyActive(false);
    setAlerts((prev) => prev.filter((a) => a.id !== 'emergency-stop-active'));
  };

  // ── Trend calculation ──
  const calcTrend = (history) => {
    if (history.length < 2) return { value: 0, dir: 'stable' };
    const recent = history.slice(-5);
    const older = history.slice(-10, -5);
    if (recent.length === 0 || older.length === 0) return { value: 0, dir: 'stable' };
    const recentAvg = recent.reduce((a, b) => a + (b || 0), 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + (b || 0), 0) / older.length;
    const diff = recentAvg - olderAvg;
    return {
      value: Math.abs(diff).toFixed(2),
      dir: diff > 0.01 ? 'up' : diff < -0.01 ? 'down' : 'stable',
    };
  };

  const phTrend = calcTrend(phHistory);

  return (
    <>
      <Navbar
        devices={devices}
        selectedDevice={selectedDevice}
        onDeviceChange={setSelectedDevice}
        isConnected={isConnected}
        latencyMs={latencyMs}
        lastPing={lastPing}
        onEmergencyStop={handleOpenEmergencyModal}
        onOpenMenu={() => setNavMenuOpen(true)}
        isSimulated={isSimulated}
        onToggleSimulation={toggleSimulation}
        isEmergencyActive={isEmergencyActive}
      />

      <main className="dashboard">
        {/* ── Alert Banners ── */}
        <AlertBanners
          alerts={alerts}
          lockout={effectiveLockout}
          onResolveAlert={handleResolveAlert}
        />

        {/* ── Sensor Gauge Cards ── */}
        <div className="gauge-grid">
          {/* pH Gauge */}
          <div className="card gauge-card" id="gauge-ph">
            <div className="gauge-card__header">
              <span className="gauge-card__label">Solution pH</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`gauge-card__trend gauge-card__trend--${phTrend.dir}`}>
                  {phTrend.dir === 'up' ? '↑' : phTrend.dir === 'down' ? '↓' : '→'} {phTrend.value}/h
                </span>
                <Sparkline data={phHistory} color="var(--accent-cyan)" />
              </div>
            </div>
            <ArcGauge
              value={sensors.ph}
              min={recipe?.targetPhMin || 5.8}
              max={recipe?.targetPhMax || 6.4}
              color="var(--gauge-nominal)"
            />
            <div className="gauge-card__range">
              <span>{recipe?.targetPhMin || 5.8}</span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                ↑ {phTrend.value}/h
              </span>
              <span>{recipe?.targetPhMax || 6.4}</span>
            </div>
          </div>

          {/* EC Gauge */}
          <div className="card gauge-card" id="gauge-ec">
            <div className="gauge-card__header">
              <span className="gauge-card__label">Solution EC</span>
              <Sparkline data={ecHistory} color="var(--text-primary)" />
            </div>
            <ArcGauge
              value={sensors.ec_ms_cm}
              min={recipe?.targetEcMin || 1.2}
              max={recipe?.targetEcMax || 1.8}
              unit="mS/cm"
              color="var(--gauge-nominal)"
            />
            <div className="gauge-card__range">
              <span>{recipe?.targetEcMin || 1.2}</span>
              <span>{recipe?.targetEcMax || 1.8}</span>
            </div>
          </div>

          {/* Water Level Gauge */}
          <div className="card gauge-card" id="gauge-water-level">
            <div className="gauge-card__header">
              <span className="gauge-card__label">Reservoir Water Level</span>
            </div>
            <WaterGauge
              percentage={sensors.water_level_pct}
              waterTemp={sensors.water_temp_c}
            />
          </div>

          {/* Ambient Climate */}
          <div className="card gauge-card climate-card" id="gauge-climate">
            <div className="gauge-card__header">
              <span className="gauge-card__label">Ambient Climate</span>
            </div>
            <div className="climate-card__metrics">
              <div className="climate-card__metric">
                <div className="climate-card__value">
                  {climate.air_temp_c != null ? climate.air_temp_c.toFixed(1) : sensors.water_temp_c != null ? (sensors.water_temp_c + 2.4).toFixed(1) : '—'}
                  <span>°C</span>
                </div>
                <div className="climate-card__label">Air Temp</div>
              </div>
              <div className="climate-card__metric">
                <div className="climate-card__value">
                  {climate.humidity_pct != null ? climate.humidity_pct.toFixed(0) : '62'}
                  <span>%</span>
                </div>
                <div className="climate-card__label">Humidity</div>
              </div>
            </div>
            <div className="climate-card__sparklines">
              <Sparkline data={phHistory.map((_, i) => 24 + Math.sin(i / 3) * 1.5)} width={60} height={24} color="var(--accent-cyan)" />
              <Sparkline data={phHistory.map((_, i) => 62 + Math.cos(i / 4) * 3)} width={60} height={24} color="var(--accent-green)" />
            </div>
            <div className="gauge-card__range">
              <span>2 hr</span>
              <span>2 h</span>
            </div>
          </div>
        </div>

        {/* ── Time-Series Chart ── */}
        <TelemetryChart
          deviceId={selectedDevice}
          onOpenTelemetryDrawer={() => setTelemetryDrawerOpen(true)}
        />

        {/* ── Canopy Vision & ML Diagnostics ── */}
        <VisionPanel
          deviceId={selectedDevice}
          latestReport={latestReport}
          cooldown={effectiveCooldown}
          onOpenArchive={() => setArchiveModalOpen(true)}
        />

        {/* ── Dosing Decision Matrix ── */}
        <DosingMatrixPanel
          sensors={sensors}
          targetEc={recipe ? { min: recipe.targetEcMin, max: recipe.targetEcMax } : { min: 1.2, max: 1.8 }}
          mlDiagnosis={latestReport?.classification?.primary_label}
          waterLevel={sensors?.water_level_pct}
          isMaintenanceMode={systemStatus?.isMaintenanceMode || false}
        />

        {/* ── Pump Controls ── */}
        <PumpControls
          deviceId={selectedDevice}
          lockout={effectiveLockout}
        />

        {/* ── Dosing Audit Log ── */}
        <DosingLog
          deviceId={selectedDevice}
          newLogEntry={lastLogged}
        />
      </main>

      {/* ── Drawers & Modals ── */}
      <NavigationMenu
        isOpen={navMenuOpen}
        onClose={() => setNavMenuOpen(false)}
        onOpenTelemetryDrawer={() => setTelemetryDrawerOpen(true)}
        onOpenArchive={() => setArchiveModalOpen(true)}
        onEmergencyStop={handleOpenEmergencyModal}
        isSimulated={isSimulated}
        onToggleSimulation={toggleSimulation}
        isEmergencyActive={isEmergencyActive}
      />

      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
        isEmergencyActive={isEmergencyActive}
        onConfirmEmergencyStop={handleConfirmEmergencyStop}
        onResetEmergencyStop={handleResetEmergencyStop}
      />

      <TelemetryDrawer
        isOpen={telemetryDrawerOpen}
        onClose={() => setTelemetryDrawerOpen(false)}
        buffer={telemetryBuffer}
      />

      <ArchiveModal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        deviceId={selectedDevice}
      />
    </>
  );
}
