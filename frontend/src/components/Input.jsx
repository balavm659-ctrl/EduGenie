import React from 'react';

export default function Input({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-') || undefined;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        )}
        <input
          id={inputId}
          className={`
            w-full px-3.5 py-2.5 rounded-xl text-sm
            border transition-all duration-200
            bg-white/70 dark:bg-slate-800/70
            text-slate-800 dark:text-slate-100
            placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            ${Icon ? 'pl-10' : ''}
            ${error
              ? 'border-red-400 dark:border-red-600 focus:ring-red-500'
              : 'border-slate-200 dark:border-slate-700'
            }
            ${className}
          `.trim()}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error && inputId ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p
          id={inputId ? `${inputId}-error` : undefined}
          className="text-[11px] text-red-500 dark:text-red-400 font-medium mt-0.5"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
