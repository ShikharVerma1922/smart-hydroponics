'use client';

import { useState, useEffect } from 'react';
import { X, Download, RefreshCw } from 'lucide-react';
import { visionAPI, getUploadUrl } from '@/lib/api';
import { format, formatDistanceToNow } from 'date-fns';

const SEVERITY_COLORS = {
  HIGH: 'var(--accent-red)',
  MODERATE: 'var(--accent-amber)',
  LOW: 'var(--accent-cyan)',
  NONE: 'var(--accent-green)',
};

const LABEL_BADGE_COLORS = {
  NITROGEN_DEFICIENCY: { bg: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' },
  POTASSIUM_DEFICIENCY: { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' },
  PHOSPHORUS_DEFICIENCY: { bg: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d' },
  HEALTHY: { bg: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7' },
};

export default function ArchiveModal({ isOpen, onClose, deviceId }) {
  const [scans, setScans] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalScans, setTotalScans] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    visionAPI.getHistory(deviceId, 1, 20).then((res) => {
      setScans(res.data || []);
      setTotalScans(res.pagination?.total || 0);
      if (res.data?.length > 0) setSelectedScan(res.data[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isOpen, deviceId]);

  if (!isOpen) return null;

  const formatLabel = (label) =>
    label?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Unknown';

  const getBadgeStyle = (label) => LABEL_BADGE_COLORS[label] || LABEL_BADGE_COLORS.HEALTHY;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} id="archive-modal">
        {/* Header */}
        <div className="modal__header">
          <div>
            <div className="modal__title">Canopy Diagnostic Archive & ML Metadata</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
              <span className="pill pill--latency">Total Scans: {totalScans}</span>
              {selectedScan && (
                <>
                  <span className="pill pill--latency">
                    Current Health State: Resolving {formatLabel(selectedScan.primaryLabel)}
                  </span>
                  <span className="pill pill--latency">
                    Model Version: YOLOv9c-Lettuce (ayberkgezer)
                  </span>
                  <span className="pill pill--latency">
                    Last Scan: {formatDistanceToNow(new Date(selectedScan.timestamp), { addSuffix: true })}
                  </span>
                </>
              )}
            </div>
          </div>
          <button className="modal__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal__body">
          {loading ? (
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <div style={{ flex: '0 0 300px' }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton" style={{ height: 80, marginBottom: 8, borderRadius: 6 }} />
                ))}
              </div>
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: '100%', height: 200, marginBottom: 16, borderRadius: 8 }} />
                <div className="skeleton" style={{ width: '60%', height: 16, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '80%', height: 16 }} />
              </div>
            </div>
          ) : (
            <div className="archive-layout">
              {/* Left: Timeline */}
              <div className="archive-timeline">
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  Historical Scan Timeline
                </div>
                {scans.map((scan, i) => {
                  const isActive = selectedScan?.id === scan.id;
                  const badgeStyle = getBadgeStyle(scan.primaryLabel);
                  const scanNumber = totalScans - i;

                  return (
                    <div
                      key={scan.id}
                      className={`scan-card ${isActive ? 'scan-card--active' : ''}`}
                      onClick={() => setSelectedScan(scan)}
                    >
                      <div className="scan-card__title">
                        Scan #{scanNumber} — {format(new Date(scan.timestamp), 'MMM dd')}
                        {' '}({format(new Date(scan.timestamp), 'HH:mm')})
                      </div>
                      <span
                        className="scan-card__badge"
                        style={{ background: badgeStyle.bg, color: badgeStyle.color }}
                      >
                        {formatLabel(scan.primaryLabel)} ({(scan.confidence * 100).toFixed(1)}%)
                      </span>
                      <div className="scan-card__meta">
                        Confidence: {scan.confidence?.toFixed(3)} | Severity: {scan.severity || 'Unknown'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right: Detail Inspector */}
              <div className="archive-detail">
                {selectedScan ? (
                  <>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                      Selected Scan Deep Metadata Inspector
                    </div>

                   {selectedScan.imageUrl && (
  <img
    className="archive-detail__image"
    src={getUploadUrl(selectedScan.imageUrl)}
    alt="Canopy scan"
    style={{
      width: '100%',
      height: 'auto',
      maxHeight: '420px',
      objectFit: 'contain',
      display: 'block',
      background: 'var(--bg-input)',
      borderRadius: 8,
    }}
  />
)}
                    <div className="archive-detail__section">
                      <div className="archive-detail__section-title">Inference Performance Metadata</div>
                      <div className="archive-detail__meta-grid">
                        <div>Inference Latency: <strong style={{ color: 'var(--text-primary)' }}>42ms</strong></div>
                        <div>Image Resolution: <strong style={{ color: 'var(--text-primary)' }}>1920x1080 (Cloudinary CDN)</strong></div>
                        <div>
                          Model Output Vector:{' '}
                          <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                            {selectedScan.classProbabilities
                              ? `[${Object.entries(selectedScan.classProbabilities)
                                  .map(([k, v]) => `${k.charAt(0)}: ${parseFloat(v).toFixed(3)}`)
                                  .join(', ')}]`
                              : '—'}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="archive-detail__section">
                      <div className="archive-detail__section-title">Remediation Decision Log</div>
                      <div className="archive-detail__meta-grid">
                        <div>Linked Agronomic Trigger: <strong style={{ color: 'var(--text-primary)' }}>{selectedScan.actionTaken || '—'}</strong></div>
                        <div>
                          Execution Status:{' '}
                          <strong style={{ color: 'var(--text-primary)' }}>
                            {selectedScan.dosingEvents?.length > 0
                              ? `Dosed on ${format(new Date(selectedScan.dosingEvents[0].timestamp), 'yyyy-MM-dd HH:mm')} (Duration: ${selectedScan.dosingEvents[0].durationMs}ms)`
                              : 'Pending evaluation'}
                          </strong>
                        </div>
                        {selectedScan.cooldownActiveTill && (
                          <div>
                            Foliar Lockout Enforced:{' '}
                            <strong style={{ color: 'var(--accent-amber)' }}>
                              48-Hour Recovery Window ({formatDistanceToNow(new Date(selectedScan.cooldownActiveTill))} remaining)
                            </strong>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                      <button className="btn btn--outline">
                        <Download size={14} /> Download Annotated Frame
                      </button>
                      <button className="btn btn--ghost">
                        <RefreshCw size={14} /> Re-run Inference
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>
                    Select a scan from the timeline
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
