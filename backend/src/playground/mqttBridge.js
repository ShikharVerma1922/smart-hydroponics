import { randomUUID } from 'node:crypto';
import mqtt from 'mqtt';
import { ACTUATOR_IDS, DOSING_ACTUATORS, HttpError, MIN_PULSE_MS } from './types.js';

const COMMAND_TTL_MS = 15_000;
/** The backend sends an explicit OFF slightly after the rig's own timeout (belt and braces). */
const AUTO_RESET_GRACE_MS = 300;
const RIG_STALE_AFTER_MS = 45_000;

export class PlaygroundMqttBridge {
  resetTimers = new Map();
  resetDeadlines = new Map();
  rigStatus = null;

  constructor(
    cfg,
    existingClient,
  ) {
    this.cfg = cfg;
    this.ownsClient = existingClient === undefined;
    this.client =
      existingClient ??
      mqtt.connect(cfg.mqttUrl, {
        reconnectPeriod: 3000,
        clientId: `playground-bridge-${randomUUID().slice(0, 8)}`,
      });

    this.client.on('connect', () => {
  console.log('[Playground MQTT] connected, subscribing to:', this.cfg.topics.status);
  this.subscribeToStatus();
});
    this.client.on('message', (topic, payload) => this.onMessage(topic, payload));
    this.client.on('error', (err) => {
  console.error('[Playground MQTT] MQTT error:', {
    name: err?.name,
    message: err?.message,
    code: err?.code,
    errno: err?.errno,
    syscall: err?.syscall,
    address: err?.address,
    port: err?.port,
    stack: err?.stack,
  });
});
    if (this.client.connected) this.subscribeToStatus();
    this.client.on('close', () => {
  console.error('[Playground MQTT] connection closed');
});

this.client.on('offline', () => {
  console.error('[Playground MQTT] client offline');
});

this.client.on('reconnect', () => {
  console.log('[Playground MQTT] reconnecting...');
});
  }

  isConnected() {
    return this.client.connected;
  }

  /**
   * Turns one actuator on/off. A timed ON schedules an automatic OFF so a lost
   * browser tab can never leave a pump running.
   */
  async command(input) {
    const { actuator, state, durationMs } = input;

    if (state === 'ON' && DOSING_ACTUATORS.has(actuator) && durationMs === undefined) {
      throw new HttpError(400, `${actuator} requires durationMs when switched ON`);
    }
    if (durationMs !== undefined && (durationMs < MIN_PULSE_MS || durationMs > this.cfg.maxPulseMs)) {
      throw new HttpError(400, `durationMs must be between ${MIN_PULSE_MS} and ${this.cfg.maxPulseMs}`);
    }

    // A new command always supersedes a pending auto-reset for the same actuator.
    this.clearResetTimer(actuator);

    const commandId = randomUUID();
    const payload = {
      type: 'SET',
      command_id: commandId,
      expires_at: Date.now() + COMMAND_TTL_MS,
      actuator,
      state,
      ...(state === 'ON' && durationMs !== undefined ? { duration_ms: durationMs } : {}),
    };
    await this.publish(payload);

    let autoResetInMs = null;
    if (state === 'ON' && durationMs !== undefined) {
      autoResetInMs = durationMs + AUTO_RESET_GRACE_MS;
      this.armAutoReset(actuator, autoResetInMs);
    }

    return { ok: true, commandId, topic: this.cfg.topics.command, autoResetInMs };
  }

  async stopAll() {
    for (const id of ACTUATOR_IDS) this.clearResetTimer(id);

    const commandId = randomUUID();
    await this.publish({
      type: 'STOP_ALL',
      command_id: commandId,
      expires_at: Date.now() + COMMAND_TTL_MS,
    });
    return { ok: true, commandId };
  }

  snapshot() {
    const now = Date.now();
    const activeTimers = {};
    for (const [id, deadline] of this.resetDeadlines) {
      activeTimers[id] = Math.max(0, deadline - now);
    }
    return {
      mqttConnected: this.client.connected,
      rigOnline: this.rigStatus !== null && this.rigStatus.online && now - this.rigStatus.receivedAt < RIG_STALE_AFTER_MS,
      rigId: this.cfg.rigId,
      topics: this.cfg.topics,
      rig: this.rigStatus,
      activeTimers,
    };
  }

  close() {
    for (const id of ACTUATOR_IDS) this.clearResetTimer(id);
    if (this.ownsClient) this.client.end(true);
  }

  /* ---------- internals ---------- */

  publish(payload) {
    return new Promise((resolve, reject) => {
      if (!this.client.connected) {
        reject(new HttpError(503, 'MQTT broker not connected'));
        return;
      }
      this.client.publish(this.cfg.topics.command, JSON.stringify(payload), { qos: 1 }, (err) => {
        if (err) reject(new HttpError(502, `MQTT publish failed: ${err.message}`));
        else resolve();
      });
    });
  }

  armAutoReset(actuator, delayMs) {
    this.resetDeadlines.set(actuator, Date.now() + delayMs);
    const timer = setTimeout(() => {
      this.resetTimers.delete(actuator);
      this.resetDeadlines.delete(actuator);
      this.publish({
        type: 'SET',
        command_id: randomUUID(),
        expires_at: Date.now() + COMMAND_TTL_MS,
        actuator,
        state: 'OFF',
      }).catch((err) => {
        console.error(`[Playground MQTT] auto-reset of ${actuator} failed:`, err instanceof Error ? err.message : err);
      });
    }, delayMs);
    this.resetTimers.set(actuator, timer);
  }

  clearResetTimer(actuator) {
    const timer = this.resetTimers.get(actuator);
    if (timer) clearTimeout(timer);
    this.resetTimers.delete(actuator);
    this.resetDeadlines.delete(actuator);
  }

 subscribeToStatus() {
  console.log('[Playground MQTT] subscribing:', this.cfg.topics.status);

  this.client.subscribe(this.cfg.topics.status, { qos: 1 }, (err, granted) => {
    if (err) {
      console.error('[Playground MQTT] status subscribe failed:', err);
      return;
    }

    console.log('[Playground MQTT] subscription successful:', granted);
  });
}

  onMessage(topic, payload) {
    if (topic !== this.cfg.topics.status) return;
    try {
      const parsed = JSON.parse(payload.toString('utf8'));
      if (typeof parsed !== 'object' || parsed === null) return;
      const p = parsed;
      this.rigStatus = {
        online: p.online === true,
        rig: typeof p.rig === 'string' ? p.rig : undefined,
        uptime_ms: typeof p.uptime_ms === 'number' ? p.uptime_ms : undefined,
        actuators: this.parseActuators(p.actuators),
        receivedAt: Date.now(),
      };
    } catch {
      /* malformed status messages are ignored */
    }
  }

  parseActuators(value) {
    const out = {};
    if (typeof value !== 'object' || value === null) return out;
    const record = value;
    for (const id of ACTUATOR_IDS) {
      const v = record[id];
      if (typeof v === 'boolean') out[id] = v;
    }
    return out;
  }
}
