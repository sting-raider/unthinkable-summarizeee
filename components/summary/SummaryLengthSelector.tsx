'use client';

import React from 'react';
import { SummaryLength } from '@/types/document';
import { AlignLeft, FileText, Zap } from 'lucide-react';

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
      label: 'Brief',
      target: '~100–150 words',
      icon: <Zap className="h-4 w-4" />,
      description: 'Quick snapshot & primary takeaway',
    },
    {
      id: 'medium',
      label: 'Standard',
      target: '~250–400 words',
      icon: <AlignLeft className="h-4 w-4" />,
      description: 'Balanced overview & core arguments',
    },
    {
      id: 'long',
      label: 'Extended',
      target: '~500–700 words',
      icon: <FileText className="h-4 w-4" />,
      description: 'Comprehensive analysis & deep context',
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-4 flex items-end justify-between gap-4">
        <label className="font-utility text-[10px] uppercase tracking-[0.18em] text-[var(--oxblood)]">
          Choose the edit
        </label>
        <span className="hidden text-xs text-[var(--muted)] sm:inline">How much context should the final brief keep?</span>
      </div>

      <div className="grid grid-cols-1 border border-[var(--ink)] sm:grid-cols-3">
        {options.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              disabled={disabled}
              className={`relative flex flex-col p-4 text-left transition-colors sm:min-h-32 ${
                isSelected
                  ? 'bg-[var(--cobalt)] text-white'
                  : 'bg-[var(--paper-bright)] hover:bg-white'
              } border-b border-[var(--ink)] last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 ${disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`inline-flex items-center gap-1.5 font-utility text-[9px] uppercase tracking-[0.12em] ${isSelected ? 'text-white' : 'text-[var(--ink)]'}`}
                >
                  {opt.icon}
                  {opt.label}
                </span>
                <span className={`font-utility text-[9px] ${isSelected ? 'text-blue-100' : 'text-[var(--muted)]'}`}>
                  {opt.target}
                </span>
              </div>
              <p className={`mt-auto pt-7 text-xs leading-5 ${isSelected ? 'text-blue-50' : 'text-[var(--muted)]'}`}>
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
