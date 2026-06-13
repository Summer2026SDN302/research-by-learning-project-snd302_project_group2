import React, { useEffect, useCallback } from 'react';

/**
 * Toast Notification (self-dismissing)
 *
 * Usage – call useToast() hook to get { toasts, showToast, removeToast }
 * Render <ToastContainer> once at app root.
 *
 * Toast types: 'success' | 'error' | 'warning' | 'info'
 */

// ─── Config ──────────────────────────────────────────────────────────────────
const TOAST_CONFIG = {
  success: { icon: 'check_circle',    border: 'border-l-secondary',  iconColor: 'text-secondary',  bg: 'bg-surface-container-lowest' },
  error:   { icon: 'error',           border: 'border-l-error',      iconColor: 'text-error',       bg: 'bg-surface-container-lowest' },
  warning: { icon: 'warning',         border: 'border-l-tertiary',   iconColor: 'text-tertiary',    bg: 'bg-surface-container-lowest' },
  info:    { icon: 'info',            border: 'border-l-primary',    iconColor: 'text-primary',     bg: 'bg-surface-container-lowest' },
};

// ─── Single Toast Item ────────────────────────────────────────────────────────
const ToastItem = ({ id, type = 'info', title, message, onRemove }) => {
  const { icon, border, iconColor, bg } = TOAST_CONFIG[type] ?? TOAST_CONFIG.info;

  useEffect(() => {
    const timer = setTimeout(() => onRemove(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  return (
    <div
      className={`
        ${bg} ${border} border border-outline-variant border-l-4
        rounded-xl shadow-elevated px-4 py-3.5 flex items-start gap-3
        max-w-sm w-full animate-in slide-in-from-right-4 fade-in duration-200
      `}
    >
      <span className={`material-symbols-outlined text-[22px] shrink-0 mt-0.5 ${iconColor}`}>{icon}</span>
      <div className="flex-1 min-w-0">
        {title && <p className="text-body-sm font-bold text-on-surface">{title}</p>}
        {message && <p className="text-body-sm text-on-surface-variant mt-0.5">{message}</p>}
      </div>
      <button
        onClick={() => onRemove(id)}
        className="shrink-0 text-outline hover:text-on-surface transition-colors"
        aria-label="Close"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
};

// ─── Toast Container ──────────────────────────────────────────────────────────
export const ToastContainer = ({ toasts = [], onRemove = () => {} }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-3 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem {...t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
};

// ─── useToast Hook ────────────────────────────────────────────────────────────
import { useState } from 'react';

let _toastId = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ type = 'info', title, message }) => {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
};

export default ToastItem;
