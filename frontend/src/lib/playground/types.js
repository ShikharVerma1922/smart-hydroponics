/**
 * @typedef {'PH_DOWN' | 'NUTRIENT_A' | 'NUTRIENT_B'} PumpType
 */
/**
 * @typedef {'CIRCULATION_PUMP' | PumpType} ActuatorId
 */

export const ACTUATOR_LABELS = {
  CIRCULATION_PUMP: 'Circulation pump',
  PH_DOWN: 'pH Down',
  NUTRIENT_A: 'Nutrient A',
  NUTRIENT_B: 'Nutrient B',
};

/**
 * @typedef {'HEALTHY' | 'NITROGEN_DEFICIENCY' | 'PHOSPHORUS_DEFICIENCY' | 'POTASSIUM_DEFICIENCY' | 'CALCIUM_DEFICIENCY' | 'MAGNESIUM_DEFICIENCY' | 'IRON_DEFICIENCY' | 'BIOTIC_STRESS' | 'UNKNOWN'} DiagnosisLabel
 */

/**
 * NONE is what the production pipeline uses for HEALTHY canopies.
 * @typedef {'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'} Severity
 */

/**
 * @typedef {Object} SensorReadings
 * @property {number} ph
 * @property {number} ecMsCm
 * @property {number} waterLevelPct
 * @property {number} waterTempC
 * @property {number} airTempC
 * @property {number} humidityPct
 */

/**
 * @typedef {Object} RecipeTargets
 * @property {number} targetPhMax
 * @property {number} targetEcMin
 */

/**
 * A diagnosis as seen by the decision engine.
 * @typedef {Object} MlReport
 * @property {DiagnosisLabel} label
 * @property {Severity} severity
 * @property {number} confidence
 * @property {number | null} cooldownUntilMs - null = fresh; in the future = acted on (visual cooldown); in the past = consumed.
 * @property {'scenario' | 'inference'} source
 */

/* ---------- Decision engine ---------- */

/**
 * @typedef {'validate' | 'water' | 'acid' | 'osmotic' | 'lockout' | 'ph' | 'biotic' | 'ec' | 'desync'} SpineNodeId
 */

/**
 * @typedef {'T_FAULT' | 'T_EMERGENCY' | 'T_ACID' | 'T_OSMOTIC' | 'T_COOLDOWN' | 'T_PH_DOSE' | 'T_BIOTIC' | 'T_EC_DOSE' | 'T_DESYNC' | 'T_BALANCED'} TerminalId
 */

/**
 * @typedef {SpineNodeId | TerminalId} TraceId
 */

/**
 * @typedef {'DOSED' | 'BALANCED' | 'COOLDOWN' | 'EMERGENCY' | 'LOCKOUT' | 'OFF' | 'ALERT'} EngineStatus
 */
/**
 * @typedef {'NONE' | 'DOSE' | 'ALERT' | 'SUPPRESSED' | 'MANUAL'} EngineAction
 */

/**
 * @typedef {Object} Pulse
 * @property {PumpType} pump
 * @property {number} durationMs
 * @property {number} delayMs - Delay from the moment the dose is issued (Part B waits for dilution).
 */

/**
 * @typedef {Object} DosePlan
 * @property {'AUTONOMOUS_PH' | 'AUTONOMOUS_EC' | 'ML_BIASED'} source
 * @property {Pulse[]} pulses
 * @property {string} ratio
 * @property {boolean} consumesReport - true when this dose "uses up" the ML report (starts its visual cooldown).
 */

/**
 * @typedef {Object} EngineConfig
 * @property {number} waterMinPct
 * @property {number} phHardMin
 * @property {number} ecCeiling
 * @property {number} targetPhMax
 * @property {number} targetEcMin
 * @property {number} phPulseMs
 * @property {number} basePulseMs
 * @property {number} partBDelayMs
 * @property {boolean} blockNutrientsOnBiotic
 */

/**
 * @typedef {Object} EngineResult
 * @property {EngineStatus} status
 * @property {EngineAction} action
 * @property {string} rationale
 * @property {TraceId[]} trace
 * @property {TerminalId} terminal
 * @property {DosePlan | null} dose
 * @property {string[]} alerts
 */

/* ---------- Simulator ---------- */

/**
 * @typedef {Object} ActuatorView
 * @property {boolean} on
 * @property {number} remainingMs
 */

/**
 * @typedef {Object} SimEvent
 * @property {number} id
 * @property {number} at
 * @property {'info' | 'dose' | 'warn' | 'error'} level
 * @property {string} message
 */

/* ---------- Backend API ---------- */

/**
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
 * @typedef {Object} BridgeStatus
 * @property {boolean} mqttConnected
 * @property {boolean} rigOnline
 * @property {string} rigId
 * @property {{ command: string; status: string }} topics
 * @property {RigStatus | null} rig
 * @property {Partial<Record<ActuatorId, number>>} activeTimers
 */

/**
 * @typedef {Object} ActuatorCommandRequest
 * @property {ActuatorId} actuator
 * @property {'ON' | 'OFF'} state
 * @property {number} [durationMs]
 */

/**
 * @typedef {Object} ActuatorReceipt
 * @property {true} ok
 * @property {string} commandId
 * @property {string} topic
 * @property {number | null} autoResetInMs
 * @property {boolean} rigOnline - the rig was reporting online when the command was published
 */

/**
 * @typedef {Object} InferenceBox
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
 * @property {InferenceBox} box
 * @property {boolean} normalized
 */

/**
 * @typedef {Object} ClassProbability
 * @property {DiagnosisLabel} label
 * @property {string} rawLabel
 * @property {number} probability - 0..1
 */

/**
 * @typedef {Object} InferenceResponse
 * @property {InferenceDetection[]} detections - Empty for the current classifier; populated if the model service ever returns boxes.
 * @property {DiagnosisLabel} primaryLabel
 * @property {string} rawPrimaryLabel
 * @property {Severity} severity
 * @property {'service' | 'derived'} severitySource
 * @property {number} confidence
 * @property {ClassProbability[]} classProbabilities
 * @property {number} latencyMs
 * @property {boolean} mocked - true when the ML service was down and the mock label you selected was used instead.
 */
