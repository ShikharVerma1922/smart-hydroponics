import express from 'express';
import { prisma } from '../config/prisma.js';

const router = express.Router();

/**
 * GET /api/dosing/logs
 *
 * Query params:
 * ?deviceId=esp32_node_01
 * &source=AUTONOMOUS_PH,AUTONOMOUS_EC
 * &range=7d
 * &page=1
 * &limit=20
 */
router.get('/logs', async (req, res) => {
  const {
    deviceId,
    source,
    range = '7d',
    page = 1,
    limit = 20,
  } = req.query;

  const validSources = [
    'ML_BIASED',
    'AUTONOMOUS_PH',
    'AUTONOMOUS_EC',
    'MANUAL_OVERRIDE',
  ];

  const validRanges = ['today','7d', '30d', 'all'];

  // Support multiple sources:
  // ?source=AUTONOMOUS_PH,AUTONOMOUS_EC
  const sources = source
    ? source.split(',').filter(Boolean)
    : [];

  // Validate date range
  if (!validRanges.includes(range)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid date range. Must be one of: today, 7d, 30d, all',
    });
  }

  // Validate all requested sources
  if (
    sources.length &&
    !sources.every((s) => validSources.includes(s))
  ) {
    return res.status(400).json({
      success: false,
      error: `Invalid dosing source. Must be one of: ${validSources.join(', ')}`,
    });
  }

  // Calculate date boundary
  const dateFrom = new Date();

  if(range === 'today'){
   dateFrom.setHours(0, 0, 0, 0);
  } else if (range === '7d') {
    dateFrom.setDate(dateFrom.getDate() - 7);
  } else if (range === '30d') {
    dateFrom.setDate(dateFrom.getDate() - 30);
  }

  const take = Math.min(
    parseInt(limit, 10) || 20,
    50
  );

  const currentPage = parseInt(page, 10) || 1;

  const skip = (currentPage - 1) * take;

  const where = {
    ...(deviceId && { deviceId }),

    // "all" means no timestamp filter
    ...(range !== 'all' && {
      timestamp: {
        gte: dateFrom,
      },
    }),

    // One source = exact match
    // Multiple sources = Prisma IN filter
    ...(sources.length === 1
      ? { source: sources[0] }
      : sources.length > 1
        ? { source: { in: sources } }
        : {}),
  };

  try {
    const [total, logs] = await Promise.all([
      prisma.dosingLog.count({
        where,
      }),

      prisma.dosingLog.findMany({
        where,
        take,
        skip,
        orderBy: {
          timestamp: 'desc',
        },
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
        page: currentPage,
        pages: Math.ceil(total / take),
        limit: take,
      },

      data: logs,
    });
  } catch (error) {
    console.error('Error fetching dosing logs:', error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;