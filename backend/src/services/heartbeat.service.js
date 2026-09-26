import { prisma } from '../config/prisma.js';
import { emitSystemAlert } from '../socket.js';

const HEARTBEAT_TIMEOUT_MS = 60 * 1000; // 60 seconds threshold
const lastSeenMap = new Map(); // Map
let monitorIntervalId = null;

/**
 * Called by MQTT message handler on every telemetry packet.
 */
export async function recordHeartbeat(deviceId) {
  const previousSeen = lastSeenMap.get(deviceId);
  lastSeenMap.set(deviceId, Date.now());

  // If node was marked offline or first boot, mark it back online
  if (!previousSeen) {
    await prisma.device.upsert({
      where: { id: deviceId },
      update: { isOnline: true },
      create: { id: deviceId, name: `Node ${deviceId}`, isOnline: true },
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

          await prisma.device.update({
            where: { id: device.id },
            data: { isOnline: false },
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