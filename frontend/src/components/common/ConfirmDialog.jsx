import React from 'react';

/**
 * ConfirmDialog
 *
 * Props:
 *   open        {boolean}
 *   title       {string}
 *   description {string}
 *   confirmLabel {string}
 *   cancelLabel  {string}
 *   variant     {string}  – 'danger' | 'warning' | 'info'
 *   onConfirm   {fn}
 *   onCancel    {fn}
 *   isLoading   {boolean}
 */
const VARIANT_CONFIG = {
  danger: { icon: 'delete_forever', iconColor: 'text-error', bg: 'bg-error-container/20', btn: 'bg-error hover:opacity-90 text-on-error' },
  warning: { icon: 'warning', iconColor: 'text-tertiary', bg: 'bg-tertiary-container/20', btn: 'bg-tertiary hover:opacity-90 text-on-tertiary' },
  info: { icon: 'info', iconColor: 'text-primary', bg: 'bg-primary/10', btn: 'bg-primary hover:opacity-90 text-on-primary' },
};

const ConfirmDialog = ({
  open = false,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm = () => { },
  onCancel = () => { },
  isLoading = false,
}) => {
  if (!open) return null;

  const { icon, iconColor, bg, btn } = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.danger;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-elevated p-6 w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className={`w-14 h-14 ${bg} ${iconColor} rounded-2xl flex items-center justify-center mb-5 mx-auto`}>
          <span className="material-symbols-outlined text-[32px]">{icon}</span>
        </div>

        {/* Text */}
        <div className="text-center mb-6">
          <h3 className="text-headline-sm font-bold text-on-surface">{title}</h3>
          <p className="text-body-sm text-on-surface-variant mt-2">{description}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl border border-outline-variant text-body-sm font-semibold text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 rounded-xl text-body-sm font-semibold transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 ${btn}`}
          >
            {isLoading && (
              <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
