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
          icon: <FileSearch className="h-6 w-6 text-[var(--cobalt)] animate-pulse" />,
          title: 'Reading the PDF',
          description: pdfProgress
            ? `Extracting text from page ${pdfProgress.current} of ${pdfProgress.total}...`
            : 'Parsing document structure and embedded text...',
          showBar: Boolean(pdfProgress),
          percentage: pdfProgress ? Math.round((pdfProgress.current / pdfProgress.total) * 100) : 0,
        };
      case 'ocr':
        return {
          icon: <Scan className="h-6 w-6 text-[var(--cobalt)] animate-pulse" />,
          title: 'Reading the image',
          description: ocrProgress?.status || 'Analyzing image characters client-side...',
          showBar: true,
          percentage: ocrProgress?.progress || 0,
        };
      case 'summarizing':
        return {
          icon: <Cpu className="h-6 w-6 text-[var(--oxblood)] animate-spin" />,
          title: 'Composing the brief',
          description: 'Finding the argument, essential details, and key takeaways...',
          showBar: false,
          percentage: 0,
        };
      default:
        return {
          icon: <Loader2 className="h-6 w-6 text-[var(--ink)] animate-spin" />,
          title: 'Working through the document',
          description: 'This should only take a moment.',
          showBar: false,
          percentage: 0,
        };
    }
  };

  const details = getStageDetails();

  return (
    <div
      aria-live="polite"
      className="paper-panel editorial-reveal w-full p-5 sm:p-6"
    >
      <div className="mb-5 flex items-center justify-between border-b border-[var(--ink)] pb-3">
        <span className="font-utility text-[10px] uppercase tracking-[0.18em] text-[var(--oxblood)]">In production</span>
        {details.showBar && <span className="font-utility text-[10px]">{details.percentage}%</span>}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border border-[var(--rule)] bg-[var(--paper)]">
          {details.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-editorial text-2xl font-semibold leading-none">
              {details.title}
            </h4>
          </div>
          <p className="mt-2 truncate text-xs text-[var(--muted)]">
            {details.description}
          </p>

          {details.showBar && (
            <div className="mt-4 h-1 w-full overflow-hidden bg-[var(--rule)]">
              <div
                className="h-full bg-[var(--cobalt)] transition-all duration-300 ease-out"
                style={{ width: `${Math.max(5, details.percentage)}%` }}
              />
            </div>
          )}

          {!details.showBar && (
            <div className="mt-4 h-1 w-full overflow-hidden bg-[var(--rule)]">
              <div className="animate-indeterminate h-full w-1/3 bg-[var(--oxblood)]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
