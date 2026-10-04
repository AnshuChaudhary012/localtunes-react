import React, { useEffect } from 'react';
import { Icon } from './Icon.jsx';

export function Toast({ id, message, type = 'info', duration = 3500, onDismiss }) {
  useEffect(() => {
    if (duration > 0 && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200';
      case 'error':
        return 'bg-rose-950/90 border-rose-500/30 text-rose-200';
      case 'warning':
        return 'bg-amber-950/90 border-amber-500/30 text-amber-200';
      default:
        return 'bg-dark-card/95 border-dark-border text-slate-200';
    }
  };

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-glass border transition-all duration-300 animate-fadeIn ${getTypeStyles()}`}
    >
      <div className="flex-shrink-0">{renderIcon()}</div>
      <div className="flex-1 text-sm font-medium text-slate-100">{message}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={() => onDismiss(id)}
          className="text-slate-400 hover:text-white p-1 rounded-lg focus:outline-none transition-colors"
          aria-label="Close notification"
        >
          <Icon name="x" className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function ToastContainer({ toasts = [], onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}
