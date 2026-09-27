import express from 'express';
import { prisma } from '../config/prisma.js';
import { getDeviceLockout } from '../services/dosing.service.js';

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
  const nowMs = now.getTime();

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

    // 1. Calculate remaining mixing lockout (Memory timer + DB fallback)
    const memLockoutTill = getDeviceLockout(deviceId) || 0;
    
    // Only calculate remaining if memLockoutTill is actually set and in the future
    let remainingMs = memLockoutTill > nowMs ? (memLockoutTill - nowMs) : 0;

    // Fall back to database log ONLY for this specific device if memory state was reset
    if (remainingMs <= 0 && lastDosingLog && lastDosingLog.timestamp) {
      const logTime = new Date(lastDosingLog.timestamp).getTime();
      const elapsedMs = nowMs - logTime;
      
      if (elapsedMs >= 0 && elapsedMs < POST_DOSING_LOCKOUT_MS) {
        remainingMs = POST_DOSING_LOCKOUT_MS - elapsedMs;
      }
    }

    const mixingLockout = {
      isActive: remainingMs > 0,
      remainingSeconds: remainingMs > 0 ? Math.round(remainingMs / 1000) : 0,
      lastPump: remainingMs > 0 ? (lastDosingLog?.pumpType || null) : null,
    };

    // 2. Calculate remaining visual deficiency recovery lockout
    let visualCooldown = {
      isActive: false,
      remainingHours: 0,
      activeTill: null,
      primaryLabel: null,
    };

    if (activeVisualReport?.cooldownActiveTill) {
      const remainingVisualMs = new Date(activeVisualReport.cooldownActiveTill).getTime() - nowMs;
      if (remainingVisualMs > 0) {
        visualCooldown = {
          isActive: true,
          remainingHours: parseFloat((remainingVisualMs / (1000 * 60 * 60)).toFixed(1)),
          activeTill: activeVisualReport.cooldownActiveTill,
          primaryLabel: activeVisualReport.primaryLabel,
        };
      }
    }

    res.json({
      success: true,
      deviceId,
      deviceStatus: {
        isOnline: device ? device.isOnline : false, 
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

/**
 * GET /api/system/devices
 * Retrieves all registered nodes, their active crop recipes, and live online/offline state.
 */
router.get('/devices', async (req, res) => {
  try {
    const devices = await prisma.device.findMany({
      include: {
        activeRecipe: {
          select: {
            id: true,
            cropName: true,
            targetPhMin: true,
            targetPhMax: true,
            targetEcMin: true,
            targetEcMax: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      success: true,
      count: devices.length,
      data: devices.map((d) => ({
        id: d.id,
        name: d.name,
        location: d.location,
        isOnline: d.isOnline,
        activeRecipe: d.activeRecipe,
        updatedAt: d.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/system/devices
 * Registers a new hardware node (bench, tower, or reservoir) and optionally binds an active recipe.
 * Payload: { id: "esp32_node_02", name: "Tower B - Nursery", location: "Main Bay", recipeId: "optional-uuid" }
 */
router.post('/devices', async (req, res) => {
  const { id, name, location, recipeId } = req.body;

  if (!id || typeof id !== 'string' || !id.trim()) {
    return res.status(400).json({
      success: false,
      error: 'A unique device identifier (id) is required (e.g., "esp32_node_02").',
    });
  }

  const deviceId = id.trim();

  try {
    // 1. Verify device ID uniqueness
    const existing = await prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: `Device with ID '${deviceId}' already exists.`,
      });
    }

    // 2. Validate recipeId if provided
    if (recipeId) {
      const recipe = await prisma.cropRecipe.findUnique({
        where: { id: recipeId },
      });
      if (!recipe) {
        return res.status(404).json({
          success: false,
          error: `CropRecipe with ID '${recipeId}' does not exist.`,
        });
      }
    }

    // 3. Create the node record
    const newDevice = await prisma.device.create({
      data: {
        id: deviceId,
        name: name?.trim() || `Node ${deviceId}`,
        location: location?.trim() || 'Unassigned Location',
        isOnline: false, // Default to offline until first MQTT heartbeat
        activeRecipeId: recipeId || null,
      },
      include: {
        activeRecipe: true,
      },
    });

    res.status(201).json({
      success: true,
      message: `Device '${newDevice.id}' registered successfully.`,
      data: newDevice,
    });
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/system/devices/:id/recipe
 * Assigns or swaps the active CropRecipe for an existing node.
 * Payload: { recipeId: "uuid-of-recipe" } or { recipeId: null } to unassign
 */
router.put('/devices/:id/recipe', async (req, res) => {
  const { id } = req.params;
  const { recipeId } = req.body;

  try {
    // 1. Verify device exists
    const device = await prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        error: `Device with ID '${id}' was not found.`,
      });
    }

    // 2. Validate target recipe if assigning
    if (recipeId) {
      const recipe = await prisma.cropRecipe.findUnique({
        where: { id: recipeId },
      });
      if (!recipe) {
        return res.status(404).json({
          success: false,
          error: `CropRecipe with ID '${recipeId}' does not exist.`,
        });
      }
    }

    // 3. Update device association
    const updatedDevice = await prisma.device.update({
      where: { id },
      data: {
        activeRecipeId: recipeId || null,
      },
      include: {
        activeRecipe: true,
      },
    });

    res.json({
      success: true,
      message: recipeId
        ? `Device '${id}' assigned to '${updatedDevice.activeRecipe.cropName}'.`
        : `Device '${id}' recipe unassigned.`,
      data: updatedDevice,
    });
  } catch (error) {
    console.error('Error updating device recipe:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;