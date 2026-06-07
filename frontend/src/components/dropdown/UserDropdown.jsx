import { useRef } from "react";
import useClickOutside from "../../hooks/useClickOutside";
/**
 * UserDropdown
 *
 * Dropdown menu anchored to the user avatar in Navbar.
 * Shows user info and action items: profile, change password, settings, logout.
 *
 * Props:
 *   open             {boolean}  – controls dropdown visibility
 *   user             {object}   – { name, initials, email }
 *   onClose          {fn}       – () => void  called when clicking outside
 *   onProfile        {fn}       – () => void
 *   onChangePassword {fn}       – () => void
 *   onSettings       {fn}       – () => void
 *   onLogout         {fn}       – () => void
 */

const noop = () => {};

/**
 * Builds menu items array with handlers bound from props.
 * Called inside component so handlers are always up to date.
 */
const getMenuItems = (onProfile, onChangePassword, onSettings) => [
  {
    key: "profile",
    icon: "account_circle",
    label: "Thông tin cá nhân",
    handler: onProfile,
  },
  {
    key: "changePassword",
    icon: "lock_reset",
    label: "Đổi mật khẩu",
    handler: onChangePassword,
  },
  { key: "settings", icon: "settings", label: "Cài đặt", handler: onSettings },
];

const UserDropdown = ({
  open = false,
  user = { name: "", initials: "U", email: "" },
  onClose = noop,
  onProfile = noop,
  onChangePassword = noop,
  onSettings = noop,
  onLogout = noop,
}) => {
  const ref = useRef(null);

  /** Close when clicking outside via shared hook */
  useClickOutside(ref, open, onClose);

  if (!open) return null;

  /** Build menu items with current handlers from props */
  const menuItems = getMenuItems(onProfile, onChangePassword, onSettings);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-elevated z-[150] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      {/* User info header */}
      <div className="px-4 py-3.5 border-b border-outline-variant/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm shrink-0">
            {user.initials ?? user.name?.charAt(0) ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="text-label-md font-bold text-on-surface truncate">
              {user.name}
            </p>
            {user.email && (
              <p className="text-[11px] text-on-surface-variant truncate">
                {user.email}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1.5">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              item.handler();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors duration-150"
          >
            <span className="material-symbols-outlined text-[20px]">
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Divider + Logout */}
      <div className="border-t border-outline-variant/50 py-1.5">
        <button
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-label-md text-error hover:bg-error-container/20 transition-colors duration-150"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;
