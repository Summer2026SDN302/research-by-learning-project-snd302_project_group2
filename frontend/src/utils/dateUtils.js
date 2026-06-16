/**
 * Date utility functions for StallBox daily menu module.
 * Uses native Intl / Date APIs — no external dependency required.
 */

/**
 * Format a Date to ISO date string YYYY-MM-DD
 * @param {Date} date
 * @returns {string}
 */
export const formatDateISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Format a Date for Vietnamese display
 * Example: "Chủ nhật, 14 tháng 6, 2026"
 * @param {Date} date
 * @returns {string}
 */
export const formatDateDisplay = (date) =>
  date.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/**
 * Get today's ISO date string
 * @returns {string} – "YYYY-MM-DD"
 */
export const getTodayISO = () => formatDateISO(new Date());

/**
 * Get today's display string
 * @returns {string}
 */
export const getTodayDisplay = () => formatDateDisplay(new Date());

/**
 * Format price to Vietnamese currency display
 * @param {number} price
 * @returns {string} – e.g. "25.000 ₫"
 */
export const formatPrice = (price) =>
  `${price.toLocaleString("vi-VN")} ₫`;