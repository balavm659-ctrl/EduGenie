import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_STYLES = {
  success: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200',
  error: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200',
  warning: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200',
  info: 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950/60 text-primary-800 dark:text-primary-200',
};

const TOAST_PROGRESS = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-primary-500',
};

const TOAST_ICON_STYLES = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-primary-500',
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++toastId;
    const toast = { id, type, title, message, duration, createdAt: Date.now() };

    setToasts(prev => [...prev.slice(-4), toast]); // max 5 toasts visible

    if (duration > 0) {
      timersRef.current[id] = setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const toast = useCallback({
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
    info: (title, message) => addToast({ type: 'info', title, message }),
  }, [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container */}
      <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
        {toasts.map((t) => {
          const Icon = TOAST_ICONS[t.type] || Info;
          return (
            <div
              key={t.id}
              className={`
                animate-slide-in-right
                rounded-2xl border shadow-lg
                overflow-hidden
                ${TOAST_STYLES[t.type]}
              `}
              role="alert"
            >
              <div className="flex items-start gap-3 p-4">
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${TOAST_ICON_STYLES[t.type]}`} />
                <div className="flex-1 min-w-0">
                  {t.title && (
                    <p className="text-sm font-semibold">{t.title}</p>
                  )}
                  {t.message && (
                    <p className="text-xs mt-0.5 opacity-80">{t.message}</p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity shrink-0"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress bar */}
              {t.duration > 0 && (
                <div
                  className={`toast-progress-bar ${TOAST_PROGRESS[t.type]}`}
                  style={{ '--toast-duration': `${t.duration}ms` }}
                />
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
