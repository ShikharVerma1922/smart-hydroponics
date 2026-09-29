const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const res = await fetch(url, config);
  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.error || data.message || 'API Error');
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ── Telemetry ──
export const telemetryAPI = {
  getLatest: (deviceId = 'esp32_node_01') =>
    request(`/api/telemetry/latest?deviceId=${deviceId}`),

  getHistory: (deviceId = 'esp32_node_01', range = '6h', interval = '5m') =>
    request(`/api/telemetry/history?deviceId=${deviceId}&range=${range}&interval=${interval}`),
};

// ── Actuators ──
export const actuatorAPI = {
  manualPulse: (deviceId, pumpType, durationMs) =>
    request('/api/actuators/manual-pulse', {
      method: 'POST',
      body: JSON.stringify({ deviceId, pumpType, durationMs }),
    }),

  setCirculation: (deviceId, mode, runMin, restMin) =>
    request('/api/actuators/circulation', {
      method: 'POST',
      body: JSON.stringify({ deviceId, mode, runMin, restMin }),
    }),
};

// ── Dosing Logs ──
export const dosingAPI = {
  getLogs: (params = {}) => {
    const query = new URLSearchParams();
    if (params.deviceId) query.set('deviceId', params.deviceId);
    if (params.source) query.set('source', params.source);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    return request(`/api/dosing/logs?${query.toString()}`);
  },
};

// ── Crop Recipe ──
export const cropAPI = {
  getRecipe: (deviceId = 'esp32_node_01') =>
    request(`/api/crop/recipe?deviceId=${deviceId}`),

  updateRecipe: (body) =>
    request('/api/crop/recipe', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
};

// ── Vision / ML ──
export const visionAPI = {
  analyze: (deviceId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('deviceId', deviceId);
    return request('/api/vision/analyze', {
      method: 'POST',
      body: formData,
    });
  },

  getLatest: (deviceId = 'esp32_node_01') =>
    request(`/api/vision/latest?deviceId=${deviceId}`),

  getHistory: (deviceId, page = 1, limit = 10) => {
    const query = new URLSearchParams({ page, limit });
    if (deviceId) query.set('deviceId', deviceId);
    return request(`/api/vision/history?${query.toString()}`);
  },
};

// ── System Status ──
export const systemAPI = {
  getStatus: (deviceId = 'esp32_node_01') =>
    request(`/api/system/status?deviceId=${deviceId}`),

  resolveAlert: (alertId, resolvedBy = 'USER') =>
    request(`/api/system/alerts/${alertId}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ resolvedBy }),
    }),

  getDevices: () => request('/api/system/devices'),

  addDevice: (body) =>
    request('/api/system/devices', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

// ── Uploaded file URL helper ──
export function getUploadUrl(relativePath) {
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;
  return `${API_BASE}${relativePath}`;
}
