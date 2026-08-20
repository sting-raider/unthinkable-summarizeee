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
    <div className="w-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
              isPdf
                ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
            }`}
          >
            {isPdf ? <FileText className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 max-w-xs sm:max-w-md truncate">
                {document.fileName}
              </h4>
              <Badge variant={isPdf ? 'primary' : 'secondary'}>
                {isPdf ? 'PDF Document' : 'Image OCR'}
              </Badge>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              <span>{formatBytes(document.fileSizeBytes)}</span>
              <span>•</span>
              {typeof document.pageCount === 'number' && (
                <>
                  <span className="inline-flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    {document.pageCount} {document.pageCount === 1 ? 'page' : 'pages'}
                  </span>
                  <span>•</span>
                </>
              )}
              <span className="inline-flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                <BookOpen className="h-3 w-3" />
                {document.wordCount.toLocaleString()} words
              </span>
              <span>•</span>
              <span>~{document.readingTimeMinutes} min read</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={onReplace}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Replace
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
