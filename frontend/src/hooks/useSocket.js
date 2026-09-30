'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

// Global simulation event bus
// const globalSimBus = {
//   listeners: new Map(),
//   on(event, callback) {
//     if (!this.listeners.has(event)) this.listeners.set(event, new Set());
//     this.listeners.get(event).add(callback);
//     return () => this.listeners.get(event)?.delete(callback);
//   },
//   emit(event, data) {
//     this.listeners.get(event)?.forEach((fn) => fn(data));
//   },
// };

/**
 * Core socket hook — manages a single shared connection.
 * Returns the socket instance and connection metadata.
 */
export function useSocket() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latencyMs, setLatencyMs] = useState(18);
  const [lastPing, setLastPing] = useState(new Date());
  const [isSimulated, setIsSimulated] = useState(true);

  useEffect(() => {
    let socket = null;
    try {
      socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        timeout: 3000,
      });

      socket.on('connect', () => {
        setSocket(socket);
        setIsConnected(true);
        setIsSimulated(false);
        setLastPing(new Date());
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        setIsSimulated(true);
      });
    } catch (error) {
      console.error('Unable to initialize Socket.IO connection:', error);
    }

    // Live Simulated Heartbeat & Telemetry Generation
    // const interval = setInterval(() => {
    //   const randomLatency = Math.floor(14 + Math.random() * 14);
    //   setLatencyMs(randomLatency);
    //   setLastPing(new Date());

    //   const time = Date.now();
    //   const phDrift = 6.22 + (Math.sin(time / 15000) * 0.08) + (Math.random() * 0.02 - 0.01);
    //   const ecDrift = 1.45 + (Math.cos(time / 18000) * 0.05) + (Math.random() * 0.02 - 0.01);
    //   const waterTempDrift = 22.4 + (Math.sin(time / 30000) * 0.3);
    //   const waterLevel = 82;

    //   globalSimBus.emit('telemetry:update', {
    //     timestamp: new Date().toISOString(),
    //     deviceId: 'esp32_node_01',
    //     sensors: {
    //       ph: +phDrift.toFixed(2),
    //       ec_ms_cm: +ecDrift.toFixed(2),
    //       water_temp_c: +waterTempDrift.toFixed(1),
    //       water_level_pct: waterLevel,
    //       air_temp_c: 24.8,
    //       humidity_pct: 62,
    //     },
    //   });
    // }, 2500);

    return () => {
      // clearInterval(interval);
      if (socket) socket.disconnect();
    };
  }, []);

  const toggleSimulation = () => {
    setIsSimulated((prev) => !prev);
  };

  return {
    socket,
    isConnected,
    latencyMs,
    lastPing,
    isSimulated,
    toggleSimulation,
  };
}

/**
 * Subscribe to a specific socket event. Calls handler on each event.
 */
export function useSocketEvent(socket, eventName, handler) {
  useEffect(() => {
    if (!socket) return;

    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [socket, eventName, handler]);
}

/**
 * Telemetry stream hook — accumulates sensor data points in a ring buffer
 */
export function useTelemetryStream(socket, maxPoints = 100, deviceId = null) {
  const [latest, setLatest] = useState(null);
  const [buffer, setBuffer] = useState([]);

useSocketEvent(socket, 'telemetry:update', useCallback((data) => {
  if (deviceId && data.deviceId !== deviceId) return;

  setLatest(data);

  setBuffer((prev) => {
    const devicePoints = prev.filter(
      (point) => point.deviceId === data.deviceId
    );

    const next = [
      ...devicePoints,
      {
        ...data.sensors,
        deviceId: data.deviceId,
        circulation_pump_state: data.circulation_pump_state,
        timestamp: data.timestamp,
      },
    ];

    return next.length > maxPoints
      ? next.slice(-maxPoints)
      : next;
  });
}, [deviceId, maxPoints]));

  return { latest, buffer };
}

/**
 * Dosing events — fires on pump dispatch and log persistence
 */
export function useDosingEvents(socket) {
  const [lastEvent, setLastEvent] = useState(null);
  const [lastLogged, setLastLogged] = useState(null);

  useSocketEvent(socket, 'dosing:event', useCallback((data) => {
    setLastEvent(data);
  }, []));

  useSocketEvent(socket, 'dosing:logged', useCallback((data) => {
    setLastLogged(data);
  }, []));

  return { lastEvent, lastLogged };
}

/**
 * Circulation pump state
 */
export function useCirculationState(socket) {
  const [state, setState] = useState(null);

  useSocketEvent(socket, 'circulation:update', useCallback((data) => {
    setState(data);
  }, []));

  return state;
}

/**
 * System lockout (10-minute mixing quiet period)
 */
export function useLockoutState(socket) {
  const [lockout, setLockout] = useState({ isActive: false, remainingSeconds: 0 });

  useSocketEvent(socket, 'system:lockout', useCallback((data) => {
    setLockout(data);
  }, []));

  return lockout;
}

/**
 * Vision cooldown (48hr foliar recovery window)
 */
export function useVisionCooldown(socket) {
  const [cooldown, setCooldown] = useState(null);

  useSocketEvent(socket, 'vision:cooldown', useCallback((data) => {
    setCooldown(data);
  }, []));

  return cooldown;
}

/**
 * System alerts (safety gate trips, crashes, etc.)
 */
export function useSystemAlerts(socket) {
  const [alerts, setAlerts] = useState([]);

  useSocketEvent(socket, 'system:alert', useCallback((data) => {
    setAlerts((prev) => [data, ...prev]);
  }, []));

  useSocketEvent(socket, 'alert:resolved', useCallback((data) => {
    setAlerts((prev) => prev.filter((a) => a.alertType !== data.alertType));
  }, []));

  return { alerts, setAlerts };
}

/**
 * Device heartbeat (online/offline transitions)
 */
export function useDeviceHeartbeat(socket, deviceId) {
  const [heartbeat, setHeartbeat] = useState(null);

  useSocketEvent(socket, 'device:heartbeat', useCallback((data) => {
    if (data.deviceId === deviceId) setHeartbeat(data);
  }, [deviceId]));

  return heartbeat;
}
