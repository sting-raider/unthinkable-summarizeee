'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, FileText } from 'lucide-react';

interface ExtractedTextPreviewProps {
  text: string;
  wordCount: number;
}

export function ExtractedTextPreview({ text, wordCount }: ExtractedTextPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="w-full overflow-hidden border-y border-[var(--ink)] bg-[var(--paper-bright)]">
      <div className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group flex flex-1 items-center justify-between gap-4 text-left"
          aria-expanded={isOpen}
        >
          <div className="flex min-w-0 items-center gap-3">
            <FileText className="h-4 w-4 shrink-0 text-[var(--cobalt)]" strokeWidth={1.5} />
            <div className="min-w-0">
              <span className="block font-editorial text-xl font-semibold">Extracted source text</span>
              <span className="mt-0.5 block font-utility text-[9px] uppercase tracking-[0.1em] text-[var(--muted)]">
                {wordCount.toLocaleString()} words / {text.length.toLocaleString()} characters
              </span>
            </div>
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
        </button>

        {isOpen && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 self-end border-b border-[var(--ink)] py-1 font-utility text-[9px] uppercase tracking-[0.1em] hover:text-[var(--cobalt)] sm:self-auto"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-[var(--cobalt)]" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{isCopied ? 'Text copied' : 'Copy text'}</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="border-t border-[var(--rule)] bg-[var(--paper)] p-4 sm:p-5">
          <div className="max-h-80 select-text overflow-y-auto whitespace-pre-wrap border-l-2 border-[var(--cobalt)] bg-white p-5 font-mono text-xs leading-6 text-[var(--muted)]">
            {text}
          </div>
        </div>
      )}
    </div>
  );
}
