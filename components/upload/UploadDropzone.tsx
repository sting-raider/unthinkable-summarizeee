'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Sparkles, ShieldCheck } from 'lucide-react';
import { SUPPORTED_EXTENSIONS, MAX_FILE_SIZE_MB } from '@/lib/validation/validateFile';

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  onSelectSample?: (type: 'sample-doc' | 'sample-image') => void;
}

export function UploadDropzone({ onFileSelected, disabled = false, onSelectSample }: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileSelected(file);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileSelected(file);
      // Reset input value so the same file can be re-uploaded if replaced
      e.target.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload document or image file"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/70 dark:border-blue-400 dark:bg-blue-950/40 scale-[1.01]'
            : 'border-zinc-300 bg-zinc-50/50 hover:border-zinc-400 hover:bg-zinc-100/60 dark:border-zinc-700 dark:bg-zinc-900/40 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/40'
        } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={SUPPORTED_EXTENSIONS.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110 ${
            isDragOver
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
          }`}
        >
          <UploadCloud className="h-8 w-8" />
        </div>

        <h3 className="mt-5 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Upload your document or image
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
          Drag and drop your file here, or{' '}
          <span className="font-medium text-blue-600 hover:underline dark:text-blue-400">browse files</span>
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            <FileText className="h-3.5 w-3.5 text-red-500" /> PDF
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            <ImageIcon className="h-3.5 w-3.5 text-blue-500" /> PNG, JPG, JPEG, WebP
          </span>
          <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            Up to {MAX_FILE_SIZE_MB}MB
          </span>
        </div>
      </div>

      {/* Sample presets for fast testing */}
      {onSelectSample && (
        <div className="mt-4 flex items-center justify-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span>Need a sample to test?</span>
          <button
            type="button"
            onClick={() => onSelectSample('sample-doc')}
            className="font-medium text-blue-600 hover:underline dark:text-blue-400 inline-flex items-center gap-1"
          >
            <Sparkles className="h-3 w-3" /> Load Sample Article
          </button>
        </div>
      )}

      {/* Privacy Guarantee Note */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span>Client-side extraction: Your files never leave your browser. Only text is summarized.</span>
      </div>
    </div>
  );
}
