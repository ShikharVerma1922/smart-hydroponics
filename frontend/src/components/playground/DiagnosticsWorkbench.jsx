'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { describeError, playgroundApi } from '@/lib/playground/api';
import { loadPresetFile, SAMPLE_PRESETS } from '@/lib/playground/presets';
import { AnnotatedCanvas } from './AnnotatedCanvas';
import { ImageDropzone } from './ImageDropzone';
import { PresetGallery } from './PresetGallery';
import { RemediationCard } from './RemediationCard';

/**
 * @typedef {Object} SelectedImage
 * @property {File} file
 * @property {string} url
 * @property {string} name
 * @property {string | null} presetId
 * @property {boolean} isPlaceholder
 */

const MOCK_OPTIONS = [
  { value: '', label: 'None (show an error if the ML service is down)' },
  { value: 'HEALTHY', label: 'HEALTHY' },
  { value: 'NITROGEN_DEFICIENCY', label: 'NITROGEN_DEFICIENCY' },
  { value: 'PHOSPHORUS_DEFICIENCY', label: 'PHOSPHORUS_DEFICIENCY' },
  { value: 'POTASSIUM_DEFICIENCY', label: 'POTASSIUM_DEFICIENCY' },
  { value: 'CALCIUM_DEFICIENCY', label: 'CALCIUM_DEFICIENCY' },
  { value: 'MAGNESIUM_DEFICIENCY', label: 'MAGNESIUM_DEFICIENCY' },
  { value: 'IRON_DEFICIENCY', label: 'IRON_DEFICIENCY' },
  { value: 'BIOTIC_STRESS', label: 'BIOTIC_STRESS' },
];

/**
 * @typedef {Object} Props
 * @property {number} reportCooldownRemainingMs
 * @property {(spec: ReportSpec) => void} onReport
 */

export function DiagnosticsWorkbench({ reportCooldownRemainingMs, onReport }) {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loadingPreset, setLoadingPreset] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [mockLabel, setMockLabel] = useState('');
  const urlRef = useRef(null);

  // Release the object URL when the component unmounts
  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const setSelected = useCallback((file, presetId, isPlaceholder) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    setImage({ file, url, name: file.name, presetId, isPlaceholder });
    setResult(null);
    setError(null);
  }, []);

  const handlePreset = useCallback(
    async (preset) => {
      setLoadingPreset(preset.id);
      try {
        const loaded = await loadPresetFile(preset);
        setSelected(loaded.file, preset.id, loaded.isPlaceholder);
      } catch (err) {
        setError(describeError(err));
      } finally {
        setLoadingPreset(null);
      }
    },
    [setSelected],
  );

  const runDiagnosis = useCallback(async () => {
    if (!image) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await playgroundApi.infer(image.file, mockLabel === '' ? undefined : mockLabel);
      setResult(res);
      // Feed the diagnosis straight into the decision engine, exactly like a stored report would be.
      onReport({ label: res.primaryLabel, severity: res.severity, confidence: res.confidence });
    } catch (err) {
      setResult(null);
      setError(describeError(err));
    } finally {
      setAnalyzing(false);
    }
  }, [image, mockLabel, onReport]);

  // Memoized so the canvas only redraws when the result actually changes
  const summary = useMemo(
    () =>
      result
        ? {
            label: result.primaryLabel === 'UNKNOWN' ? result.rawPrimaryLabel : result.primaryLabel,
            confidence: result.confidence,
            probabilities: result.classProbabilities,
          }
        : null,
    [result],
  );

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Canopy diagnostics workbench</h2>
        <span className="text-xs text-slate-500">No database: images stay in the browser and the inference proxy</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <PresetGallery
            presets={SAMPLE_PRESETS}
            loadingId={loadingPreset}
            selectedId={image?.presetId ?? null}
            disabled={analyzing}
            onSelect={(p) => void handlePreset(p)}
          />
          <ImageDropzone disabled={analyzing} onFile={(file) => setSelected(file, null, false)} />

          <label className="block text-xs text-slate-400">
            If the ML service is offline, use mock label
            <select
              value={mockLabel}
              onChange={(e) => setMockLabel(e.target.value)}
              disabled={analyzing}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-200"
            >
              {MOCK_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!image || analyzing}
              onClick={() => void runDiagnosis()}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {analyzing ? 'Analysing…' : 'Run diagnosis'}
            </button>
            {image ? <span className="truncate text-xs text-slate-400">{image.name}</span> : null}
          </div>

          {image?.isPlaceholder ? (
            <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              This is a generated placeholder because no photo exists at the preset path. The real model&apos;s canopy
              pre-filter will most likely reject it (HTTP 422). Add real photos under public/playground/samples/.
            </p>
          ) : null}
          {error ? (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</p>
          ) : null}
        </div>

        <div className="space-y-3">
          <AnnotatedCanvas imageUrl={image?.url ?? null} detections={result?.detections ?? []} summary={summary} />

          {result ? (
            <>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                {result.mocked ? (
                  <span className="rounded bg-amber-500/15 px-2 py-0.5 font-medium text-amber-300">
                    Mocked result: ML service unreachable
                  </span>
                ) : (
                  <span>Inference latency {result.latencyMs} ms</span>
                )}
                {result.primaryLabel === 'UNKNOWN' ? <span>Model label: {result.rawPrimaryLabel}</span> : null}
              </div>
              <RemediationCard
                label={result.primaryLabel}
                severity={result.severity}
                confidence={result.confidence}
                severitySource={result.severitySource}
                cooldownRemainingMs={reportCooldownRemainingMs}
              />
            </>
          ) : (
            <p className="text-xs text-slate-500">Run a diagnosis to see the classification and a remediation plan.</p>
          )}
        </div>
      </div>
    </section>
  );
}
