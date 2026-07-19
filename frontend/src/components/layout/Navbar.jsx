import NotificationDropdown from "../dropdown/NotificationDropdown";
import UserDropdown from "../dropdown/UserDropdown";
import useDropdownToggle from "../../hooks/useDropdownToggle";

/**
 * Navbar / TopBar
 *
 * Props:
 *   user                   {object}  – { name, initials, email }
 *   notifications          {number}  – badge count (0 = hidden)
 *   notificationItems      {Array}   – list of notification objects for dropdown
 *   onReadNotification     {fn}      – (id: string) => void
 *   onReadAllNotifications {fn}      – () => void
 *   onProfile              {fn}      – () => void
 *   onChangePassword       {fn}      – () => void
 *   onSettings             {fn}      – () => void
 *   onLogout               {fn}      – () => void
 */

const noop = () => {};

const Navbar = ({
  user = { name: "Admin User", initials: "A", email: "" },
  notifications = 0,
  notificationItems = [],
  onReadNotification = noop,
  onReadAllNotifications = noop,
  onProfile = noop,
  onChangePassword = noop,
  onSettings = noop,
  onLogout = noop,
}) => {
  /** Track which dropdown is open — only one at a time */
  const { openDropdown, toggleDropdown, closeDropdown } = useDropdownToggle();

  return (
    <header className="h-16 flex items-center justify-end px-6 bg-surface border-b border-outline-variant sticky top-0 z-40 gap-4">
      {/* Right Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown("notif")}
            className="relative p-2 rounded-full hover:bg-surface-container transition-colors duration-150 flex items-center justify-center"
            aria-label="Thông báo"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[22px]">
              notifications
            </span>
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-error text-on-error text-[9px] font-bold rounded-full flex items-center justify-center">
                {notifications > 9 ? "9+" : notifications}
              </span>
            )}
          </button>

          <NotificationDropdown
            open={openDropdown === "notif"}
            items={notificationItems}
            onClose={closeDropdown}
            onRead={onReadNotification}
            onReadAll={onReadAllNotifications}
          />
        </div>

        {/* Help */}
        <button
          className="p-2 rounded-full hover:bg-surface-container transition-colors duration-150 flex items-center justify-center"
          aria-label="Trợ giúp"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[22px]">
            help_outline
          </span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-outline-variant mx-1" />

        {/* User Avatar */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown("user")}
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-surface-container transition-colors duration-150"
            aria-label="Tài khoản"
          >
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">
              {user.initials ?? user.name?.charAt(0) ?? "U"}
            </div>
            <span className="text-body-sm font-semibold text-on-surface hidden md:block">
              {user.name}
            </span>
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
              expand_more
            </span>
          </button>

          <UserDropdown
            open={openDropdown === "user"}
            user={user}
            onClose={closeDropdown}
            onProfile={onProfile}
            onChangePassword={onChangePassword}
            onSettings={onSettings}
            onLogout={onLogout}
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
