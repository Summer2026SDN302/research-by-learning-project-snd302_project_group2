import useToastTimer from "../../hooks/useToastTimer";

/**
 * Toast
 *
 * Single toast notification item.
 * Renders a dismissible alert with icon, title, message, and auto-close timer.
 *
 * Props:
 *   id        {string}   – unique identifier for this toast
 *   type      {string}   – 'success' | 'error' | 'warning' | 'info'  (default: 'info')
 *   title     {string}   – bold heading text
 *   message   {string}   – supporting description text
 *   duration  {number}   – auto-dismiss delay in ms, 0 = no auto-dismiss  (default: 3000)
 *   onClose   {fn}       – (id: string) => void  called when toast is dismissed
 */

/** Maps toast type to icon, colors, and progress bar color */
const TYPE_CONFIG = {
  success: {
    icon: "check_circle",
    iconColor: "text-secondary",
    bg: "bg-secondary-container/20",
    border: "border-secondary/20",
    progress: "bg-secondary",
  },
  error: {
    icon: "cancel",
    iconColor: "text-error",
    bg: "bg-error-container/20",
    border: "border-error/20",
    progress: "bg-error",
  },
  warning: {
    icon: "warning",
    iconColor: "text-tertiary",
    bg: "bg-tertiary-container/20",
    border: "border-tertiary/20",
    progress: "bg-tertiary",
  },
  info: {
    icon: "info",
    iconColor: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    progress: "bg-primary",
  },
};

const noop = () => {};

const Toast = ({
  id,
  type = "info",
  title = "",
  message = "",
  duration = 3000,
  onClose = noop,
}) => {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.info;

  /** Delegate auto-dismiss timer logic to hook */
  useToastTimer(id, duration, onClose);

  return (
    <div
      className={`relative flex items-start gap-3 w-80 rounded-xl border px-4 py-3.5 shadow-elevated overflow-hidden
        bg-surface-container-lowest ${config.border} animate-in slide-in-from-right-5 fade-in duration-300`}
    >
      {/* Icon */}
      <span
        className={`material-symbols-outlined text-[22px] shrink-0 mt-0.5 ${config.iconColor}`}
      >
        {config.icon}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-label-md font-bold text-on-surface leading-snug">
            {title}
          </p>
        )}
        {message && (
          <p className="text-body-sm text-on-surface-variant mt-0.5 leading-snug">
            {message}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onClose(id)}
        className="shrink-0 text-outline hover:text-on-surface transition-colors mt-0.5"
        aria-label="Đóng thông báo"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>

      {/* Progress bar – animates from full width to 0 over duration */}
      {duration > 0 && (
        <div
          className={`absolute bottom-0 left-0 h-0.5 ${config.progress} opacity-40`}
          style={{ animation: `shrink ${duration}ms linear forwards` }}
        />
      )}
    </div>
  );
};

export default Toast;
