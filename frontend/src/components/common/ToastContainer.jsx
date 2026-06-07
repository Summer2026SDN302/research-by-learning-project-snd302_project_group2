const ToastContainer = ({ toasts, onRemove }) => {
  if (!toasts.length) return null;

  const typeStyles = {
    success: "border-secondary/30 bg-secondary-container/20 text-secondary",
    error: "border-error/30 bg-error-container/30 text-error",
    info: "border-primary/30 bg-primary/10 text-primary",
  };

  return (
    <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg bg-surface-container-lowest text-body-sm font-medium ${
            typeStyles[toast.type] ?? typeStyles.info
          }`}
        >
          <span className="material-symbols-outlined text-[20px] shrink-0">
            {toast.type === "error" ? "error" : toast.type === "success" ? "check_circle" : "info"}
          </span>
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={() => onRemove(toast.id)}
            className="opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
