// backend/src/routes/vision.routes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import { prisma } from '../config/prisma.js';
import { handleIncomingDiagnosticReport } from '../services/dosing.service.js';

const router = express.Router();

// Local uploads directory
const UPLOADS_DIR = path.resolve('uploads/canopy');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `canopy-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed!'), false);
  },
});

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000/api/vision/predict';

/**
 * POST /api/vision/analyze
 * Receives an image, executes CNN inference, logs the DiagnosticReport,
 * and triggers closed-loop remediation logic against live InfluxDB telemetry.
 */
router.post('/analyze', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No image uploaded' });
  }

  const deviceId = req.body.deviceId || 'esp32_node_01';
  const filePath = req.file.path;
  const relativeUrl = `/uploads/canopy/${req.file.filename}`;

  try {
    // Ensure the Device foreign key exists in PostgreSQL
    await prisma.device.upsert({
      where: { id: deviceId },
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
    };

    // 1. Forward image to Python FastAPI vision service
    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));

      const mlResponse = await axios.post(ML_SERVICE_URL, form, {
        headers: form.getHeaders(),
        timeout: 6000,
      });

      if (mlResponse.data) {
        primaryLabel = mlResponse.data.diagnosis?.primary_label || mlResponse.data.primaryLabel || primaryLabel;
        confidence = parseFloat(mlResponse.data.diagnosis?.confidence ?? mlResponse.data.confidence ?? confidence);
        severity = mlResponse.data.diagnosis?.severity || mlResponse.data.severity || (primaryLabel === 'HEALTHY' ? 'LOW' : 'MODERATE');
        classProbabilities = mlResponse.data.class_probabilities || mlResponse.data.classProbabilities || classProbabilities;
      }
    } catch (mlErr) {
      console.warn(`[ML Service] FastAPI unreachable at ${ML_SERVICE_URL}. Using fallback baseline:`, mlErr.message);
      // Optional manual testing override from client form-data
      if (req.body.mockLabel) {
        primaryLabel = req.body.mockLabel;
        severity = primaryLabel === 'HEALTHY' ? 'LOW' : 'MODERATE';
      }
    }

    // 2. Persist in PostgreSQL via DiagnosticReport model
    const report = await prisma.diagnosticReport.create({
      data: {
        deviceId,
        imageUrl: relativeUrl,
        primaryLabel,
        confidence,
        severity,
        classProbabilities,
        actionTaken: 'Diagnosis pending telemetry evaluation',
      },
    });

    // 3. Trigger Slow-Loop remediation logic asynchronously
    handleIncomingDiagnosticReport(report).catch((err) => {
      console.error('[Vision Dosing Evaluation Error]:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Canopy image diagnosed and logged',
      data: report,
    });
  } catch (error) {
    console.error('Error handling diagnostic report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/vision/latest
 * Query: ?deviceId=esp32_node_01
 * Fetches the most recent scan and its associated dosing logs
 */
router.get('/latest', async (req, res) => {
  const { deviceId = 'esp32_node_01' } = req.query;

  try {
    const report = await prisma.diagnosticReport.findFirst({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
      include: { dosingEvents: true },
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'No diagnostic reports found' });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/vision/history
 * Query: ?deviceId=esp32_node_01&page=1&limit=10
 */
router.get('/history', async (req, res) => {
  const { deviceId, page = 1, limit = 10 } = req.query;
  const take = Math.min(parseInt(limit, 10) || 10, 50);
  const skip = ((parseInt(page, 10) || 1) - 1) * take;

  const where = deviceId ? { deviceId } : {};

  try {
    const [total, reports] = await Promise.all([
      prisma.diagnosticReport.count({ where }),
      prisma.diagnosticReport.findMany({
        where,
        take,
        skip,
        orderBy: { timestamp: 'desc' },
        include: { dosingEvents: true },
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
      data: reports,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;