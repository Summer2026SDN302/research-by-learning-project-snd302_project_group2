import { useRef } from "react";
import useClickOutside from "../../hooks/useClickOutside";

/**
 * NotificationDropdown
 *
 * Dropdown panel showing a list of notifications.
 * Supports three notification types: order, system, payment.
 * Anchored to the notification bell button in Navbar.
 *
 * Props:
 *   open        {boolean}              – controls dropdown visibility
 *   items       {Array<Notification>}  – list of notification objects
 *   onClose     {fn}                   – () => void  called when clicking outside
 *   onRead      {fn}                   – (id: string) => void  mark single as read
 *   onReadAll   {fn}                   – () => void  mark all as read
 *
 * Notification shape:
 *   {
 *     id       {string}
 *     type     {string}  – 'order' | 'system' | 'payment'
 *     title    {string}
 *     message  {string}
 *     time     {string}  – display string, e.g. '5 phút trước'
 *     isRead   {boolean}
 *   }
 */

/** Maps notification type to icon and accent color */
const TYPE_CONFIG = {
  order: {
    icon: "receipt_long",
    iconColor: "text-primary",
    bg: "bg-primary/10",
  },
  system: {
    icon: "info",
    iconColor: "text-tertiary",
    bg: "bg-tertiary-container/20",
  },
  payment: {
    icon: "payments",
    iconColor: "text-secondary",
    bg: "bg-secondary-container/20",
  },
};

const noop = () => {};

const NotificationDropdown = ({
  open = false,
  items = [],
  onClose = noop,
  onRead = noop,
  onReadAll = noop,
}) => {
  const ref = useRef(null);

  /** Close when clicking outside via shared hook */
  useClickOutside(ref, open, onClose);

  /** Count unread items for badge and header button visibility */
  const unreadCount = items.filter((n) => !n.isRead).length;
  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-elevated z-[150] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-outline-variant/50">
        <div className="flex items-center gap-2">
          <p className="text-label-md font-bold text-on-surface">Thông báo</p>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        {/* Only show when there are unread items */}
        {unreadCount > 0 && (
          <button
            onClick={onReadAll}
            className="text-label-sm text-primary hover:opacity-70 transition-opacity"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="overflow-y-auto max-h-[360px]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <span className="material-symbols-outlined text-[40px] text-outline mb-2">
              notifications_off
            </span>
            <p className="text-body-sm text-on-surface-variant">
              Không có thông báo nào
            </p>
          </div>
        ) : (
          items.map((item) => {
            const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.system;
            return (
              <button
                key={item.id}
                onClick={() => onRead(item.id)}
                className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors duration-150
                  hover:bg-surface-container border-b border-outline-variant/30 last:border-b-0
                  ${!item.isRead ? "bg-surface-container/40" : ""}`}
              >
                {/* Type icon */}
                <div
                  className={`w-9 h-9 rounded-full ${config.bg} ${config.iconColor} flex items-center justify-center shrink-0 mt-0.5`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {config.icon}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-label-md leading-snug truncate ${!item.isRead ? "font-bold text-on-surface" : "font-semibold text-on-surface-variant"}`}
                  >
                    {item.title}
                  </p>
                  <p className="text-body-sm text-on-surface-variant mt-0.5 line-clamp-2 leading-snug">
                    {item.message}
                  </p>
                  <p className="text-[11px] text-outline mt-1">{item.time}</p>
                </div>

                {/* Unread dot */}
                {!item.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
