'use client';

import React from 'react';
import { SummaryLength } from '@/types/document';
import { Sparkles, AlignLeft, FileText, Zap } from 'lucide-react';

interface SummaryLengthSelectorProps {
  value: SummaryLength;
  onChange: (length: SummaryLength) => void;
  disabled?: boolean;
}

export function SummaryLengthSelector({ value, onChange, disabled = false }: SummaryLengthSelectorProps) {
  const options: {
    id: SummaryLength;
    label: string;
    target: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      id: 'short',
      label: 'Short',
      target: '~100–150 words',
      icon: <Zap className="h-4 w-4" />,
      description: 'Quick snapshot & primary takeaway',
    },
    {
      id: 'medium',
      label: 'Medium',
      target: '~250–400 words',
      icon: <AlignLeft className="h-4 w-4" />,
      description: 'Balanced overview & core arguments',
    },
    {
      id: 'long',
      label: 'Long',
      target: '~500–700 words',
      icon: <FileText className="h-4 w-4" />,
      description: 'Comprehensive analysis & deep context',
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          Select Summary Detail Level
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              disabled={disabled}
              className={`flex flex-col text-left p-3.5 rounded-xl border transition-all duration-150 relative ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/30'
                  : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
              } ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                    isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-zinc-900 dark:text-zinc-100'
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </span>
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  {opt.target}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
