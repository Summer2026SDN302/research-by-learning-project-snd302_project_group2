import React, { useState, useRef, useEffect } from 'react';

/**
 * UserDropdown
 *
 * Props:
 *   user        {object}   – { name, initials, email, role }
 *   onProfile   {fn}
 *   onChangePassword {fn}
 *   onLogout    {fn}
 */
const UserDropdown = ({
  user = { name: 'Admin User', initials: 'A', email: 'admin@stallbox.com', role: 'admin' },
  onProfile = () => {},
  onChangePassword = () => {},
  onLogout = () => {},
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const ROLE_LABEL = { admin: 'System Admin', manager: 'Canteen Manager', staff: 'Canteen Staff' };

  const menuItems = [
    { icon: 'person',   label: 'Profile',         action: onProfile },
    { icon: 'lock',     label: 'Change Password',  action: onChangePassword },
    { divider: true },
    { icon: 'logout',   label: 'Sign Out',         action: onLogout, danger: true },
  ];

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-surface-container transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">
          {user.initials ?? user.name?.charAt(0) ?? 'U'}
        </div>
        <div className="text-left hidden md:block">
          <p className="text-body-sm font-semibold text-on-surface leading-tight">{user.name}</p>
          <p className="text-[10px] text-on-surface-variant leading-tight">{ROLE_LABEL[user.role] ?? user.role}</p>
        </div>
        <span className={`material-symbols-outlined text-outline text-[18px] transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-elevated border border-outline-variant z-50 overflow-hidden">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-outline-variant/50">
            <p className="text-body-sm font-bold text-on-surface truncate">{user.name}</p>
            <p className="text-[11px] text-on-surface-variant truncate">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item, idx) =>
              item.divider ? (
                <div key={idx} className="my-1 border-t border-outline-variant/50" />
              ) : (
                <button
                  key={idx}
                  onClick={() => { item.action(); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-body-sm transition-colors ${
                    item.danger
                      ? 'text-error hover:bg-error-container/20'
                      : 'text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  {item.label}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
