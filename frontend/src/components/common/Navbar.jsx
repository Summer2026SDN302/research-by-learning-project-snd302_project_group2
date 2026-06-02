import React, { useState } from 'react';

/**
 * Navbar / TopBar
 *
 * Props:
 *   title          {string}   – page title shown on left (mobile only)
 *   onSearch       {fn}       – (query: string) => void
 *   searchPlaceholder {string}
 *   user           {object}   – { name, initials }
 *   notifications  {number}   – badge count (0 = hidden)
 *   onProfileClick {fn}
 *   onNotifClick   {fn}
 */
const Navbar = ({
  title = '',
  onSearch = () => {},
  searchPlaceholder = 'Search...',
  user = { name: 'Admin User', initials: 'A' },
  notifications = 3,
  onProfileClick = () => {},
  onNotifClick = () => {},
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-surface border-b border-outline-variant sticky top-0 z-40 gap-4">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder={searchPlaceholder}
          className="w-full bg-surface-container-low rounded-full py-2 pl-10 pr-4 text-body-sm border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notifications */}
        <button
          onClick={onNotifClick}
          className="relative p-2 rounded-full hover:bg-surface-container transition-colors duration-150"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[22px]">notifications</span>
          {notifications > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-error text-on-error text-[9px] font-bold rounded-full flex items-center justify-center">
              {notifications > 9 ? '9+' : notifications}
            </span>
          )}
        </button>

        {/* Help */}
        <button className="p-2 rounded-full hover:bg-surface-container transition-colors duration-150" aria-label="Help">
          <span className="material-symbols-outlined text-on-surface-variant text-[22px]">help_outline</span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-outline-variant mx-1" />

        {/* User Avatar */}
        <button
          onClick={onProfileClick}
          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-surface-container transition-colors duration-150"
          aria-label="User profile"
        >
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">
            {user.initials ?? user.name?.charAt(0) ?? 'U'}
          </div>
          <span className="text-body-sm font-semibold text-on-surface hidden md:block">{user.name}</span>
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">expand_more</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
