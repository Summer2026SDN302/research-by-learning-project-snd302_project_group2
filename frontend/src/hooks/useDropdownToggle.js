import { useState, useCallback } from "react";

/**
 * useDropdownToggle
 *
 * Shared hook for managing mutually exclusive dropdown open state.
 * Only one dropdown can be open at a time.
 *
 * @returns {object}
 *   openDropdown   {string|null} – key of the currently open dropdown
 *   toggleDropdown {fn}          – (name: string) => void  toggle a dropdown by key
 *   closeDropdown  {fn}          – () => void  close all dropdowns
 */
const useDropdownToggle = () => {
  const [openDropdown, setOpenDropdown] = useState(null);

  /** Toggle target dropdown — close if already open, open if closed */
  const toggleDropdown = useCallback((name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  }, []);

  /** Close all dropdowns */
  const closeDropdown = useCallback(() => {
    setOpenDropdown(null);
  }, []);

  return { openDropdown, toggleDropdown, closeDropdown };
};

export default useDropdownToggle;
