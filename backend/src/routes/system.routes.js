// backend/src/routes/system.routes.js
import express from 'express';
import { prisma } from '../config/prisma.js';

const router = express.Router();
const POST_DOSING_LOCKOUT_MS = 10 * 60 * 1000; // 10 minutes quiet period

/**
 * GET /api/system/status
 * Query: ?deviceId=esp32_node_01
 * Returns real-time lockouts, cooldown timers, and active alerts
 */
router.get('/status', async (req, res) => {
  const { deviceId = 'esp32_node_01' } = req.query;
  const now = new Date();

  try {
    const [device, activeAlerts, lastDosingLog, activeVisualReport] = await Promise.all([
      prisma.device.findUnique({
        where: { id: deviceId },
        include: { activeRecipe: true },
      }),
      prisma.systemAlert.findMany({
        where: { deviceId, isResolved: false },
        orderBy: { timestamp: 'desc' },
      }),
      prisma.dosingLog.findFirst({
        where: { deviceId },
        orderBy: { timestamp: 'desc' },
      }),
      prisma.diagnosticReport.findFirst({
        where: {
          deviceId,
          cooldownActiveTill: { gt: now },
        },
        orderBy: { cooldownActiveTill: 'desc' },
      }),
    ]);

    // 1. Calculate remaining mixing lockout
    let mixingLockout = {
      isActive: false,
      remainingSeconds: 0,
    };

    if (lastDosingLog) {
      const elapsedMs = now.getTime() - new Date(lastDosingLog.timestamp).getTime();
      if (elapsedMs < POST_DOSING_LOCKOUT_MS) {
        mixingLockout = {
          isActive: true,
          remainingSeconds: Math.round((POST_DOSING_LOCKOUT_MS - elapsedMs) / 1000),
          lastPump: lastDosingLog.pumpType,
        };
      }
    }

    // 2. Calculate remaining 48h visual deficiency recovery lockout
    let visualCooldown = {
      isActive: false,
      remainingHours: 0,
      activeTill: null,
      primaryLabel: null,
    };

    if (activeVisualReport?.cooldownActiveTill) {
      const remainingMs = new Date(activeVisualReport.cooldownActiveTill).getTime() - now.getTime();
      if (remainingMs > 0) {
        visualCooldown = {
          isActive: true,
          remainingHours: parseFloat((remainingMs / (1000 * 60 * 60)).toFixed(1)),
          activeTill: activeVisualReport.cooldownActiveTill,
          primaryLabel: activeVisualReport.primaryLabel,
        };
      }
    }

    res.json({
      success: true,
      deviceId,
      deviceStatus: {
        isOnline: device ? device.isOnline : true,
        activeRecipe: device?.activeRecipe?.cropName || 'Default Baseline',
      },
      mixingLockout,
      visualCooldown,
      activeAlerts,
    });
  } catch (error) {
    console.error('Error fetching system status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/system/alerts/:id/resolve
 * Allows the operator to acknowledge/clear an alert from the dashboard
 */
router.put('/alerts/:id/resolve', async (req, res) => {
  const { id } = req.params;
  const { resolvedBy = 'USER' } = req.body;

  try {
    const alert = await prisma.systemAlert.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy,
      },
    });

    res.json({ success: true, message: 'Alert resolved successfully', data: alert });
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;