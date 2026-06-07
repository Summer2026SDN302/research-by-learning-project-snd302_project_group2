import { useState, useCallback } from "react";

/**
 * useSidebar
 *
 * Shared hook for managing sidebar collapse state.
 * Persists collapsed state in localStorage so it survives page refresh.
 *
 * @returns {object}
 *   collapsed  {boolean} – true when sidebar is collapsed to icon-only mode
 *   toggle     {fn}      – () => void  toggle collapsed state
 *   sidebarWidth {string} – Tailwind width class for the sidebar
 *   marginLeft   {string} – Tailwind margin class for the main content area
 */
const SIDEBAR_EXPANDED = "w-64";
const SIDEBAR_COLLAPSED = "w-[72px]";
const STORAGE_KEY = "sidebar_collapsed";

const useSidebar = () => {
  const [collapsed, setCollapsed] = useState(() => {
    /** Read initial state from localStorage */
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  /** Toggle and persist to localStorage */
  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return {
    collapsed,
    toggle,
    sidebarWidth: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
  };
};

export default useSidebar;
