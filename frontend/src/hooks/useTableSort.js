import { useState, useMemo } from "react";

/**
 * useTableSort
 *
 * Shared hook for client-side table sorting.
 * Handles sort state and returns sorted rows.
 *
 * @param {Array<object>} rows – raw rows from Redux store or props
 *
 * @returns {object}
 *   sortKey    {string|null} – current column being sorted
 *   sortDir    {string}      – 'asc' | 'desc'
 *   sortedRows {Array}       – sorted copy of rows (original untouched)
 *   handleSort {fn}          – (key: string) => void  call on column header click
 */
const useTableSort = (rows) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  /**
   * Toggle sort direction if same column clicked,
   * otherwise switch to new column and reset to 'asc'.
   */
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  /**
   * Returns a sorted copy of rows based on sortKey and sortDir.
   * Returns original rows if no sortKey is selected.
   * Recalculates only when rows, sortKey, or sortDir changes.
   */
  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];

      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }

      const aText = String(av ?? "").toLowerCase();
      const bText = String(bv ?? "").toLowerCase();

      return sortDir === "asc"
        ? aText.localeCompare(bText)
        : bText.localeCompare(aText);
    });
  }, [rows, sortKey, sortDir]);

  return { sortKey, sortDir, sortedRows, handleSort };
};

export default useTableSort;
