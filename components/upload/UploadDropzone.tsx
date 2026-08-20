'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { ArrowDown, FileText, Image as ImageIcon, Sparkles, ShieldCheck } from 'lucide-react';
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
        className={`group relative min-h-[410px] cursor-pointer overflow-hidden border p-6 transition-all duration-200 focus:outline-none sm:p-8 ${
          isDragOver
            ? 'border-[var(--cobalt)] bg-blue-50'
            : 'border-[var(--ink)] bg-[var(--paper-bright)] hover:bg-white'
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

        <div className="flex items-start justify-between border-b border-[var(--ink)] pb-4">
          <span className="font-utility text-[10px] uppercase tracking-[0.2em]">New source</span>
          <span className="font-editorial text-3xl italic text-[var(--oxblood)]">01</span>
        </div>

        <div className="flex min-h-[250px] flex-col justify-between py-7">
          <ArrowDown
            className={`h-14 w-14 transition-all duration-300 group-hover:translate-y-1 ${isDragOver ? 'text-[var(--cobalt)]' : 'text-[var(--ink)]'}`}
            strokeWidth={1}
          />
          <div>
            <h3 className="max-w-sm font-editorial text-4xl font-medium leading-[0.95] sm:text-5xl">
              Drop a document into the reading desk.
            </h3>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--muted)]">
              Drag it here or <span className="border-b border-[var(--cobalt)] text-[var(--cobalt)]">choose a file</span> from your device.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--rule)] pt-4 font-utility text-[9px] uppercase tracking-[0.12em] text-[var(--muted)]">
          <span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-[var(--oxblood)]" /> PDF</span>
          <span className="inline-flex items-center gap-1.5"><ImageIcon className="h-3.5 w-3.5 text-[var(--cobalt)]" /> PNG / JPG / WebP</span>
          <span className="ml-auto">Max {MAX_FILE_SIZE_MB}MB</span>
        </div>
      </div>

      {onSelectSample && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rule)] pb-4 text-xs text-[var(--muted)]">
          <span>No document at hand?</span>
          <button
            type="button"
            onClick={() => onSelectSample('sample-doc')}
            className="inline-flex items-center gap-1.5 font-utility text-[9px] uppercase tracking-[0.12em] text-[var(--cobalt)] hover:underline"
          >
            <Sparkles className="h-3 w-3" /> Open the sample article
          </button>
        </div>
      )}

      <div className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-[var(--muted)]">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cobalt)]" />
        <span>Original files stay in this browser. Only extracted text moves to summarization.</span>
      </div>
    </div>
  );
}
