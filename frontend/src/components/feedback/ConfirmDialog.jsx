import { useEffect } from "react";
import { createPortal } from "react-dom";

import Spinner from "./Spinner";

const VARIANT_CONFIG = {
  danger: {
    icon: "warning",
    iconClass: "bg-error-container text-error",
    buttonClass: "bg-error text-on-error hover:opacity-90",
  },
  warning: {
    icon: "priority_high",
    iconClass: "bg-tertiary-container text-tertiary",
    buttonClass: "bg-tertiary text-on-tertiary hover:opacity-90",
  },
  info: {
    icon: "info",
    iconClass: "bg-primary-container text-on-primary-container",
    buttonClass: "bg-primary text-on-primary hover:opacity-90",
  },
};

const ConfirmDialog = ({
  open = false,
  title = "Xác nhận thao tác?",
  description = "Thao tác này sẽ được áp dụng ngay sau khi xác nhận.",
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  variant = "danger",
  onConfirm = () => { },
  onCancel = () => { },
  isLoading = false,
}) => {
  const config = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.danger;

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex min-h-dvh items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default bg-black/45 backdrop-blur-sm"
        onClick={onCancel}
        aria-label="Đóng hộp thoại xác nhận"
        disabled={isLoading}
      />

      <section className="relative w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-elevated">
        <div className="mb-5 flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${config.iconClass}`}>
            <span className="material-symbols-outlined">{config.icon}</span>
          </div>

          <div>
            <h2 className="text-headline-sm font-bold text-on-surface">{title}</h2>
            <p className="mt-2 text-body-sm text-on-surface-variant">{description}</p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-lg border border-outline-variant px-4 py-2.5 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-label-md text-label-md disabled:cursor-not-allowed disabled:opacity-60 ${config.buttonClass}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <Spinner size="sm" />}
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
};

export default ConfirmDialog;
