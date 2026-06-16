/**
 * Utility functions for formatting values.
 */

/**
 * Format number to Vietnamese currency display (VND)
 * @param {number} n
 * @returns {string}
 */
export const formatVND = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n ?? 0);
