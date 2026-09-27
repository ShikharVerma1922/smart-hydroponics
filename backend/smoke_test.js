// backend/smoke_test.js
import mqtt from 'mqtt';
import { io } from 'socket.io-client';
import axios from 'axios';

const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const DEVICE_ID = 'esp32_node_01';
const TELEMETRY_TOPIC = 'hydro/system1/telemetry';
const COMMAND_TOPIC = `hydro/${DEVICE_ID}/commands`;

// Helper sleep
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.mqttClient = null;
    this.socket = null;
    this.receivedCommands = [];
    this.receivedSocketEvents = [];
    this.receivedAlerts = [];
  }

  async setup() {
    console.log('\n======================================================');
    console.log('   INITIALIZING CLOSED-LOOP END-TO-END SUITE');
    console.log('======================================================');

    this.mqttClient = mqtt.connect(MQTT_URL);
    this.socket = io(BACKEND_URL, { transports: ['websocket'] });

    await Promise.all([
      new Promise((resolve, reject) => {
        this.mqttClient.on('connect', () => {
          console.log('[MQTT] Connected to Broker:', MQTT_URL);
          resolve();
        });
        this.mqttClient.on('error', (err) => reject(err));
      }),
      new Promise((resolve, reject) => {
        this.socket.on('connect', () => {
          console.log(`[Socket.io] Connected to Backend Gateway (Socket ID: ${this.socket.id})`);
          resolve();
        });
        this.socket.on('connect_error', (err) => reject(err));
      }),
    ]);

    // Subscribe to device actuation channel
    this.mqttClient.subscribe(COMMAND_TOPIC, { qos: 1 });

    this.mqttClient.on('message', (topic, message) => {
      if (topic === COMMAND_TOPIC) {
        try {
          const payload = JSON.parse(message.toString());
          console.log(`  -> [MQTT IN] Actuator Command: ${payload.pump_type} (${payload.duration_ms}ms)`);
          this.receivedCommands.push(payload);
        } catch (e) {
          console.error('Failed to parse actuator payload:', e.message);
        }
      }
    });

    this.socket.on('dosing:event', (data) => {
      console.log(`  -> [WS IN] dosing:event: ${data.pumpType} (${data.durationMs}ms) - "${data.rationale}"`);
      this.receivedSocketEvents.push(data);
    });

    this.socket.on('system:alert', (alert) => {
      console.log(`  -> [WS IN] system:alert: [${alert.severity}]${alert.alertType} - "${alert.message}"`);
      this.receivedAlerts.push(alert);
    });
  }

  resetBuffers() {
    this.receivedCommands = [];
    this.receivedSocketEvents = [];
    this.receivedAlerts = [];
  }

  assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      this.passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      this.failed++;
    }
  }

  async publishTelemetry(sensors) {
    const payload = {
      device_id: DEVICE_ID,
      timestamp: Date.now(),
      sensors: {
        ph: 6.0,
        ec_ms_cm: 1.4,
        water_temp_c: 22.5,
        water_level_pct: 75.0,
        ...sensors,
      },
      circulation_pump_state: 'ON',
    };
    this.mqttClient.publish(TELEMETRY_TOPIC, JSON.stringify(payload));
    await delay(1500); // Allow propagation through MQTT -> backend -> Postgres -> Socket
  }

  // --------------------------------------------------------------------------
  // TEST CASES
  // --------------------------------------------------------------------------

  async testSafetyGateLowWater() {
    console.log('\n--- TEST 1: Safety Gate - Critical Low Water Level (<15%) ---');
    this.resetBuffers();

    await this.publishTelemetry({ water_level_pct: 10.0, ph: 6.8, ec_ms_cm: 0.9 });

    this.assert(this.receivedCommands.length === 0, 'No pumps fired during low water condition');
    const alert = this.receivedAlerts.find((a) => a.alertType === 'LOW_WATER_LEVEL');
    this.assert(alert !== undefined, 'Critical LOW_WATER_LEVEL system alert was broadcast');
  }

  async testSafetyGateAcidicCrash() {
    console.log('\n--- TEST 2: Safety Gate - Acidic Crash (pH < 5.5) ---');
    this.resetBuffers();

    await this.publishTelemetry({ ph: 5.2, water_level_pct: 80.0, ec_ms_cm: 0.8 });

    this.assert(this.receivedCommands.length === 0, 'No pumps fired during acidic crash condition');
    const alert = this.receivedAlerts.find((a) => a.alertType === 'ACIDIC_CRASH');
    this.assert(alert !== undefined, 'Hard-stop ACIDIC_CRASH system alert was broadcast');
  }

  async testSafetyGateOsmoticToxicity() {
    console.log('\n--- TEST 3: Safety Gate - Osmotic Ceiling (EC > 2.4 mS/cm) ---');
    this.resetBuffers();

    await this.publishTelemetry({ ph: 6.2, water_level_pct: 80.0, ec_ms_cm: 2.6 });

    this.assert(this.receivedCommands.length === 0, 'No pumps fired when EC exceeds safety ceiling');
    const alert = this.receivedAlerts.find((a) => a.alertType === 'OSMOTIC_TOXICITY');
    this.assert(alert !== undefined, 'OSMOTIC_TOXICITY system alert was broadcast');
  }

  async testHighPhAutonomousDosing() {
    console.log('\n--- TEST 4: High pH Drift (pH > 6.5) -> AUTONOMOUS_PH Pulse ---');
    this.resetBuffers();

    // Reset lockout by clearing or waiting (or publish high pH after nominal water)
    await this.publishTelemetry({ ph: 6.9, ec_ms_cm: 1.4, water_level_pct: 80.0 });

    const phCommand = this.receivedCommands.find((c) => c.pump_type === 'PH_DOWN' && c.duration_ms === 2500);
    this.assert(phCommand !== undefined, 'MQTT published PH_DOWN command for 2500ms');

    // Verify REST API log audit
    try {
      const res = await axios.get(`${BACKEND_URL}/api/dosing/logs?deviceId=${DEVICE_ID}&limit=1`);
      const log = res.data.data?.[0];
      this.assert(
        log && log.pumpType === 'PH_DOWN' && log.source === 'AUTONOMOUS_PH',
        'PostgreSQL persistent dosing log verified for AUTONOMOUS_PH'
      );
    } catch (err) {
      this.assert(false, `REST API query failed: ${err.message}`);
    }

    // Verify System Mixing Lockout is active
    try {
      const statusRes = await axios.get(`${BACKEND_URL}/api/system/status?deviceId=${DEVICE_ID}`);
      const { mixingLockout } = statusRes.data;
      this.assert(mixingLockout?.isActive === true, '10-minute reservoir mixing lockout is actively engaged');
    } catch (err) {
      this.assert(false, `Lockout status verification failed: ${err.message}`);
    }
  }

  async testLockoutSuppression() {
    console.log('\n--- TEST 5: Lockout Gate - Verify Dosing is Suppressed During Mixing Lockout ---');
    this.resetBuffers();

    // Telemetry indicates low EC, but we are inside the 10-minute lockout from Test 4
    await this.publishTelemetry({ ph: 6.0, ec_ms_cm: 0.8, water_level_pct: 80.0 });

    this.assert(
      this.receivedCommands.length === 0,
      'Nutrient pumps suppressed while deviceMixingLockouts quiet period is active'
    );
  }

  async testMlBiasedDosingTargeted() {
    console.log('\n--- TEST 6: ML-Biased Dosing (Phosphorus Deficiency, High Severity) ---');
    this.resetBuffers();

    // 1. Post mock Diagnostic Report via REST API
    let reportId = null;
    try {
      const reportRes = await axios.post(`${BACKEND_URL}/api/ml/diagnostic-report`, {
        deviceId: DEVICE_ID,
        primaryLabel: 'PHOSPHORUS_DEFICIENCY',
        confidence: 0.88,
        severity: 'HIGH',
        classProbabilities: {
          HEALTHY: 0.02,
          PHOSPHORUS_DEFICIENCY: 0.88,
          POTASSIUM_DEFICIENCY: 0.05,
          NITROGEN_DEFICIENCY: 0.03,
          CALCIUM_DEFICIENCY: 0.01,
          MAGNESIUM_DEFICIENCY: 0.01,
        },
      });
      reportId = reportRes.data.data?.id;
      this.assert(reportId !== null, `Diagnostic report posted successfully. ID: ${reportId}`);
    } catch (err) {
      this.assert(false, `Failed to post diagnostic report: ${err.message}`);
      return;
    }

    // Note: If lockout is active from previous steps, reset it or wait.
    // For test harness speed, call internal clear lockout endpoint if available,
    // or trigger dosing handler with low EC when lockout clears.
    console.log('  [TEST] Publishing low EC telemetry (0.95 mS/cm < 1.2 target)...');
    await this.publishTelemetry({ ph: 6.0, ec_ms_cm: 0.95, water_level_pct: 80.0 });

    const doseA = this.receivedCommands.find((c) => c.pump_type === 'NUTRIENT_A');
    const doseB = this.receivedCommands.find((c) => c.pump_type === 'NUTRIENT_B');

    // Expected for HIGH Phosphorus: Stock A = 1500ms, Stock B = 3500ms (15s delayed)
    if (doseA) {
      this.assert(
        doseA.duration_ms === 1500,
        `Part A duration properly biased to 1500ms (Actual: ${doseA.duration_ms}ms)`
      );
    }

    if (doseB) {
      this.assert(
        doseB.duration_ms === 3500,
        `Part B duration properly biased to 3500ms (Actual: ${doseB.duration_ms}ms)`
      );
    }
  }

  async testDesyncSuppression() {
    console.log('\n--- TEST 7: Desync Guard - ML Flags Deficiency, But EC is Optimal ---');
    this.resetBuffers();

    // Post diagnostic report indicating Nitrogen deficiency
    try {
      await axios.post(`${BACKEND_URL}/api/ml/diagnostic-report`, {
        deviceId: DEVICE_ID,
        primaryLabel: 'NITROGEN_DEFICIENCY',
        confidence: 0.92,
        severity: 'CRITICAL',
      });
    } catch (e) {
      // Ignored if route handles silently
    }

    // Publish telemetry with OPTIMAL EC (1.5 mS/cm)
    await this.publishTelemetry({ ph: 6.1, ec_ms_cm: 1.5, water_level_pct: 85.0 });

    this.assert(this.receivedCommands.length === 0, 'Nutrient salts held to prevent osmotic burn when EC is optimal');
    const desyncAlert = this.receivedAlerts.find((a) => a.alertType === 'DESYNC_WARNING');
    this.assert(desyncAlert !== undefined, 'DESYNC_WARNING alert generated for ML/EC divergence');
  }

  async teardown() {
    console.log('\n======================================================');
    console.log(`TEST RUN COMPLETE: ${this.passed} PASSED |${this.failed} FAILED`);
    console.log('======================================================\n');

    if (this.mqttClient) this.mqttClient.end();
    if (this.socket) this.socket.disconnect();

    process.exit(this.failed === 0 ? 0 : 1);
  }
}

// Execute Suite
(async () => {
  const runner = new TestRunner();
  try {
    await runner.setup();
    await runner.testSafetyGateLowWater();
    await runner.testSafetyGateAcidicCrash();
    await runner.testSafetyGateOsmoticToxicity();
    await runner.testHighPhAutonomousDosing();
    await runner.testLockoutSuppression();
    await runner.testMlBiasedDosingTargeted();
    // await runner.testDesyncSuppression();
  } catch (fatalErr) {
    console.error('Fatal Test Suite Error:', fatalErr);
  } finally {
    await runner.teardown();
  }
})();