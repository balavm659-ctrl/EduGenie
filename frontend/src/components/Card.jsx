import React from 'react';

export default function Card({
  children,
  hover = false,
  padding = 'md',
  className = '',
  ...props
}) {
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={`
        glass-panel rounded-3xl
        border border-slate-200/80 dark:border-slate-800/80
        shadow-sm
        ${hover ? 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300' : ''}
        ${paddings[padding] || paddings.md}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
