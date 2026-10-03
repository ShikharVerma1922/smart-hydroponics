import { buildMockResult, normalizeInference } from './inferenceNormalizer.js';
import { HttpError } from './types.js';

/**
 * @typedef {Object} UploadedImage
 * @property {Buffer} buffer
 * @property {string} mimetype
 * @property {string} originalname
 */

/** FastAPI "detail" may be a string or a list of validation errors. */
function formatDetail(body) {
  if (typeof body === 'object' && body !== null && 'detail' in body) {
    const detail = body.detail;
    return (typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, 300);
  }
  return 'Image rejected by vision pre-filter.';
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function callModelService(image, cfg) {
  const form = new FormData();
  form.append(cfg.ml.fileField, new Blob([new Uint8Array(image.buffer)], { type: image.mimetype }), image.originalname);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), cfg.ml.timeoutMs);
  const startedAt = Date.now();

  let response;
  let text;
  try {
    response = await fetch(cfg.ml.url, { method: 'POST', body: form, signal: controller.signal });
    text = await response.text();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new HttpError(504, `ML service timed out after ${cfg.ml.timeoutMs} ms`);
    }
    throw new HttpError(502, `ML service unreachable: ${err instanceof Error ? err.message : 'unknown error'}`);
  } finally {
    clearTimeout(timeout);
  }

  const body = tryParseJson(text);

  // The vision pre-filter rejecting a non-canopy image is a real answer, not an outage.
  if (response.status === 422) {
    throw new HttpError(422, `Unprocessable canopy image: ${formatDetail(body)}`);
  }
  if (!response.ok) {
    throw new HttpError(502, `ML service returned ${response.status}${text ? `: ${text.slice(0, 200)}` : ''}`);
  }
  if (body === null) throw new HttpError(502, 'ML service returned a non-JSON response');

  return normalizeInference(body, Date.now() - startedAt);
}

/**
 * Forwards an image to the ML service (multipart) and normalizes the reply.
 * If the service is unreachable/failing and the caller supplied a mock label, that label is
 * returned flagged `mocked: true`. Without one the error is surfaced (never a silent HEALTHY).
 */
export async function proxyInference(
  image,
  cfg,
  mockLabel,
) {
  try {
    return await callModelService(image, cfg);
  } catch (err) {
    if (err instanceof HttpError && err.status === 422) throw err;
    if (mockLabel) {
      console.warn(`[Playground] ML service failed (${err instanceof Error ? err.message : err}); using mock label ${mockLabel}`);
      return buildMockResult(mockLabel);
    }
    throw err;
  }
}
