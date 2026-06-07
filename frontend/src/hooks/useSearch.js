import { useState, useCallback, useRef, useEffect } from "react";

/**
 * useSearch
 *
 * Shared hook for page-level search.
 * Handles query state and debounce before calling onSearch.
 *
 * @param {fn} onSearch   – (query: string) => void  (Redux dispatch or local filter)
 * @param {number} delay  – debounce delay in ms (default: 300)
 */
const useSearch = (onSearch, delay = 300) => {
  const [query, setQuery] = useState("");
  const timerRef = useRef(null);

  const handleSearch = useCallback(
    (value) => {
      setQuery(value);

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onSearch(value);
      }, delay);
    },
    [onSearch, delay],
  );

  const resetSearch = useCallback(() => {
    setQuery("");
    onSearch("");
  }, [onSearch]);

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  return {
    query,
    handleSearch,
    resetSearch,
  };
};

export default useSearch;
