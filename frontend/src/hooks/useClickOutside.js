import { useEffect } from "react";

/**
 * useClickOutside
 *
 * Shared hook that calls onClose when a mousedown event occurs outside the ref element.
 * Attaches/detaches the listener based on the enabled flag.
 *
 * @param {RefObject} ref      – ref attached to the dropdown container element
 * @param {boolean}   enabled  – only listen when true (e.g. when dropdown is open)
 * @param {fn}        onClose  – () => void  called when click outside is detected
 */
const useClickOutside = (ref, enabled, onClose) => {
  useEffect(() => {
    if (!enabled) return;
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, enabled, onClose]);
};

export default useClickOutside;
