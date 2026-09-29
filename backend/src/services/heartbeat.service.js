import { prisma } from '../config/prisma.js';
import { emitSystemAlert, emitDeviceHeartbeat } from '../socket.js';

const HEARTBEAT_TIMEOUT_MS = 60 * 1000; // 60 seconds
const MONITOR_INTERVAL_MS = 15 * 1000; // check every 15 seconds

const lastSeenMap = new Map();
let monitorIntervalId = null;

/**
 * Called by the MQTT message handler whenever telemetry is received.
 */
export async function recordHeartbeat(deviceId) {
  if (!deviceId) {
    console.warn('[Heartbeat] Missing deviceId');
    return;
  }

  const now = Date.now();
  const previousSeen = lastSeenMap.get(deviceId);

  // Always update last-seen time.
  lastSeenMap.set(deviceId, now);

  // Only emit when the device transitions from offline/unknown -> online.
  if (!previousSeen) {
    try {
      await prisma.device.upsert({
        where: { id: deviceId },
        update: {
          isOnline: true,
        },
        create: {
          id: deviceId,
          name: `Node ${deviceId}`,
          isOnline: true,
        },
      });

      console.log(
        `[Heartbeat Watchdog] Device ${deviceId} connected. Marking online.`
      );

      emitDeviceHeartbeat({
        deviceId,
        isOnline: true,
        lastSeen: new Date(now).toISOString(),
        timestamp: now,
      });

      console.log(
        `[Heartbeat Watchdog] Emitted device:heartbeat ONLINE for ${deviceId}`
      );
    } catch (err) {
      console.error(
        `[Heartbeat] Failed to mark ${deviceId} online:`,
        err.message
      );
    }
  }
}

/**
 * Background watchdog.
 *
 * Checks every 15 seconds whether an online device has stopped
 * sending telemetry for more than 60 seconds.
 */
export function startHeartbeatMonitor() {
  if (monitorIntervalId) {
    console.log('[Heartbeat Watchdog] Monitor already running.');
    return;
  }

  console.log('[Heartbeat Watchdog] Starting monitor...');

  monitorIntervalId = setInterval(async () => {
    const now = Date.now();

    try {
      const devices = await prisma.device.findMany({
        where: {
          isOnline: true,
        },
      });

      for (const device of devices) {
        const lastSeen = lastSeenMap.get(device.id);

        // If the backend restarted and has never seen telemetry
        // from this device during this process lifetime, don't
        // immediately mark it offline.
        if (!lastSeen) {
          continue;
        }

        const elapsed = now - lastSeen;

        if (elapsed > HEARTBEAT_TIMEOUT_MS) {
          console.warn(
            `[Heartbeat Watchdog] Device ${device.id} timed out after ${Math.round(
              elapsed / 1000
            )}s.`
          );

          lastSeenMap.delete(device.id);

          await prisma.device.update({
            where: {
              id: device.id,
            },
            data: {
              isOnline: false,
            },
          });

          emitDeviceHeartbeat({
            deviceId: device.id,
            isOnline: false,
            lastSeen: new Date(lastSeen).toISOString(),
            timestamp: now,
          });

          console.log(
            `[Heartbeat Watchdog] Emitted device:heartbeat OFFLINE for ${device.id}`
          );

          emitSystemAlert({
            deviceId: device.id,
            alertType: 'DESYNC_WARNING',
            severity: 'HIGH',
            message: `Device ${device.id} missed heartbeat (>60s). Telemetry stream offline.`,
            timestamp: now,
          });
        }
      }
    } catch (err) {
      console.error('[Heartbeat Error]:', err);
    }
  }, MONITOR_INTERVAL_MS);
}

export function stopHeartbeatMonitor() {
  if (!monitorIntervalId) {
    return;
  }

  clearInterval(monitorIntervalId);
  monitorIntervalId = null;

  console.log('[Heartbeat Watchdog] Monitor stopped.');
}

/*
 * Start the watchdog automatically when this service is imported.
 */
startHeartbeatMonitor();