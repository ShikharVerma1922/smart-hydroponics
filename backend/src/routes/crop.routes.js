import express from 'express';
import { prisma } from '../config/prisma.js';

const router = express.Router();

/**
 * GET /api/crop/recipe
 * Query: ?deviceId=esp32_node_01
 * Returns current target thresholds for the device's active crop
 */
router.get('/recipe', async (req, res) => {
  const { deviceId = 'esp32_node_01' } = req.query;

  try {
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      include: { activeRecipe: true },
    });

    if (!device) {
      return res.status(404).json({ success: false, message: `Device ${deviceId} not found` });
    }

    res.json({
      success: true,
      deviceId: device.id,
      deviceName: device.name,
      recipe: device.activeRecipe || {
        cropName: 'Default Baseline',
        targetPhMin: 5.8,
        targetPhMax: 6.5,
        targetEcMin: 1.2,
        targetEcMax: 1.8,
        ecCeiling: 2.4,
        minWaterLevel: 15.0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/crop/recipe
 * Updates threshold values or reassigns active recipe to a device
 */
router.put('/recipe', async (req, res) => {
  const { deviceId = 'esp32_node_01', recipeId, targetPhMin, targetPhMax, targetEcMin, targetEcMax } = req.body;

  try {
    // If switching to an existing preset recipe ID
    if (recipeId) {
      await prisma.device.update({
        where: { id: deviceId },
        data: { activeRecipeId: recipeId },
      });
      return res.json({ success: true, message: `Active recipe updated for ${deviceId}` });
    }

    // Updating specific recipe numbers
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      select: { activeRecipeId: true },
    });

    if (device?.activeRecipeId) {
      const updated = await prisma.cropRecipe.update({
        where: { id: device.activeRecipeId },
        data: {
          ...(targetPhMin && { targetPhMin: parseFloat(targetPhMin) }),
          ...(targetPhMax && { targetPhMax: parseFloat(targetPhMax) }),
          ...(targetEcMin && { targetEcMin: parseFloat(targetEcMin) }),
          ...(targetEcMax && { targetEcMax: parseFloat(targetEcMax) }),
        },
      });
      return res.json({ success: true, data: updated });
    }

    res.status(400).json({ success: false, error: 'No recipe found to update for this device.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;