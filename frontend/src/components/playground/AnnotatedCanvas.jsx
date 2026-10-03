'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * @typedef {Object} CanvasSummary
 * @property {string} label
 * @property {number} confidence
 * @property {readonly ClassProbability[]} probabilities
 */

/**
 * @typedef {Object} Props
 * @property {string | null} imageUrl
 * @property {readonly InferenceDetection[]} detections - Bounding boxes, if the model returns any (the current classifier does not).
 * @property {CanvasSummary | null} summary - Classification overlay: top label, confidence and the top class probabilities.
 */

function labelColor(label) {
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  return `hsl(${hash % 360} 85% 60%)`;
}

function prettify(label) {
  return label.replace(/_/g, ' ');
}

function drawSummary(ctx, width, height, s) {
  // Top-left badge: primary label + confidence
  const text = `${prettify(s.label)}  ${(s.confidence * 100).toFixed(0)}%`;
  ctx.font = '700 14px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  const badgeW = ctx.measureText(text).width + 22;
  ctx.fillStyle = 'rgba(2, 6, 23, 0.82)';
  ctx.fillRect(10, 10, badgeW, 28);
  ctx.fillStyle = labelColor(s.label);
  ctx.fillRect(10, 10, 4, 28);
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(text, 22, 24);

  // Bottom-left: top-3 class probabilities as bars
  const rows = s.probabilities.slice(0, 3);
  if (rows.length === 0) return;
  const rowH = 18;
  const panelW = Math.min(260, width - 20);
  const panelH = rows.length * rowH + 10;
  const x0 = 10;
  const y0 = height - panelH - 10;

  ctx.fillStyle = 'rgba(2, 6, 23, 0.82)';
  ctx.fillRect(x0, y0, panelW, panelH);
  ctx.font = '11px system-ui, sans-serif';

  rows.forEach((row, i) => {
    const y = y0 + 5 + i * rowH;
    const barW = panelW - 16;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x0 + 8, y + 2, barW, rowH - 4);
    ctx.globalAlpha = 0.65;
    ctx.fillStyle = labelColor(row.label);
    ctx.fillRect(x0 + 8, y + 2, barW * row.probability, rowH - 4);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(`${prettify(row.rawLabel)}  ${(row.probability * 100).toFixed(0)}%`, x0 + 12, y + rowH / 2);
  });
}

export function AnnotatedCanvas({ imageUrl, detections, summary }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [width, setWidth] = useState(0);

  // Load the image whenever the URL changes
  useEffect(() => {
    if (!imageUrl) {
      setImage(null);
      return;
    }
    let cancelled = false;
    const el = new Image();
    el.onload = () => {
      if (!cancelled) setImage(el);
    };
    el.src = imageUrl;
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  // Track container width so the canvas stays responsive
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    setWidth(Math.floor(node.clientWidth));
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(Math.floor(w));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Draw image + annotations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image || width === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const scale = width / image.naturalWidth;
    const height = Math.round(image.naturalHeight * scale);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.drawImage(image, 0, 0, width, height);

    // Bounding boxes (only if the model supplies them)
    ctx.font = '600 12px system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    for (const det of detections) {
      const sx = det.normalized ? image.naturalWidth : 1;
      const sy = det.normalized ? image.naturalHeight : 1;
      const x1 = det.box.x1 * sx * scale;
      const y1 = det.box.y1 * sy * scale;
      const x2 = det.box.x2 * sx * scale;
      const y2 = det.box.y2 * sy * scale;
      const color = labelColor(det.label);

      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      const text = `${prettify(det.label)} ${(det.confidence * 100).toFixed(0)}%`;
      const textWidth = ctx.measureText(text).width + 10;
      const tagHeight = 20;
      const tagY = y1 - tagHeight >= 0 ? y1 - tagHeight : y1;
      ctx.fillStyle = color;
      ctx.fillRect(x1, tagY, textWidth, tagHeight);
      ctx.fillStyle = '#0b1220';
      ctx.fillText(text, x1 + 5, tagY + tagHeight / 2);
    }

    if (summary) drawSummary(ctx, width, height, summary);
  }, [image, detections, summary, width]);

  return (
    <div ref={containerRef} className="w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
      {image ? (
        <canvas ref={canvasRef} className="block" aria-label="Annotated canopy image" />
      ) : (
        <div className="flex h-56 items-center justify-center text-sm text-slate-500">
          Select a sample or drop an image to begin
        </div>
      )}
    </div>
  );
}
