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

const DEMO_SENSORS = {
  ph: 6.22,
  ec_ms_cm: 1.45,
  water_temp_c: 22.4,
  water_level_pct: 82,
};
const DEMO_CLIMATE = { air_temp_c: 24.8, humidity_pct: 62 };
const DEMO_PH_HISTORY = [6.18, 6.15, 6.20, 6.22, 6.19, 6.24, 6.21, 6.18, 6.22, 6.25, 6.20, 6.22, 6.27, 6.24, 6.22];
const DEMO_EC_HISTORY = [1.42, 1.40, 1.43, 1.45, 1.44, 1.46, 1.45, 1.43, 1.45, 1.44, 1.42, 1.45, 1.47, 1.46, 1.45];

export default function Dashboard() {
  // ── Device selector ──
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('esp32_node_01');

  // ── Telemetry state ──
  const [telemetrySnapshot, setTelemetrySnapshot] = useState({ deviceId: null, sensors: null });
  const [historySnapshot, setHistorySnapshot] = useState({ deviceId: null, ph: [], ec: [], air: [], humidity: [] });

  // ── System state ──
  const [systemStatusSnapshot, setSystemStatusSnapshot] = useState({ deviceId: null, data: null });
  const [latestReportSnapshot, setLatestReportSnapshot] = useState({ deviceId: null, data: null });
  const [recipeSnapshot, setRecipeSnapshot] = useState({ deviceId: null, data: null });

  // ── UI state ──
  const [telemetryDrawerOpen, setTelemetryDrawerOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  // ── Socket.io & Simulation ──
  const { socket, latencyMs, lastPing, isSimulated, toggleSimulation } = useSocket();
  const { latest: liveTelemetry, buffer: telemetryBuffer } = useTelemetryStream(socket, 100, selectedDevice);
  const { lastLogged } = useDosingEvents(socket);
  const lockout = useLockoutState(socket);
  const { alerts, setAlerts } = useSystemAlerts(socket);
  const visionCooldown = useVisionCooldown(socket);
  const heartbeat = useDeviceHeartbeat(socket, selectedDevice);
  const hasDeviceSnapshot = telemetrySnapshot.deviceId === selectedDevice;
  const liveSensors = liveTelemetry?.deviceId === selectedDevice ? liveTelemetry.sensors : null;
  const sensors = liveSensors || (hasDeviceSnapshot ? telemetrySnapshot.sensors : DEMO_SENSORS);
  const climateSensors = liveSensors || (hasDeviceSnapshot ? telemetrySnapshot.sensors : null);
  const climate = climateSensors
    ? { air_temp_c: climateSensors.air_temp_c, humidity_pct: climateSensors.humidity_pct }
    : DEMO_CLIMATE;
  const deviceHistory = historySnapshot.deviceId === selectedDevice ? historySnapshot : null;
  const livePoints = telemetryBuffer.filter((point) => point.deviceId === selectedDevice);
  const phHistory = [
    ...(deviceHistory?.ph.length ? deviceHistory.ph : DEMO_PH_HISTORY),
    ...livePoints.map((point) => point.ph).filter(Number.isFinite),
  ].slice(-20);
  const ecHistory = [
    ...(deviceHistory?.ec.length ? deviceHistory.ec : DEMO_EC_HISTORY),
    ...livePoints.map((point) => point.ec_ms_cm).filter(Number.isFinite),
  ].slice(-20);
  const airHistory = [
    ...(deviceHistory?.air || []),
    ...livePoints.map((point) => point.air_temp_c).filter(Number.isFinite),
  ].slice(-20);
  const humidityHistory = [
    ...(deviceHistory?.humidity || []),
    ...livePoints.map((point) => point.humidity_pct).filter(Number.isFinite),
  ].slice(-20);
  const systemStatus = systemStatusSnapshot.deviceId === selectedDevice ? systemStatusSnapshot.data : null;
  const deviceIsOnline = heartbeat?.deviceId === selectedDevice
    ? heartbeat.isOnline
    : systemStatus?.deviceStatus?.isOnline ?? false;
  const latestReport = latestReportSnapshot.deviceId === selectedDevice ? latestReportSnapshot.data : null;
  const recipe = recipeSnapshot.deviceId === selectedDevice ? recipeSnapshot.data : null;

  // ── Initial data fetch ──
  useEffect(() => {
    // Fetch devices list
    systemAPI.getDevices()
      .then((res) => setDevices(res.data || []))
      .catch(() => setDevices([{ id: 'esp32_node_01', name: 'Default Node' }]));
  }, []);

  useEffect(() => {
    let isCurrent = true;

    // Fetch telemetry snapshot
    telemetryAPI.getLatest(selectedDevice)
      .then((res) => {
        if (isCurrent && res.data?.sensors) {
          setTelemetrySnapshot({ deviceId: selectedDevice, sensors: res.data.sensors });
        }
      })
      .catch(() => {});

    telemetryAPI.getHistory(selectedDevice)
      .then((res) => {
        if (!isCurrent || !Array.isArray(res.data)) return;
        setHistorySnapshot({
          deviceId: selectedDevice,
          ph: res.data.map((point) => point.ph).filter(Number.isFinite).slice(-20),
          ec: res.data.map((point) => point.ec_ms_cm).filter(Number.isFinite).slice(-20),
          air: res.data.map((point) => point.air_temp_c).filter(Number.isFinite).slice(-20),
          humidity: res.data.map((point) => point.humidity_pct).filter(Number.isFinite).slice(-20),
        });
      })
      .catch(() => {});

    // Fetch system status (alerts, lockouts)
    systemAPI.getStatus(selectedDevice)
      .then((res) => {
        if (!isCurrent) return;
        setSystemStatusSnapshot({ deviceId: selectedDevice, data: res });
        if (res.activeAlerts) setAlerts(res.activeAlerts);
      })
      .catch(() => {});

    // Fetch latest vision report
    visionAPI.getLatest(selectedDevice)
      .then((res) => {
        if (isCurrent) setLatestReportSnapshot({ deviceId: selectedDevice, data: res.data });
      })
      .catch(() => {});

    // Fetch crop recipe
    cropAPI.getRecipe(selectedDevice)
      .then((res) => {
        if (isCurrent) setRecipeSnapshot({ deviceId: selectedDevice, data: res.recipe });
      })
      .catch(() => {});

    return () => {
      isCurrent = false;
    };
  }, [selectedDevice, setAlerts]);

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
    <div className="dashboard-page">
      <Navbar
        devices={devices}
        selectedDevice={selectedDevice}
        onDeviceChange={setSelectedDevice}
        isConnected={deviceIsOnline}
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
          {/* <div className="card gauge-card climate-card" id="gauge-climate">
            <div className="gauge-card__header">
              <span className="gauge-card__label">Ambient Climate</span>
            </div>
            <div className="climate-card__metrics">
              <div className="climate-card__metric">
                <div className="climate-card__value">
                  {climate.air_temp_c != null ? climate.air_temp_c.toFixed(1) : '—'}
                  <span>°C</span>
                </div>
                <div className="climate-card__label">Air Temp</div>
              </div>
              <div className="climate-card__metric">
                <div className="climate-card__value">
                  {climate.humidity_pct != null ? climate.humidity_pct.toFixed(0) : '—'}
                  <span>%</span>
                </div>
                <div className="climate-card__label">Humidity</div>
              </div>
            </div>
            <div className="climate-card__sparklines">
              <Sparkline data={airHistory} width={60} height={24} color="var(--accent-cyan)" />
              <Sparkline data={humidityHistory} width={60} height={24} color="var(--accent-green)" />
            </div>
            <div className="gauge-card__range">
              <span>2 hr</span>
              <span>2 h</span>
            </div>
          </div> */}
        </div>

        {/* ── Time-Series Chart ── */}
        <TelemetryChart
          deviceId={selectedDevice}
          liveBuffer={telemetryBuffer}
          onOpenTelemetryDrawer={() => setTelemetryDrawerOpen(true)}
        />

        {/* ── Canopy Vision & ML Diagnostics ── */}
        <VisionPanel
          // key={selectedDevice}
          deviceId={selectedDevice}
          latestReport={latestReport}
          cooldown={effectiveCooldown}
          onOpenArchive={() => setArchiveModalOpen(true)}
        />

        {/* ── Dosing Decision Matrix ── */}
        {/* <DosingMatrixPanel
          sensors={sensors}
          targetEc={recipe ? { min: recipe.targetEcMin, max: recipe.targetEcMax } : { min: 1.2, max: 1.8 }}
          mlDiagnosis={latestReport?.primaryLabel}
          waterLevel={sensors?.water_level_pct}
          isMaintenanceMode={systemStatus?.isMaintenanceMode || false}
        /> */}

        {/* ── Pump Controls ── */}
        <PumpControls
          deviceId={selectedDevice}
          lockout={effectiveLockout}
        />

        {/* ── Dosing Audit Log ── */}
        <DosingLog
          key={selectedDevice}
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
    </div>
  );
}
