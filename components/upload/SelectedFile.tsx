'use client';

import React from 'react';
import { FileText, Image as ImageIcon, Trash2, RefreshCw, BookOpen, Layers } from 'lucide-react';
import { ExtractedDocument } from '@/types/document';
import { formatBytes } from '@/lib/validation/validateFile';
import { Badge } from '@/components/ui/Badge';

interface SelectedFileProps {
  document: ExtractedDocument;
  onRemove: () => void;
  onReplace: () => void;
  disabled?: boolean;
}

export function SelectedFile({ document, onRemove, onReplace, disabled = false }: SelectedFileProps) {
  const isPdf = document.fileName.toLowerCase().endsWith('.pdf') || document.fileType.includes('pdf');

  return (
    <div className="paper-panel w-full p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between border-b border-[var(--ink)] pb-3">
        <span className="font-utility text-[10px] uppercase tracking-[0.18em] text-[var(--oxblood)]">Source selected</span>
        <Badge variant={isPdf ? 'primary' : 'secondary'}>{isPdf ? 'PDF' : 'IMAGE OCR'}</Badge>
      </div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="flex items-start gap-3.5">
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center border ${isPdf ? 'border-[var(--oxblood)] text-[var(--oxblood)]' : 'border-[var(--cobalt)] text-[var(--cobalt)]'}`}
          >
            {isPdf ? <FileText className="h-5 w-5" strokeWidth={1.5} /> : <ImageIcon className="h-5 w-5" strokeWidth={1.5} />}
          </div>

          <div className="min-w-0">
            <div>
              <h4 className="max-w-xs truncate font-editorial text-2xl font-semibold leading-tight sm:max-w-xl sm:text-3xl">
                {document.fileName}
              </h4>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-utility text-[9px] uppercase tracking-[0.1em] text-[var(--muted)]">
              <span>{formatBytes(document.fileSizeBytes)}</span>
              {typeof document.pageCount === 'number' && (
                <>
                  <span className="inline-flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    {document.pageCount} {document.pageCount === 1 ? 'page' : 'pages'}
                  </span>
                </>
              )}
              <span className="inline-flex items-center gap-1 text-[var(--ink)]">
                <BookOpen className="h-3 w-3" />
                {document.wordCount.toLocaleString()} words
              </span>
              <span>~{document.readingTimeMinutes} min read</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end">
          <button
            type="button"
            onClick={onReplace}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 border-b border-[var(--ink)] py-1 font-utility text-[9px] uppercase tracking-[0.1em] transition hover:text-[var(--cobalt)] disabled:opacity-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Replace
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 border-b border-[var(--oxblood)] py-1 font-utility text-[9px] uppercase tracking-[0.1em] text-[var(--oxblood)] transition hover:text-red-900 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
