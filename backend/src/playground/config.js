import { z } from 'zod';

const EnvSchema = z.object({
  MQTT_URL: z.string().default('mqtt://localhost:1883'),
  MQTT_USERNAME: z.string().optional(),
  MQTT_PASSWORD: z.string().optional(),
  PLAYGROUND_RIG_ID: z
    .string()
    .regex(/^[A-Za-z0-9_-]{1,32}$/, 'rig id may only contain letters, digits, _ and -')
    .default('rig01'),
  PLAYGROUND_TOPIC_PREFIX: z.string().default('hydro/playground'),
  PLAYGROUND_MAX_PULSE_MS: z.coerce.number().int().positive().default(30_000),
  PLAYGROUND_MAX_IMAGE_BYTES: z.coerce.number().int().positive().default(8 * 1024 * 1024),
  // The rig sends a heartbeat every 10 s; 25 s = two missed heartbeats plus margin before it is shown offline.
  PLAYGROUND_RIG_STALE_MS: z.coerce.number().int().positive().default(25_000),
  ML_SERVICE_URL: z.string().url().default('http://localhost:8000/predict'),
  ML_FILE_FIELD: z.string().min(1).default('file'),
  ML_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
});

/**
 * @typedef {Object} PlaygroundConfig
 * @property {string} mqttUrl
 * @property {string} [mqttUsername]
 * @property {string} [mqttPassword]
 * @property {string} rigId
 * @property {number} maxPulseMs
 * @property {number} maxImageBytes
 * @property {number} rigStaleMs - the rig is reported offline when no heartbeat arrived for this long
 * @property {{ url: string; fileField: string; timeoutMs: number }} ml
 * @property {{ command: string; status: string }} topics
 */

/**
 * Loads and validates configuration.
 * The topic prefix MUST live under "hydro/playground" so the playground can never
 * publish to a production device topic such as hydro/<deviceId>/commands.
 */
export function loadPlaygroundConfig(env = process.env) {
  const e = EnvSchema.parse(env);

  const prefix = e.PLAYGROUND_TOPIC_PREFIX.replace(/\/+$/, '');
  if (!/^hydro\/playground(\/|$)/.test(prefix)) {
    throw new Error('PLAYGROUND_TOPIC_PREFIX must start with "hydro/playground" to stay isolated from production topics');
  }

  const base = `${prefix}/${e.PLAYGROUND_RIG_ID}`;
  return {
    mqttUrl: e.MQTT_URL,
    mqttUsername: e.MQTT_USERNAME,
    mqttPassword: e.MQTT_PASSWORD,
    rigId: e.PLAYGROUND_RIG_ID,
    maxPulseMs: e.PLAYGROUND_MAX_PULSE_MS,
    maxImageBytes: e.PLAYGROUND_MAX_IMAGE_BYTES,
    rigStaleMs: e.PLAYGROUND_RIG_STALE_MS,
    ml: { url: e.ML_SERVICE_URL, fileField: e.ML_FILE_FIELD, timeoutMs: e.ML_TIMEOUT_MS },
    topics: { command: `${base}/cmd`, status: `${base}/status` },
  };
}
