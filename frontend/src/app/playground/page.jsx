'use client';

import { DecisionFlowchart } from '@/components/playground/DecisionFlowchart';
import { DiagnosticsWorkbench } from '@/components/playground/DiagnosticsWorkbench';
import { DigitalTwin } from '@/components/playground/DigitalTwin';
import { EventLog } from '@/components/playground/EventLog';
import { ScenarioButtons } from '@/components/playground/ScenarioButtons';
import { TelemetryPanel } from '@/components/playground/TelemetryPanel';
import { useSimulator } from '@/hooks/useSimulator';
import { SCENARIOS } from '@/lib/playground/scenarios';

export default function PlaygroundPage() {
  const sim = useSimulator();

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-slate-100 lg:p-6">
      <header className="mb-5">
        <h1 className="text-2xl font-semibold">Hydroponics Playground</h1>
        {/* <p className="mt-1 max-w-3xl text-sm text-slate-400">
          Isolated simulation harness: nothing here reads or writes the database. Hardware sync publishes only to the
          <code className="mx-1 rounded bg-slate-800 px-1.5 py-0.5 text-xs">hydro/playground/*</code>
          topics, which production devices never subscribe to.
        </p> */}
        {sim.report ? (
          <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-violet-500/10 px-3 py-1 text-xs text-violet-200">
            Active ML report: {sim.report.label.replace(/_/g, ' ')} ({sim.report.severity},{' '}
            {(sim.report.confidence * 100).toFixed(0)}%) · source: {sim.report.source}
          </p>
        ) : null}
      </header>

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <TelemetryPanel
            sensors={sim.sensors}
            targets={sim.targets}
            lockoutSeconds={sim.lockoutSeconds}
            autoEvaluate={sim.autoEvaluate}
            onSensorChange={sim.setSensors}
            onTargetsChange={sim.setTargets}
            onLockoutSecondsChange={sim.setLockoutSeconds}
            onAutoEvaluateChange={sim.setAutoEvaluate}
            onEvaluateNow={sim.evaluateNow}
            onClearLockout={sim.clearLockout}
            onReset={sim.resetAll}
          />
          <ScenarioButtons scenarios={SCENARIOS} onApply={sim.applyScenario} />
        </div>

        <DecisionFlowchart
          result={sim.result}
          lockoutRemainingMs={sim.lockoutRemainingMs}
          lockoutTotalMs={sim.lockoutSeconds * 1000}
          reportCooldownRemainingMs={sim.reportCooldownRemainingMs}
        />

        <div className="space-y-4">
          <DigitalTwin
            sensors={sim.sensors}
            actuators={sim.actuators}
            hardwareSync={sim.hardwareSync}
            bridge={sim.bridge}
            onHardwareSyncChange={sim.setHardwareSync}
            onToggleCirculation={sim.setCirculationOn}
            onManualPulse={sim.manualPulse}
            onStopAll={sim.stopAllActuators}
          />
          <EventLog events={sim.events} />
        </div>
      </div>

      <div className="mt-4">
        <DiagnosticsWorkbench reportCooldownRemainingMs={sim.reportCooldownRemainingMs} onReport={sim.injectReport} />
      </div>
    </main>
  );
}
