import { NAV_CONFIG, ROLE_LABEL } from "../../constants/navConfig";

/**
 * Sidebar
 *
 * Collapsible side navigation for Admin, Manager, and Staff roles.
 * Nav items are driven by NAV_CONFIG based on the role prop.
 *
 * Props:
 *   role             {string}  – 'admin' | 'manager' | 'staff'  (default: 'admin')
 *   activePath       {string}  – current route pathname, used to highlight active item
 *   onNavigate       {fn}      – (path: string) => void  called when a nav item is clicked
 *   collapsed        {boolean} – true = icon-only mode, false = full expanded  (default: false)
 *   onToggleCollapse {fn}      – () => void  called when collapse toggle button is clicked
 *   className        {string}  – additional Tailwind classes (e.g. width transition)
 *   user             {object}  – { name, initials }  displayed in the footer
 */

const noop = () => {};

const Sidebar = ({
  role = "admin",
  activePath = "",
  onNavigate = noop,
  collapsed = false,
  onToggleCollapse = noop,
  className = "",
  user = { name: "Admin User", initials: "A" },
}) => {
  const navItems = NAV_CONFIG[role] ?? NAV_CONFIG.admin;

  return (
    <aside
      className={`h-screen flex flex-col bg-surface border-r border-outline-variant shadow-soft z-50 relative shrink-0 ${className}`}
    >
      {/* Brand */}
      <div className="px-6 py-8 border-b border-outline-variant/40">
        <button
          onClick={() => window.location.reload()}
          className="text-left hover:opacity-85 active:scale-[0.98] transition-all duration-150 focus:outline-none"
          title="Tải lại trang"
        >
          <h1 className="text-headline-sm font-bold text-primary leading-tight">
            StallBox
          </h1>
        </button>
        {!collapsed && (
          <p className="text-label-md text-on-surface-variant mt-0.5">
            {ROLE_LABEL[role]}
          </p>
        )}
        <button
          onClick={onToggleCollapse}
          className="absolute top-4 right-3 p-1 rounded hover:bg-surface-container"
          aria-label="Toggle sidebar"
        >
          <span className="material-symbols-outlined">
            {collapsed ? "chevron_right" : "chevron_left"}
          </span>
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = activePath.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
                text-label-md font-semibold transition-all duration-150
                ${
                  isActive
                    ? "bg-primary/10 text-primary border-r-4 border-primary"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }
              `}
            >
              <span
                className="material-symbols-outlined text-[22px] shrink-0"
                style={{
                  fontVariationSettings: "'FILL' 0, 'wght' 400, 'opsz' 24",
                }}
              >
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Footer — always show avatar, hide text when collapsed */}
      <div className="px-5 py-4 border-t border-outline-variant/40 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm shrink-0">
          {user.initials ?? user.name?.charAt(0) ?? "U"}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-label-md font-bold text-on-surface truncate">
              {user.name}
            </p>
            <p className="text-[10px] text-on-surface-variant capitalize">
              {ROLE_LABEL[role]}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
