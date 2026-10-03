import express, { Router } from 'express';
import multer from 'multer';
import { z, ZodError } from 'zod';
import { loadPlaygroundConfig } from './config.js';
import { proxyInference } from './inferenceProxy.js';
import { PlaygroundMqttBridge } from './mqttBridge.js';
import { ACTUATOR_IDS, DIAGNOSIS_LABELS, HttpError, MIN_PULSE_MS } from './types.js';
import mqttClient from '../config/mqtt_broker.js';

/**
 * @typedef {Object} PlaygroundRouterOptions
 * @property {PlaygroundConfig} [config]
 * @property {PlaygroundMqttBridge} [bridge]
 */

/**
 * @typedef {Object} PlaygroundRouterHandle
 * @property {Router} router
 * @property {PlaygroundMqttBridge} bridge
 * @property {() => void} shutdown
 */

/**
 * @typedef {(req: Request, res: Response) => Promise<void>} AsyncHandler
 */

const asyncHandler =
  (fn) =>
  (req, res, next) => {
    fn(req, res).catch(next);
  };

export function createPlaygroundRouter(options = {}) {
  const config = options.config ?? loadPlaygroundConfig();
  const bridge = options.bridge ?? new PlaygroundMqttBridge(config, mqttClient)
  const router = Router();

  const actuatorBody = z
    .object({
      actuator: z.enum(ACTUATOR_IDS),
      state: z.enum(['ON', 'OFF']),
      durationMs: z.number().int().min(MIN_PULSE_MS).max(config.maxPulseMs).optional(),
    })
    .strict();

  const mockLabelSchema = z.enum(DIAGNOSIS_LABELS).optional();

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.maxImageBytes, files: 1 },
    fileFilter: (_req, file, cb) => cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype)),
  });

  router.use(express.json({ limit: '16kb' }));

  router.get('/health', (_req, res) => {
    res.json({ ok: true, mqttConnected: bridge.isConnected() });
  });

  router.get('/status', (_req, res) => {
    res.json(bridge.snapshot());
  });

  router.post(
    '/actuators',
    asyncHandler(async (req, res) => {
      const input = actuatorBody.parse(req.body);
      const receipt = await bridge.command(input);
      res.json(receipt);
    }),
  );

  router.post(
    '/actuators/stop-all',
    asyncHandler(async (_req, res) => {
      res.json(await bridge.stopAll());
    }),
  );

  router.post(
    '/inference',
    upload.single('image'),
    asyncHandler(async (req, res) => {
      const file = req.file;
      if (!file) throw new HttpError(400, 'Attach a JPEG, PNG or WebP image in the "image" form field');
      // Optional text field sent alongside the image: used only if the ML service is unreachable.
      const rawMock = req.body?.mockLabel;
      const mockLabel = mockLabelSchema.parse(typeof rawMock === 'string' && rawMock !== '' ? rawMock : undefined);

      const result = await proxyInference(
        { buffer: file.buffer, mimetype: file.mimetype, originalname: file.originalname },
        config,
        mockLabel,
      );
      res.json(result);
    }),
  );

  const errorHandler = (err, _req, res, _next) => {
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    if (err instanceof ZodError) {
      res.status(400).json({ error: err.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ') });
      return;
    }
    if (err instanceof multer.MulterError) {
      const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      res.status(status).json({ error: err.message });
      return;
    }
    console.error('[Playground] Unhandled error:', err);
    res.status(500).json({ error: 'Internal playground error' });
  };
  router.use(errorHandler);

  return { router, bridge, shutdown: () => bridge.close() };
}
