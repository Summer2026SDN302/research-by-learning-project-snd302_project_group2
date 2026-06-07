import { useMemo } from "react";

/**
 * usePagination
 *
 * Shared hook that computes pagination state from currentPage and totalPages.
 * Builds the page number array with ellipsis markers for large ranges.
 *
 * @param {number} currentPage  – active page (1-indexed)
 * @param {number} totalPages   – total number of pages
 *
 * @returns {object}
 *   isPrevDisabled {boolean}       – true when on first page
 *   isNextDisabled {boolean}       – true when on last page
 *   pages          {Array<number|string>} – page numbers with '...' ellipsis markers
 */

/** Builds the page number array with ellipsis markers */
const buildPageRange = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3)
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];

  return [1, "...", current - 1, current, current + 1, "...", total];
};

const usePagination = (currentPage, totalPages) => {
  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  /** Recalculate page range only when currentPage or totalPages changes */
  const pages = useMemo(
    () => buildPageRange(currentPage, totalPages),
    [currentPage, totalPages],
  );

  return { isPrevDisabled, isNextDisabled, pages };
};

export default usePagination;
