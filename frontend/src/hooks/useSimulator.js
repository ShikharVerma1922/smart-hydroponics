'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { describeError, playgroundApi } from '@/lib/playground/api';
import { DEFAULT_ENGINE_CONFIG, evaluate } from '@/lib/playground/decisionEngine';

const TICK_MS = 250;
const EVAL_INTERVAL_MS = 1000;
/** How often the browser re-checks whether the rig is online (matches the rig's 10 s heartbeat). */
const STATUS_POLL_MS = 10_000;
const MAX_EVENTS = 60;
/** Production uses 24 h; the playground keeps the same value so the cooldown is visible but not editable. */
const REPORT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_SENSORS = {
  ph: 6.0,
  ecMsCm: 1.6,
  waterLevelPct: 80,
  waterTempC: 21,
  airTempC: 23.5,
  humidityPct: 65,
};

const DEFAULT_TARGETS = {
  targetPhMax: DEFAULT_ENGINE_CONFIG.targetPhMax,
  targetEcMin: DEFAULT_ENGINE_CONFIG.targetEcMin,
};

const IDLE = { on: false, remainingMs: 0 };
const INITIAL_ACTUATORS = {
  CIRCULATION_PUMP: { on: true, remainingMs: 0 },
  PH_DOWN: IDLE,
  NUTRIENT_A: IDLE,
  NUTRIENT_B: IDLE,
};

/**
 * @typedef {Object} ScheduledPulse
 * @property {PumpType} actuator
 * @property {number} startAt
 * @property {number} endAt
 * @property {boolean} sentToHardware
 */

