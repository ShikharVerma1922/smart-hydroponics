import express from 'express';
import { prisma } from '../config/prisma.js';

const router = express.Router();

/**
 * GET /api/dosing/logs
 * Query params: ?deviceId=esp32_node_01&source=ML_BIASED&page=1&limit=20
 */
router.get('/logs', async (req, res) => {
  const { deviceId, source, page = 1, limit = 20 } = req.query;

  const take = Math.min(parseInt(limit, 10) || 20, 50);
  const skip = ((parseInt(page, 10) || 1) - 1) * take;

  const where = {
    ...(deviceId && { deviceId }),
    ...(source && { source }),
  };

  try {
    const [total, logs] = await Promise.all([
      prisma.dosingLog.count({ where }),
      prisma.dosingLog.findMany({
        where,
        take,
        skip,
        orderBy: { timestamp: 'desc' },
        include: {
          diagnosticReport: {
            select: {
              primaryLabel: true,
              confidence: true,
              imageUrl: true,
            },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      pagination: {
        total,
        page: parseInt(page, 10) || 1,
        pages: Math.ceil(total / take),
        limit: take,
      },
      data: logs,
    });
  } catch (error) {
    console.error('Error fetching dosing logs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;