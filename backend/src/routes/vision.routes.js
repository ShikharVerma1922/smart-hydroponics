import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '../config/prisma.js';
import { handleIncomingDiagnosticReport } from '../services/dosing.service.js';

const router = express.Router();

// ─────────────────────────────────────────────
// Cloudinary configuration
// ─────────────────────────────────────────────

cloudinary.config({
  secure: true,
});

// ─────────────────────────────────────────────
// Multer
// Images are kept in memory temporarily.
// No local upload directory is required.
// ─────────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL ||
  'http://localhost:8000/api/vision/predict';

/**
 * POST /api/vision/analyze
 *
 * Flow:
 * 1. Receive image through Multer
 * 2. Keep image temporarily in memory
 * 3. Send image to Python ML service
 * 4. Upload image to Cloudinary
 * 5. Save Cloudinary secure_url in PostgreSQL
 * 6. Trigger dosing/remediation logic
 */
router.post('/analyze', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No image uploaded',
    });
  }

  const deviceId = req.body.deviceId || 'esp32_node_01';
  const imageBuffer = req.file.buffer;

  try {
    // ─────────────────────────────────────────────
    // Ensure Device exists
    // ─────────────────────────────────────────────

    await prisma.device.upsert({
      where: {
        id: deviceId,
      },
      update: {},
      create: {
        id: deviceId,
        name: `Hydroponics Unit (${deviceId})`,
      },
    });

    let primaryLabel = 'HEALTHY';
    let confidence = 0.94;
    let severity = 'LOW';

    let classProbabilities = {
      HEALTHY: 0.94,
      NITROGEN_DEFICIENCY: 0.03,
      POTASSIUM_DEFICIENCY: 0.02,
      PHOSPHORUS_DEFICIENCY: 0.01,
      CALCIUM_DEFICIENCY: 0.0,
      MAGNESIUM_DEFICIENCY: 0.0,
      IRON_DEFICIENCY: 0.0,
    };

    // ─────────────────────────────────────────────
    // 1. Forward image to Python FastAPI vision service
    // ─────────────────────────────────────────────

    try {
      const form = new FormData();

      form.append(
        'file',
        imageBuffer,
        {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
        }
      );

      const mlResponse = await axios.post(
        ML_SERVICE_URL,
        form,
        {
          headers: form.getHeaders(),
          timeout: 15000,
        }
      );

      const resData = mlResponse.data;

      console.log(resData)

      if (resData) {
        primaryLabel =
          resData.primary_label ||
          resData.primaryLabel ||
          primaryLabel;

        confidence = parseFloat(
          resData.confidence ?? confidence
        );

        severity =
          resData.severity ||
          (primaryLabel === 'HEALTHY'
            ? 'NONE'
            : 'MODERATE');

        classProbabilities =
          resData.class_probabilities ||
          resData.classProbabilities ||
          classProbabilities;
      }
    } catch (mlErr) {
      // ─────────────────────────────────────────
      // ML service rejected the image
      // ─────────────────────────────────────────

      if (
        mlErr.response &&
        mlErr.response.status === 422
      ) {
        const errorDetail =
          mlErr.response.data?.detail ||
          'Image rejected by vision pre-filter.';

        console.warn(
          `[ML Service 422] Canopy validation failed for device ${deviceId}:`,
          errorDetail
        );

        return res.status(422).json({
          success: false,
          error: 'Unprocessable Canopy Image',
          detail: errorDetail,
        });
      }

      // ─────────────────────────────────────────
      // ML service unavailable
      // ─────────────────────────────────────────

      console.warn(
        `[ML Service] FastAPI request failed (${mlErr.message}). Checking manual mock override.`
      );

      if (req.body.mockLabel) {
        primaryLabel = req.body.mockLabel;

        severity =
          primaryLabel === 'HEALTHY'
            ? 'NONE'
            : 'MODERATE';
      } else {
        console.warn(
          '[ML Service] Operating in offline mode. Falling back to baseline HEALTHY.'
        );
      }
    }

    // ─────────────────────────────────────────────
    // 2. Upload image to Cloudinary
    // ─────────────────────────────────────────────

    let imageUrl = null;

    try {
      const cloudinaryResult =
        await new Promise((resolve, reject) => {
          const stream =
            cloudinary.uploader.upload_stream(
              {
                folder: 'smart-hydroponics/canopy',
                resource_type: 'image',
                use_filename: true,
                unique_filename: true,
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );

          stream.end(imageBuffer);
        });

      imageUrl = cloudinaryResult.secure_url;

      console.log(
        `[Cloudinary] Image uploaded successfully: ${imageUrl}`
      );
    } catch (cloudinaryError) {
      console.error(
        '[Cloudinary] Image upload failed'
      );

      console.error(
        'Full error:',
        cloudinaryError
      );

      console.error(
        'Message:',
        cloudinaryError?.message
      );

      console.error(
        'HTTP code:',
        cloudinaryError?.http_code
      );

      console.error(
        'Name:',
        cloudinaryError?.name
      );

      throw new Error(
        `Cloudinary upload failed (${
          cloudinaryError?.http_code || 'unknown'
        }): ${
          cloudinaryError?.message ||
          'Unknown Cloudinary error'
        }`
      );
    }

    // ─────────────────────────────────────────────
    // 3. Check active cooldown
    // ─────────────────────────────────────────────

    const existingActiveCooldown =
      await prisma.diagnosticReport.findFirst({
        where: {
          deviceId,
          cooldownActiveTill: {
            gt: new Date(),
          },
        },
        select: {
          cooldownActiveTill: true,
        },
      });

    // ─────────────────────────────────────────────
    // 4. Persist diagnostic report
    // ─────────────────────────────────────────────

    const report =
      await prisma.diagnosticReport.create({
        data: {
          deviceId,

          // Permanent Cloudinary URL
          imageUrl,

          primaryLabel,
          confidence,
          severity,
          classProbabilities,

          actionTaken:
            'Diagnosis pending telemetry evaluation',

          cooldownActiveTill:
            existingActiveCooldown?.cooldownActiveTill ??
            null,
        },
      });

    // ─────────────────────────────────────────────
    // 5. Trigger slow-loop remediation logic
    // ─────────────────────────────────────────────

    handleIncomingDiagnosticReport(report).catch(
      (err) => {
        console.error(
          '[Vision Dosing Evaluation Error]:',
          err.message
        );
      }
    );

    // ─────────────────────────────────────────────
    // 6. Response
    // ─────────────────────────────────────────────

    return res.status(201).json({
      success: true,
      message: 'Canopy image diagnosed and logged',
      data: report,
    });
  } catch (error) {
    console.error(
      'Error handling diagnostic report:',
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/vision/latest
 *
 * Query:
 * ?deviceId=esp32_node_01
 */

router.get('/latest', async (req, res) => {
  const {
    deviceId = 'esp32_node_01',
  } = req.query;

  try {
    const report =
      await prisma.diagnosticReport.findFirst({
        where: {
          deviceId,
        },
        orderBy: {
          timestamp: 'desc',
        },
        include: {
          dosingEvents: true,
        },
      });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'No diagnostic reports found',
      });
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/vision/history
 *
 * Query:
 * ?deviceId=esp32_node_01&page=1&limit=10
 */

router.get('/history', async (req, res) => {
  const {
    deviceId,
    page = 1,
    limit = 10,
  } = req.query;

  const take = Math.min(
    parseInt(limit, 10) || 10,
    50
  );

  const currentPage =
    parseInt(page, 10) || 1;

  const skip =
    (currentPage - 1) * take;

  const where = deviceId
    ? { deviceId }
    : {};

  try {
    const [total, reports] =
      await Promise.all([
        prisma.diagnosticReport.count({
          where,
        }),

        prisma.diagnosticReport.findMany({
          where,
          take,
          skip,
          orderBy: {
            timestamp: 'desc',
          },
          include: {
            dosingEvents: true,
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

      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;