export function useSimulator() {
  const [sensors, setSensorsState] = useState(DEFAULT_SENSORS);
  const [targets, setTargetsState] = useState(DEFAULT_TARGETS);
  const [report, setReportState] = useState(null);
  const [lockoutSeconds, setLockoutSecondsState] = useState(20);
  const [autoEvaluate, setAutoEvaluate] = useState(false);
  const [hardwareSync, setHardwareSyncState] = useState(false);
  const [circulationOn, setCirculationOnState] = useState(true);
  const [lockoutUntil, setLockoutUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [result, setResult] = useState(null);
  const [actuators, setActuators] = useState(INITIAL_ACTUATORS);
  const [events, setEvents] = useState([]);
  const [bridge, setBridge] = useState(null);

  // Refs are the source of truth for the timers; state mirrors them for rendering.
  const sensorsRef = useRef(sensors);
  const targetsRef = useRef(targets);
  const reportRef = useRef(report);
  const secondsRef = useRef(lockoutSeconds);
  const hardwareRef = useRef(hardwareSync);
  const circulationRef = useRef(circulationOn);
  const lockoutRef = useRef(0);
  const prevRigOnlineRef = useRef(null);
  const lastOfflineWarnRef = useRef(0);
  const pulsesRef = useRef([]);
  const lastSignatureRef = useRef('');
  const eventSeq = useRef(0);

  /* ---------- logging & hardware ---------- */

  const log = useCallback((level, message) => {
    eventSeq.current += 1;
    const id = eventSeq.current;
    setEvents((prev) => [{ id, at: Date.now(), level, message }, ...prev].slice(0, MAX_EVENTS));
  }, []);

  /**
   * Confirms a timed pulse really reached the rig: polls the rig's own status (it reports every actuator
   * change immediately) and logs how long it took, or warns if the rig never reported the actuator ON.
   */
  const confirmPulse = useCallback(
    async (actuator, durationMs, sentAt) => {
      const checks = [250, 600, 1000].filter((ms) => ms < durationMs - 100);
      let waited = 0;
      for (const at of checks) {
        await new Promise((resolve) => setTimeout(resolve, at - waited));
        waited = at;
        try {
          const status = await playgroundApi.status();
          if (status.rig?.actuators?.[actuator] === true) {
            log('info', `Rig confirmed ${actuator} ON (~${Date.now() - sentAt} ms after the command was sent)`);
            return;
          }
        } catch {
          /* an unreachable status endpoint is reported by the poll */
        }
      }
      if (checks.length > 0) {
        log('warn', `Rig did NOT confirm ${actuator} ON within ${waited} ms. Check the rig's Serial Monitor ([CMD] lines) and the Rig LEDs.`);
      }
    },
    [log],
  );

  const syncActuator = useCallback(
    (cmd) => {
      if (!hardwareRef.current) return;
      const sentAt = Date.now();
      playgroundApi
        .sendActuator(cmd)
        .then((receipt) => {
          // "ok" only means the BROKER accepted the command, not that the rig received it.
          if (receipt.rigOnline === false && Date.now() - lastOfflineWarnRef.current > 15_000) {
            lastOfflineWarnRef.current = Date.now();
            log('warn', 'Command published, but the rig is not reporting online. It may not receive it.');
          }
          if (cmd.state === 'ON' && cmd.durationMs) void confirmPulse(cmd.actuator, cmd.durationMs, sentAt);
        })
        .catch((err) => log('error', `Hardware sync failed: ${describeError(err)}`));
    },
    [log, confirmPulse],
  );

  const hardwareStopAll = useCallback(() => {
    if (!hardwareRef.current) return;
    playgroundApi.stopAll().catch((err) => log('error', `Hardware stop failed: ${describeError(err)}`));
  }, [log]);

  /* ---------- setters that keep refs and state aligned ---------- */

  const setSensors = useCallback((patch) => {
    const next = { ...sensorsRef.current, ...patch };
    sensorsRef.current = next;
    setSensorsState(next);
  }, []);

  const setTargets = useCallback((patch) => {
    const next = { ...targetsRef.current, ...patch };
    targetsRef.current = next;
    setTargetsState(next);
  }, []);

  const setLockoutSeconds = useCallback((seconds) => {
    secondsRef.current = seconds;
    setLockoutSecondsState(seconds);
  }, []);

  const setReport = useCallback((spec, source = 'scenario') => {
    const next = spec ? { ...spec, cooldownUntilMs: null, source } : null;
    reportRef.current = next;
    setReportState(next);
  }, []);

  const schedulePulses = useCallback((pulses) => {
    const t = Date.now();
    for (const p of pulses) {
      pulsesRef.current.push({
        actuator: p.pump,
        startAt: t + p.delayMs,
        endAt: t + p.delayMs + p.durationMs,
        sentToHardware: false,
      });
    }
  }, []);

  /* ---------- evaluation ---------- */

  const runEvaluation = useCallback(() => {
    const t = Date.now();
    const res = evaluate(sensorsRef.current, {
      nowMs: t,
      lockoutUntilMs: lockoutRef.current,
      report: reportRef.current,
      config: { ...DEFAULT_ENGINE_CONFIG, ...targetsRef.current },
    });
    setResult(res);

    const signature = `${res.terminal}|${res.status}`;
    const changed = signature !== lastSignatureRef.current;

    if (res.dose) {
      schedulePulses(res.dose.pulses);

      const until = t + secondsRef.current * 1000;
      lockoutRef.current = until;
      setLockoutUntil(until);

      const current = reportRef.current;
      if (res.dose.consumesReport && current) {
        const acted = { ...current, cooldownUntilMs: t + REPORT_COOLDOWN_MS };
        reportRef.current = acted;
        setReportState(acted);
      }

      const plan = res.dose.pulses.map((p) => `${p.pump} ${p.durationMs} ms`).join(' then ');
      log('dose', `${res.dose.source}: ${plan}. ${res.rationale}`);
      lastSignatureRef.current = '';
      return;
    }

    if (!changed) return;
    lastSignatureRef.current = signature;

    const level =
      res.status === 'EMERGENCY' || res.status === 'LOCKOUT' ? 'error' : res.status === 'BALANCED' ? 'info' : 'warn';
    log(level, `${res.status}: ${res.rationale}`);
    for (const alert of res.alerts) log('warn', `Alert raised: ${alert}`);

    if (res.status === 'EMERGENCY') {
      // Dry-run protection: nothing may keep running, including the circulation pump.
      pulsesRef.current = [];
      circulationRef.current = false;
      setCirculationOnState(false);
      hardwareStopAll();
    }
  }, [hardwareStopAll, log, schedulePulses]);

  /* ---------- timers ---------- */

  // Fast tick: derive actuator views from the pulse schedule and dispatch due hardware commands.
  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);

      for (const p of pulsesRef.current) {
        if (!p.sentToHardware && t >= p.startAt) {
          p.sentToHardware = true;
          if (t < p.endAt) syncActuator({ actuator: p.actuator, state: 'ON', durationMs: p.endAt - t });
        }
      }
      pulsesRef.current = pulsesRef.current.filter((p) => t < p.endAt);

      const view = {
        CIRCULATION_PUMP: { on: circulationRef.current, remainingMs: 0 },
        PH_DOWN: IDLE,
        NUTRIENT_A: IDLE,
        NUTRIENT_B: IDLE,
      };
      for (const p of pulsesRef.current) {
        if (t >= p.startAt) view[p.actuator] = { on: true, remainingMs: p.endAt - t };
      }
      setActuators(view);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [syncActuator]);

  // Slow tick: run the decision engine like a telemetry message arriving once a second.
  useEffect(() => {
    if (!autoEvaluate) return;
    runEvaluation();
    const id = setInterval(runEvaluation, EVAL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [autoEvaluate, runEvaluation]);

  // Poll the backend for MQTT / rig status while hardware sync is on.
  useEffect(() => {
    if (!hardwareSync) {
      setBridge(null);
      prevRigOnlineRef.current = null;
      return;
    }
    let cancelled = false;
    const poll = async () => {
      try {
        const status = await playgroundApi.status();
        if (cancelled) return;
        setBridge(status);

        const was = prevRigOnlineRef.current;
        prevRigOnlineRef.current = status.rigOnline;
        if (was === true && !status.rigOnline) {
          log('warn', 'Rig went offline');
        } else if (was === false && status.rigOnline) {
          // The rig stops every actuator when it loses MQTT (failsafe), so re-send the pump state it missed.
          log('info', 'Rig back online: re-sending the circulation pump state');
          syncActuator({ actuator: 'CIRCULATION_PUMP', state: circulationRef.current ? 'ON' : 'OFF' });
        }
      } catch {
        if (!cancelled) setBridge(null);
      }
    };
    void poll();
    const id = setInterval(() => void poll(), STATUS_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [hardwareSync, log, syncActuator]);

  /* ---------- user actions ---------- */

  const setHardwareSync = useCallback(
    (enabled) => {
      if (!enabled && hardwareRef.current) {
        // Leave the rig in a safe state when sync is switched off.
        playgroundApi.stopAll().catch(() => undefined);
      }
      hardwareRef.current = enabled;
      setHardwareSyncState(enabled);
      log('info', enabled ? 'Hardware sync enabled' : 'Hardware sync disabled (rig stopped)');
      if (enabled) {
        syncActuator({ actuator: 'CIRCULATION_PUMP', state: circulationRef.current ? 'ON' : 'OFF' });
      }
    },
    [log, syncActuator],
  );

  const setCirculationOn = useCallback(
    (on) => {
      circulationRef.current = on;
      setCirculationOnState(on);
      syncActuator({ actuator: 'CIRCULATION_PUMP', state: on ? 'ON' : 'OFF' });
      log('info', `Circulation pump ${on ? 'ON' : 'OFF'}`);
    },
    [log, syncActuator],
  );

  const manualPulse = useCallback(
    (pump, durationMs) => {
      schedulePulses([{ pump, durationMs, delayMs: 0 }]);
      log('info', `Manual pulse: ${pump} ${durationMs} ms`);
    },
    [log, schedulePulses],
  );

  const stopAllActuators = useCallback(() => {
    pulsesRef.current = [];
    circulationRef.current = false;
    setCirculationOnState(false);
    hardwareStopAll();
    log('warn', 'All actuators stopped');
  }, [hardwareStopAll, log]);

  const applyScenario = useCallback(
    (scenario) => {
      setSensors(scenario.sensors);
      setReport(scenario.report, 'scenario');
      lockoutRef.current = 0;
      setLockoutUntil(0);
      lastSignatureRef.current = '';
      log('info', `Scenario applied: ${scenario.title}`);
    },
    [log, setReport, setSensors],
  );

  const injectReport = useCallback(
    (spec) => {
      setReport(spec, 'inference');
      lastSignatureRef.current = '';
      log('info', `ML report injected: ${spec.label} (${spec.severity}, ${(spec.confidence * 100).toFixed(0)}%)`);
    },
    [log, setReport],
  );

  const clearLockout = useCallback(() => {
    lockoutRef.current = 0;
    setLockoutUntil(0);
    log('info', 'Mixing lockout cleared');
  }, [log]);

  const resetAll = useCallback(() => {
    sensorsRef.current = DEFAULT_SENSORS;
    setSensorsState(DEFAULT_SENSORS);
    targetsRef.current = DEFAULT_TARGETS;
    setTargetsState(DEFAULT_TARGETS);
    setReport(null);
    lockoutRef.current = 0;
    setLockoutUntil(0);
    pulsesRef.current = [];
    circulationRef.current = true;
    setCirculationOnState(true);
    lastSignatureRef.current = '';
    setResult(null);
    log('info', 'Simulator reset');
  }, [log, setReport]);

  return {
    sensors,
    targets,
    report,
    result,
    actuators,
    events,
    bridge,
    lockoutSeconds,
    autoEvaluate,
    hardwareSync,
    circulationOn,
    lockoutRemainingMs: Math.max(0, lockoutUntil - now),
    reportCooldownRemainingMs:
      report !== null && report.cooldownUntilMs !== null ? Math.max(0, report.cooldownUntilMs - now) : 0,
    setSensors,
    setTargets,
    setLockoutSeconds,
    setAutoEvaluate,
    setHardwareSync,
    setCirculationOn,
    manualPulse,
    stopAllActuators,
    applyScenario,
    injectReport,
    clearLockout,
    resetAll,
    evaluateNow: runEvaluation,
  };
}

/**
 * @typedef {ReturnType<typeof useSimulator>} SimulatorApi
 */
