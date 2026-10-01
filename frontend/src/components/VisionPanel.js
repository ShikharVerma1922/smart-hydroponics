'use client';

import { useState, useRef } from 'react';
import { Upload, Microscope, Lock, ExternalLink } from 'lucide-react';
import { visionAPI } from '@/lib/api';

const DEFICIENCY_COLORS = {
  NITROGEN_DEFICIENCY: { bg: 'var(--accent-red-dim)', fill: 'linear-gradient(90deg, #f59e0b, #ef4444)' },
  POTASSIUM_DEFICIENCY: { bg: 'var(--accent-amber-dim)', fill: 'var(--accent-amber)' },
  PHOSPHORUS_DEFICIENCY: { bg: 'var(--accent-purple-dim)', fill: 'var(--accent-purple)' },
  HEALTHY: { bg: 'var(--accent-green-dim)', fill: 'var(--accent-green)' },
  CALCIUM_DEFICIENCY: { bg: 'var(--accent-cyan-dim)', fill: 'var(--accent-cyan)' },
};

export default function VisionPanel({ deviceId, latestReport, onOpenArchive, cooldown }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedReport, setAnalyzedReport] = useState(null);
  const report = analyzedReport || latestReport;
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    try {
      const result = await visionAPI.analyze(deviceId, selectedFile);
      setAnalyzedReport(result.data);
    } catch (err) {
      console.error('Vision analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Build probability list from report
  const probabilities = report?.classProbabilities
    ? Object.entries(report.classProbabilities)
        .map(([key, value]) => ({
          label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          key,
          value: parseFloat(value),
        }))
        .sort((a, b) => b.value - a.value)
    : [];

  const imageUrl = previewUrl || report?.imageUrl || null;

  const scanCount = report ? 14 : 0; // Placeholder; would come from history count

  return (
    <div className="card" id="vision-panel">
      <div className="card__title" style={{ marginBottom: '1rem' }}>
        Canopy Vision & Crop Health Diagnostics
      </div>

      <div className="vision-grid">
        {/* Left: Upload */}
        <div className="vision-upload">
          <div className="card__subtitle">Leaf Image Capture & Upload</div>
          <div className="vision-upload__preview" onClick={handleUpload}>
            {imageUrl ? (
              <img src={imageUrl} alt="Leaf capture" />
            ) : (
              <div className="vision-upload__placeholder">
                <Upload size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                <div>Click to upload leaf image</div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="leaf-upload-input"
          />
          <div className="vision-upload__actions">
            <button className="btn btn--outline" onClick={handleUpload} id="upload-photo-btn">
              <Upload size={14} />
              Upload New Leaf Photo
            </button>
            <button
              className="btn btn--success"
              onClick={handleAnalyze}
              disabled={!selectedFile || analyzing}
              id="run-diagnostic-btn"
            >
              <Microscope size={14} />
              {analyzing ? 'Analyzing...' : 'Run ML Diagnostic Scan'}
            </button>
          </div>
          <div className="vision-upload__hint">
            Supports JPG, PNG up to 10MB. Recommended resolution: 1080p top-down view.
          </div>
        </div>

        {/* Right: Inference Report */}
        <div className="inference-report">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card__subtitle">Model Inference Report</div>
            <button
              className="section-title__link"
              onClick={onOpenArchive}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
              id="open-archive-btn"
            >
              View Archive <ExternalLink size={11} />
            </button>
          </div>

          {report ? (
            <>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Latest Model Inference <span style={{ color: 'var(--text-secondary)' }}>
                  (PyTorch Model: ayberkgezer/lettuce-deficiency)
                </span>
              </div>

              <div className="inference-badges">
                <span className="badge badge--detection">
                  DETECTED: {report.primaryLabel?.replace(/_/g, ' ')}
                </span>
                <span className="badge badge--confidence">
                  Confidence: {(report.confidence * 100).toFixed(1)}%
                </span>
              </div>

              {/* Probability Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                {probabilities.slice(0, 4).map((p) => {
                  const pct = (p.value * 100).toFixed(1);
                  const isHigh = p.value > 0.5;
                  return (
                    <div key={p.key} className="prob-bar">
                      <div className="prob-bar__label">{p.label}</div>
                      <div className="prob-bar__track">
                        <div
                          className={`prob-bar__fill ${
                            isHigh ? 'prob-bar__fill--high' :
                            p.key === 'HEALTHY' ? 'prob-bar__fill--healthy' :
                            'prob-bar__fill--low'
                          }`}
                          style={{ width: `${Math.max(2, p.value * 100)}%` }}
                        />
                      </div>
                      <div className="prob-bar__value">{pct}%</div>
                    </div>
                  );
                })}
              </div>

              {/* Agronomic Insight */}
              {report.actionTaken && (
                <div className="insight-box insight-box--agronomic">
                  <strong>Agronomic Insight: </strong>
                  {report.actionTaken}
                </div>
              )}

             {/* Foliar Recovery Lock */}
{cooldown?.isActive && (
  <div className="insight-box insight-box--lock">
    <Lock
      size={16}
      style={{
        marginTop: 2,
        flexShrink: 0,
        color: 'var(--accent-amber)',
      }}
    />

    <div>
      <strong>Foliar Recovery Lock: </strong>
      <span className="accent">Active.</span>{' '}
      Previous intervention was{' '}
      <span className="accent">
        {cooldown.remainingHours
          ? `${(48 - cooldown.remainingHours).toFixed(0)}h`
          : '—'}
      </span>{' '}
      ago. New interventions are locked for{' '}
      <span className="accent">
        {cooldown.remainingHours
          ? `${Math.floor(cooldown.remainingHours)}h ${Math.round(
              (cooldown.remainingHours % 1) * 60
            )}m`
          : '—'}
      </span>
      .
    </div>
  </div>
)}
            </>
          ) : (
            <div style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>
              No diagnostic reports available. Upload a leaf image and run an ML scan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
