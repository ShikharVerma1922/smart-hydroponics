
/** Relative path: next.config rewrites /api/playground/* to the Express backend. */
const BASE = '/api/playground';

export class ApiError extends Error {
  constructor(
    status,
    message,
  ) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

function extractError(body, status) {
  if (typeof body === 'object' && body !== null && 'error' in body) {
    const value = body.error;
    if (typeof value === 'string') return value;
  }
  return `Request failed (${status})`;
}

async function request(path, init) {
  const res = await fetch(`${BASE}${path}`, init);
  const text = await res.text();

  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!res.ok) throw new ApiError(res.status, extractError(body, res.status));
  return body;
}

export function describeError(err) {
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}

export const playgroundApi = {
  status: () => request('/status'),

  sendActuator: (cmd) =>
    request('/actuators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cmd),
    }),

  stopAll: () =>
    request('/actuators/stop-all', { method: 'POST' }),

  /** mockLabel is only used by the backend if the ML service is unreachable. */
  infer: (file, mockLabel) => {
    const form = new FormData();
    form.append('image', file);
    if (mockLabel) form.append('mockLabel', mockLabel);
    return request('/inference', { method: 'POST', body: form });
  },
};
