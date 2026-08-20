'use client';

import React from 'react';
import { CheckCircle2, Key } from 'lucide-react';

interface KeyPointsProps {
  points: string[];
}

export function KeyPoints({ points }: KeyPointsProps) {
  if (!points || points.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
          <Key className="h-3.5 w-3.5" />
        </div>
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Key Takeaways & Core Insights
        </h4>
      </div>

      <ul className="space-y-2.5">
        {points.map((point, idx) => (
          <li
            key={idx}
            className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 text-sm text-zinc-800 dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:text-zinc-200 transition hover:bg-zinc-100/60 dark:hover:bg-zinc-800/50"
          >
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <span className="leading-relaxed font-normal">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
