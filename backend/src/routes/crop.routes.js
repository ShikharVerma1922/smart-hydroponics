import express from 'express';
import { prisma } from '../config/prisma.js';

const router = express.Router();

/**
 * GET /api/crop/recipe
 */
router.get('/recipe', async (req, res) => {
  try {
    const recipes = await prisma.cropRecipe.findMany({
      orderBy: {
        cropName: 'asc',
      },
    });

    return res.json({
      success: true,
      recipes,
    });
  } catch (error) {
    console.error('[Crop Recipe] GET error:', error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/crop/recipe
 *
 * Body:
 * {
 *   "deviceId": "esp32_node_01",
 *   "cropName": "Lettuce",
 *   "targetPhMin": 5.8,
 *   "targetPhMax": 6.5,
 *   "targetEcMin": 1.2,
 *   "targetEcMax": 1.8,
 *   "ecCeiling": 2.4,
 *   "minWaterLevel": 15
 * }
 */
router.post('/recipe', async (req, res) => {
  const {
    deviceId = 'esp32_node_01',
    cropName,
    targetPhMin,
    targetPhMax,
    targetEcMin,
    targetEcMax,
    ecCeiling,
    minWaterLevel,
  } = req.body;

  if (!cropName) {
    return res.status(400).json({
      success: false,
      message: 'cropName is required',
    });
  }

  try {
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: `Device ${deviceId} not found`,
      });
    }

    const recipe = await prisma.cropRecipe.create({
      data: {
        cropName,
        ...(targetPhMin !== undefined && {
          targetPhMin: Number(targetPhMin),
        }),
        ...(targetPhMax !== undefined && {
          targetPhMax: Number(targetPhMax),
        }),
        ...(targetEcMin !== undefined && {
          targetEcMin: Number(targetEcMin),
        }),
        ...(targetEcMax !== undefined && {
          targetEcMax: Number(targetEcMax),
        }),
        ...(ecCeiling !== undefined && {
          ecCeiling: Number(ecCeiling),
        }),
        ...(minWaterLevel !== undefined && {
          minWaterLevel: Number(minWaterLevel),
        }),
      },
    });

    const updatedDevice = await prisma.device.update({
      where: { id: deviceId },
      data: {
        activeRecipeId: recipe.id,
      },
      include: {
        activeRecipe: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: `Crop recipe created and assigned to ${deviceId}`,
      deviceId: updatedDevice.id,
      deviceName: updatedDevice.name,
      recipe: updatedDevice.activeRecipe,
    });
  } catch (error) {
    console.error('[Crop Recipe] POST error:', error);

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: `A crop recipe named "${cropName}" already exists`,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;