import React from 'react';

export function LoadingSkeleton({ lines = 4, className = "" }) {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded-md w-3/4"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded-md w-full"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded-md w-5/6"></div>
      {lines > 3 && (
        <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded-md w-2/3"></div>
      )}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm animate-pulse space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700/60"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-1/3"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700/60 rounded w-1/4"></div>
        </div>
      </div>
      <div className="h-3 bg-slate-200 dark:bg-slate-700/60 rounded w-full"></div>
      <div className="h-3 bg-slate-200 dark:bg-slate-700/60 rounded w-4/5"></div>
    </div>
  );
}
