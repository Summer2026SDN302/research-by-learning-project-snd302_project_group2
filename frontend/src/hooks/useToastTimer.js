import { useEffect } from "react";

/**
 * useToastTimer
 *
 * Shared hook that auto-dismisses a toast after a given duration.
 * Clears the timer on unmount to prevent memory leaks.
 *
 * @param {string}   id        – toast id to pass back to onClose
 * @param {number}   duration  – delay in ms before calling onClose (0 = disabled)
 * @param {fn}       onClose   – (id: string) => void
 */
const useToastTimer = (id, duration, onClose) => {
  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);
};

export default useToastTimer;
