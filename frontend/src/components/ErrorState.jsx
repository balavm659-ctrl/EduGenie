import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-red-300 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-500 flex items-center justify-center mb-4 shadow-sm">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all hover:shadow-red-500/25 hover:shadow-md active:scale-[0.97]"
        >
          <RotateCcw className="w-4 h-4" />
          {retryLabel}
        </button>
      )}
    </div>
  );
}
