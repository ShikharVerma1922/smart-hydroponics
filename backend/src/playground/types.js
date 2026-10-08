export const ACTUATOR_IDS = ['CIRCULATION_PUMP', 'PH_DOWN', 'NUTRIENT_A', 'NUTRIENT_B'];
/**
 * @typedef {(typeof ACTUATOR_IDS)[number]} ActuatorId
 */

/** Actuators that must always be pulsed with a bounded duration. */
export const DOSING_ACTUATORS = new Set([
  'PH_DOWN',
  'NUTRIENT_A',
  'NUTRIENT_B',
]);

export const MIN_PULSE_MS = 100;

/**
 * @typedef {'ON' | 'OFF'} ActuatorState
 */

/**
 * @typedef {Object} ActuatorCommandInput
 * @property {ActuatorId} actuator
 * @property {ActuatorState} state
 * @property {number} [durationMs]
 */

/**
 * Wire format published to the ESP8266 rig.
 * @typedef {Object} RigCommandPayload
 * @property {'SET' | 'STOP_ALL'} type
 * @property {string} command_id
 * @property {number} expires_at
 * @property {ActuatorId} [actuator]
 * @property {ActuatorState} [state]
 * @property {number} [duration_ms]
 */

/**
 * Wire format the rig publishes (retained) on its status topic.
 * @typedef {Object} RigStatus
 * @property {boolean} online
 * @property {string} [rig]
 * @property {number} [uptime_ms]
 * @property {number} [rssi] - rig WiFi signal strength in dBm
 * @property {number} [reconnects] - MQTT reconnects since the rig booted
 * @property {Partial<Record<ActuatorId, boolean>>} actuators
 * @property {number} receivedAt
 */

/**
 * @typedef {Object} CommandReceipt
 * @property {true} ok
 * @property {string} commandId
 * @property {string} topic
 * @property {number | null} autoResetInMs
 * @property {boolean} rigOnline - the rig was reporting online when the command was published
 */

/**
 * @typedef {Object} BridgeSnapshot
 * @property {boolean} mqttConnected
 * @property {boolean} rigOnline
 * @property {string} rigId
 * @property {{ command: string; status: string }} topics
 * @property {RigStatus | null} rig
 * @property {Partial<Record<ActuatorId, number>>} activeTimers
 */

export class HttpError extends Error {
  constructor(
    status,
    message,
  ) {
    super(message);
    this.status = status;
    this.name = 'HttpError';
  }
}

/* ---------- Inference ---------- */

export const DIAGNOSIS_LABELS = [
  'HEALTHY',
  'NITROGEN_DEFICIENCY',
  'PHOSPHORUS_DEFICIENCY',
  'POTASSIUM_DEFICIENCY',
  'CALCIUM_DEFICIENCY',
  'MAGNESIUM_DEFICIENCY',
  'IRON_DEFICIENCY',
  'BIOTIC_STRESS',
  'UNKNOWN',
];
/**
 * @typedef {(typeof DIAGNOSIS_LABELS)[number]} DiagnosisLabel
 */

/**
 * NONE is what the production pipeline uses for HEALTHY canopies.
 * @typedef {'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'} Severity
 */

/**
 * @typedef {Object} Box
 * @property {number} x1
 * @property {number} y1
 * @property {number} x2
 * @property {number} y2
 */

/**
 * @typedef {Object} InferenceDetection
 * @property {DiagnosisLabel} label
 * @property {string} rawLabel
 * @property {number} confidence
 * @property {Box} box
 * @property {boolean} normalized - true when box coordinates are 0..1 fractions of the image, false when pixels.
 */

/**
 * @typedef {Object} ClassProbability
 * @property {DiagnosisLabel} label
 * @property {string} rawLabel
 * @property {number} probability - 0..1
 */

/**
 * @typedef {Object} InferenceResult
 * @property {InferenceDetection[]} detections - Optional: only populated if the model service returns boxes (the classifier does not).
 * @property {DiagnosisLabel} primaryLabel
 * @property {string} rawPrimaryLabel - Label exactly as the model service returned it (useful when primaryLabel is UNKNOWN).
 * @property {Severity} severity
 * @property {'service' | 'derived'} severitySource
 * @property {number} confidence - 0..1
 * @property {ClassProbability[]} classProbabilities
 * @property {number} latencyMs
 * @property {boolean} mocked - true when the ML service was unreachable and a caller-supplied mock label was used.
 */
