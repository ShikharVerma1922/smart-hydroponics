'use client';

import { useCallback, useRef, useState } from 'react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * @typedef {Object} Props
 * @property {boolean} [disabled]
 * @property {(file: File) => void} onFile
 */

export function ImageDropzone({ disabled = false, onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);

  const accept = useCallback(
    (file) => {
      if (!file) return;
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Use a JPEG, PNG or WebP image.');
        return;
      }
      if (file.size > MAX_BYTES) {
        setError(`Image is too large (max ${MAX_BYTES / (1024 * 1024)} MB).`);
        return;
      }
      setError(null);
      onFile(file);
    },
    [onFile],
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    accept(e.dataTransfer.files[0]);
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm transition ${
          dragging ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-700 hover:border-slate-500'
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <span className="font-medium text-slate-200">Drop a canopy photo here</span>
        <span className="mt-1 text-xs text-slate-500">or click to browse (JPEG, PNG, WebP, up to 8 MB)</span>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          onChange={(e) => {
            accept(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
      {error ? <p className="mt-1 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
