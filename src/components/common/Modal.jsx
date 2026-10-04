import React, { useEffect } from 'react';
import { Icon } from './Icon.jsx';

export function Modal({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  confirmStyle = 'cyan', // 'cyan' | 'danger'
  cancelText = 'Cancel',
  showCancel = true,
  maxWidth = 'max-w-md',
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const btnConfirmClass =
    confirmStyle === 'danger'
      ? 'bg-rose-600 hover:bg-rose-500 text-white'
      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-glow';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div
        className={`relative w-full ${maxWidth} p-6 bg-dark-card border border-dark-border rounded-2xl shadow-2xl transform scale-100 transition-transform`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white tracking-wide">{title}</h3>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors focus:outline-none"
              aria-label="Close modal"
            >
              <Icon name="x" className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="my-4 text-slate-300 text-sm">{children}</div>

        {/* Footer */}
        {(showCancel || onConfirm) && (
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            {showCancel && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors focus:outline-none"
              >
                {cancelText}
              </button>
            )}
            {onConfirm && (
              <button
                type="button"
                onClick={onConfirm}
                className={`px-5 py-2 text-sm font-medium rounded-xl transition-all focus:outline-none ${btnConfirmClass}`}
              >
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
