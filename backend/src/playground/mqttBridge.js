import { randomUUID } from 'node:crypto';
import mqtt from 'mqtt';
import { ACTUATOR_IDS, DOSING_ACTUATORS, HttpError, MIN_PULSE_MS } from './types.js';

const COMMAND_TTL_MS = 15_000;
/** The backend sends an explicit OFF slightly after the rig's own timeout (belt and braces). */
const AUTO_RESET_GRACE_MS = 300;

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
        username: cfg.mqttUsername,
        password: cfg.mqttPassword,
        reconnectPeriod: 3000,
        clientId: `playground-bridge-${randomUUID().slice(0, 8)}`,
      });

    this.client.on('connect', () => this.subscribeToStatus());
    this.client.on('message', (topic, payload, packet) => this.onMessage(topic, payload, packet));
    this.client.on('error', (err) => console.error('[Playground MQTT] error:', err.message));
    if (this.client.connected) this.subscribeToStatus();
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

    // "ok" means the BROKER accepted the command; rigOnline tells the caller whether the rig is likely to receive it.
    return { ok: true, commandId, topic: this.cfg.topics.command, autoResetInMs, rigOnline: this.snapshot().rigOnline };
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
      rigOnline: this.rigStatus !== null && this.rigStatus.online && now - this.rigStatus.receivedAt < this.cfg.rigStaleMs,
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
    this.client.subscribe(this.cfg.topics.status, { qos: 1 }, (err) => {
      if (err) console.error('[Playground MQTT] status subscribe failed:', err.message);
    });
  }

  onMessage(topic, payload, packet) {
    if (topic !== this.cfg.topics.status) return;
    try {
      const parsed = JSON.parse(payload.toString('utf8'));
      if (typeof parsed !== 'object' || parsed === null) return;
      const p = parsed;
      this.rigStatus = {
        online: p.online === true,
        rig: typeof p.rig === 'string' ? p.rig : undefined,
        uptime_ms: typeof p.uptime_ms === 'number' ? p.uptime_ms : undefined,
        rssi: typeof p.rssi === 'number' ? p.rssi : undefined,
        reconnects: typeof p.reconnects === 'number' ? p.reconnects : undefined,
        actuators: this.parseActuators(p.actuators),
        // A retained message is replayed by the broker on (re)subscribe and may be arbitrarily old, so it
        // proves nothing about the rig being alive right now. Treat it as stale until a live heartbeat arrives.
        receivedAt: packet && packet.retain ? 0 : Date.now(),
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
