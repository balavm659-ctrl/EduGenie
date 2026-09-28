import React from 'react';
import { Languages } from 'lucide-react';

export default function LanguageSelector({ value, onChange, compact = false }) {
  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm backdrop-blur-sm">
        <Languages className="w-3.5 h-3.5 text-primary-500" />
        <select
          value={value || 'english'}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent focus:outline-none cursor-pointer pr-1 text-slate-800 dark:text-slate-100 font-medium"
        >
          <option value="english" className="dark:bg-slate-900">English</option>
          <option value="tamil" className="dark:bg-slate-900">தமிழ் (Tamil)</option>
          <option value="tanglish" className="dark:bg-slate-900">Tamil + English (Tanglish)</option>
        </select>
      </div>
    </div>
  );
}
