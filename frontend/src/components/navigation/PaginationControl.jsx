import usePagination from "../../hooks/usePagination";

/**
 * PaginationControl
 *
 * Pagination UI supporting both page number list and Prev/Next navigation.
 * Shows ellipsis when page range is large.
 *
 * Props:
 *   currentPage     {number}   – active page (1-indexed)
 *   totalPages      {number}   – total number of pages
 *   onPageChange    {fn}       – (page: number) => void
 *   showPageNumbers {boolean}  – show numbered page buttons  (default: true)
 */

const noop = () => {};

/** Base class shared by all page buttons */
const BASE_BTN =
  "min-w-[36px] h-9 flex items-center justify-center rounded-lg text-label-md font-semibold transition-all duration-150 select-none";

const PaginationControl = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange = noop,
  showPageNumbers = true,
}) => {
  const { isPrevDisabled, isNextDisabled, pages } = usePagination(
    currentPage,
    totalPages,
  );

  return (
    <div className="flex items-center gap-1">
      {/* Prev button */}
      <button
        onClick={() => !isPrevDisabled && onPageChange(currentPage - 1)}
        disabled={isPrevDisabled}
        aria-label="Trang trước"
        className={`${BASE_BTN} px-2 gap-1 border border-outline-variant text-on-surface-variant
          hover:bg-surface-container hover:text-on-surface disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <span className="material-symbols-outlined text-[18px]">
          chevron_left
        </span>
        <span className="hidden sm:inline text-body-sm">Trước</span>
      </button>

      {/* Page numbers */}
      {showPageNumbers &&
        pages.map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className={`${BASE_BTN} text-outline cursor-default`}
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={`${BASE_BTN} ${
                page === currentPage
                  ? "bg-primary text-on-primary shadow-sm"
                  : "border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              {page}
            </button>
          ),
        )}

      {/* Next button */}
      <button
        onClick={() => !isNextDisabled && onPageChange(currentPage + 1)}
        disabled={isNextDisabled}
        aria-label="Trang sau"
        className={`${BASE_BTN} px-2 gap-1 border border-outline-variant text-on-surface-variant
          hover:bg-surface-container hover:text-on-surface disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <span className="hidden sm:inline text-body-sm">Sau</span>
        <span className="material-symbols-outlined text-[18px]">
          chevron_right
        </span>
      </button>
    </div>
  );
};

export default PaginationControl;
