'use client';

import React from 'react';
import { Loader2, Cpu, Scan, FileSearch } from 'lucide-react';
import { ProcessingStage, OCRProgressInfo } from '@/types/document';

interface ProcessingStatusProps {
  stage: ProcessingStage;
  ocrProgress?: OCRProgressInfo | null;
  pdfProgress?: { current: number; total: number } | null;
}

export function ProcessingStatus({ stage, ocrProgress, pdfProgress }: ProcessingStatusProps) {
  if (stage === 'idle' || stage === 'complete' || stage === 'error') {
    return null;
  }

  const getStageDetails = () => {
    switch (stage) {
      case 'extracting':
        return {
          icon: <FileSearch className="h-6 w-6 text-blue-600 animate-pulse" />,
          title: 'Extracting PDF Content',
          description: pdfProgress
            ? `Extracting text from page ${pdfProgress.current} of ${pdfProgress.total}...`
            : 'Parsing document structure and embedded text...',
          showBar: Boolean(pdfProgress),
          percentage: pdfProgress ? Math.round((pdfProgress.current / pdfProgress.total) * 100) : 0,
        };
      case 'ocr':
        return {
          icon: <Scan className="h-6 w-6 text-indigo-600 animate-pulse" />,
          title: 'Optical Character Recognition (OCR)',
          description: ocrProgress?.status || 'Analyzing image characters client-side...',
          showBar: true,
          percentage: ocrProgress?.progress || 0,
        };
      case 'summarizing':
        return {
          icon: <Cpu className="h-6 w-6 text-purple-600 animate-spin" />,
          title: 'DeepSeek AI Summarization',
          description: 'Analyzing document themes, extracting key points, and synthesizing summary...',
          showBar: false,
          percentage: 0,
        };
      default:
        return {
          icon: <Loader2 className="h-6 w-6 text-zinc-600 animate-spin" />,
          title: 'Processing Document',
          description: 'Please wait a moment...',
          showBar: false,
          percentage: 0,
        };
    }
  };

  const details = getStageDetails();

  return (
    <div
      aria-live="polite"
      className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
          {details.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {details.title}
            </h4>
            {details.showBar && (
              <span className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400">
                {details.percentage}%
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {details.description}
          </p>

          {details.showBar && (
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-out"
                style={{ width: `${Math.max(5, details.percentage)}%` }}
              />
            </div>
          )}

          {!details.showBar && (
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-indeterminate" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
