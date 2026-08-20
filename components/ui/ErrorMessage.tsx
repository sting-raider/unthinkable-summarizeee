import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, onRetry, onDismiss }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="editorial-reveal border border-[var(--oxblood)] bg-red-50 p-4 text-red-950"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--oxblood)]" />
        <div className="flex-1 text-sm leading-relaxed">
          {message}
        </div>
        <div className="flex items-center gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
            className="inline-flex items-center gap-1.5 border-b border-[var(--oxblood)] py-1 font-utility text-[9px] uppercase tracking-[0.1em] text-[var(--oxblood)]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              aria-label="Dismiss error"
            className="p-1 text-[var(--oxblood)] hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
