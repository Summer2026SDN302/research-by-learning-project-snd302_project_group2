/**
 * Utility functions for formatting values.
 */

/**
 * Format number to Vietnamese currency display (VND)
 * @param {number} n
 * @returns {string}
 */
const vndFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export const formatCurrency = (value) => {
  const number = Number(value);
  return Number.isNaN(number) ? "—" : vndFormatter.format(number);
};
