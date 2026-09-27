import { prisma } from '../config/prisma.js';
import { emitSystemAlert, emitDeviceHeartbeat } from '../socket.js';

const HEARTBEAT_TIMEOUT_MS = 60 * 1000; // 60 seconds threshold
const lastSeenMap = new Map(); // Map
let monitorIntervalId = null;

/**
 * Called by MQTT message handler on every telemetry packet.
 */
export async function recordHeartbeat(deviceId) {
  const now = Date.now();
  const previousSeen = lastSeenMap.get(deviceId);
  lastSeenMap.set(deviceId, now);

  // 1. Transition: Offline -> Online (or first boot registration)
  if (!previousSeen) {
    const device = await prisma.device.upsert({
      where: { id: deviceId },
      update: { isOnline: true },
      create: { id: deviceId, name: `Node ${deviceId}`, isOnline: true },
    });

    console.log(`[Heartbeat Watchdog] Device ${deviceId} connected. Marking online.`);

    // Broadcast online status to frontend
    emitDeviceHeartbeat({
      deviceId,
      isOnline: true,
      lastSeen: new Date(now).toISOString(),
      timestamp: now,
    });
  }
}

/**
 * Background loop that checks for stale nodes.
 */
export function startHeartbeatMonitor() {
  if (monitorIntervalId) return;

  monitorIntervalId = setInterval(async () => {
    const now = Date.now();

    try {
      const devices = await prisma.device.findMany({
        where: { isOnline: true },
      });

      for (const device of devices) {
        const lastSeen = lastSeenMap.get(device.id) || 0;

        if (now - lastSeen > HEARTBEAT_TIMEOUT_MS) {
          console.warn(`[Heartbeat Watchdog] Device ${device.id} timed out. Marking offline.`);

          // Clear map entry so the next packet triggers the "re-connected" flow
          lastSeenMap.delete(device.id);

          await prisma.device.update({
            where: { id: device.id },
            data: { isOnline: false },
          });

          // 2. Transition: Online -> Offline
          emitDeviceHeartbeat({
            deviceId: device.id,
            isOnline: false,
            lastSeen: lastSeen ? new Date(lastSeen).toISOString() : null,
            timestamp: now,
          });

          const alertMsg = `Device ${device.id} missed heartbeat (>60s). Telemetry stream offline.`;
          emitSystemAlert({
            deviceId: device.id,
            alertType: 'DESYNC_WARNING',
            severity: 'HIGH',
            message: alertMsg,
            timestamp: now,
          });
        }
      }
    } catch (err) {
      console.error('[Heartbeat Error]:', err.message);
    }
  }, 15000); // Check every 15 seconds
}

export function stopHeartbeatMonitor() {
  if (monitorIntervalId) {
    clearInterval(monitorIntervalId);
    monitorIntervalId = null;
  }
}