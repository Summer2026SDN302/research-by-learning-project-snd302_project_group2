import React from 'react';

// ─── Mock nav configs per role ─────────────────────────────────────────────
const NAV_CONFIG = {
  admin: [
    { label: 'Dashboard',       icon: 'dashboard',        path: '/admin/dashboard' },
    { label: 'User Management', icon: 'group',            path: '/admin/users' },
    { label: 'Food Categories', icon: 'category',         path: '/admin/categories' },
    { label: 'Food Items',      icon: 'restaurant_menu',  path: '/admin/food-items' },
    { label: 'Daily Menu',      icon: 'today',            path: '/admin/daily-menu' },
    { label: 'Scheduled Menu',  icon: 'calendar_month',   path: '/admin/scheduled-menu' },
    { label: 'Order List',      icon: 'receipt_long',     path: '/admin/orders' },
    { label: 'Payment List',    icon: 'payments',         path: '/admin/payments' },
    { label: 'AI Optimization', icon: 'auto_awesome',     path: '/admin/ai' },
  ],
  manager: [
    { label: 'Dashboard',       icon: 'dashboard',        path: '/manager/dashboard' },
    { label: 'Daily Menu',      icon: 'today',            path: '/manager/daily-menu' },
    { label: 'Scheduled Menu',  icon: 'calendar_month',   path: '/manager/scheduled-menu' },
    { label: 'Dynamic Pricing', icon: 'price_change',     path: '/manager/pricing' },
    { label: 'AI Optimization', icon: 'auto_awesome',     path: '/manager/ai' },
    { label: 'Create Order',    icon: 'add_shopping_cart', path: '/manager/create-order' },
    { label: 'Order List',      icon: 'receipt_long',     path: '/manager/orders' },
    { label: 'Revenue & Sales', icon: 'bar_chart',        path: '/manager/revenue' },
  ],
  staff: [
    { label: 'Dashboard',       icon: 'dashboard',        path: '/staff/dashboard' },
    { label: 'Point of Sale',   icon: 'point_of_sale',    path: '/staff/pos' },
    { label: 'My Orders',       icon: 'history',          path: '/staff/my-orders' },
  ],
};

const ROLE_LABEL = {
  admin:   'System Admin',
  manager: 'Canteen Manager',
  staff:   'Canteen Staff',
};

// ─── Mock user (replace with props / auth context later) ───────────────────
const MOCK_USER = {
  name: 'Admin User',
  initials: 'A',
};

/**
 * Sidebar component
 *
 * Props:
 *   role         {string}  – 'admin' | 'manager' | 'staff'   (default: 'admin')
 *   activePath   {string}  – current route path
 *   onNavigate   {fn}      – (path: string) => void
 *   user         {object}  – { name, initials } override
 */
const Sidebar = ({
  role = 'admin',
  activePath = '',
  onNavigate = () => {},
  user = MOCK_USER,
}) => {
  const navItems = NAV_CONFIG[role] ?? NAV_CONFIG.admin;

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col bg-surface border-r border-outline-variant shadow-soft z-50">
      {/* Brand */}
      <div className="px-6 py-8 border-b border-outline-variant/40">
        <h1 className="text-headline-sm font-bold text-primary leading-tight">StallBox</h1>
        <p className="text-label-md text-on-surface-variant mt-0.5">{ROLE_LABEL[role]}</p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = activePath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
                text-label-md font-semibold transition-all duration-150
                ${isActive
                  ? 'bg-primary/10 text-primary border-r-4 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }
              `}
            >
              <span
                className="material-symbols-outlined text-[22px] shrink-0"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'opsz' 24" }}
              >
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="px-5 py-4 border-t border-outline-variant/40 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm shrink-0">
          {user.initials ?? user.name?.charAt(0) ?? 'U'}
        </div>
        <div className="min-w-0">
          <p className="text-label-md font-bold text-on-surface truncate">{user.name}</p>
          <p className="text-[10px] text-on-surface-variant capitalize">{ROLE_LABEL[role]}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
