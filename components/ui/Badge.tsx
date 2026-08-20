import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'secondary';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const base = 'inline-flex items-center border px-2 py-1 font-utility text-[8px] uppercase tracking-[0.12em]';
  
  const variants = {
    default: 'border-[var(--rule)] bg-[var(--paper)] text-[var(--muted)]',
    primary: 'border-[var(--cobalt)] bg-blue-50 text-[var(--cobalt)]',
    success: 'border-emerald-700 bg-emerald-50 text-emerald-800',
    warning: 'border-amber-700 bg-amber-50 text-amber-800',
    secondary: 'border-[var(--oxblood)] bg-red-50 text-[var(--oxblood)]',
  };

  return <span className={twMerge(clsx(base, variants[variant], className))}>{children}</span>;
}
