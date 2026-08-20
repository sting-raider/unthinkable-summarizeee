'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface KeyPointsProps {
  points: string[];
}

export function KeyPoints({ points }: KeyPointsProps) {
  if (!points || points.length === 0) return null;

  return (
    <div className="w-full">
      <div className="mb-5 flex items-end justify-between border-b border-[var(--ink)] pb-3">
        <h4 className="font-editorial text-3xl font-semibold">Essential points</h4>
        <span className="font-utility text-[9px] uppercase tracking-[0.12em] text-[var(--oxblood)]">The margin notes</span>
      </div>

      <ol className="divide-y divide-[var(--rule)] border-b border-[var(--ink)]">
        {points.map((point, idx) => (
          <li
            key={idx}
            className="grid grid-cols-[36px_1fr_auto] gap-3 py-4 text-sm leading-6 sm:grid-cols-[48px_1fr_auto] sm:text-[15px]"
          >
            <span className="font-editorial text-xl italic text-[var(--cobalt)]">{String(idx + 1).padStart(2, '0')}</span>
            <span>{point}</span>
            <ArrowUpRight className="mt-1 h-4 w-4 text-[var(--rule)]" />
          </li>
        ))}
      </ol>
    </div>
  );
}
