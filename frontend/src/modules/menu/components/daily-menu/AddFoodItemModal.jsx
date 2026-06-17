import { useState } from "react";
import { createPortal } from "react-dom";
import { useAddFoodItem } from "../../hooks/daily-menu/useAddFoodItem";
import SearchBar from "../../../../components/search/SearchBar";
import FilterBar from "../../../../components/search/FilterBar";
import Spinner from "../../../../components/feedback/Spinner";
import PaginationControl from "../../../../components/navigation/PaginationControl";
import { formatVND } from "../../../../utils/formatters";

/**
 * AddFoodItemModal
 *
 * Props:
 *   open             {boolean}
 *   onAdd            {fn}        – (foodItemId) => void
 *   onClose          {fn}
 *   isLoading        {boolean}   – mutation loading
 *   existingItemIds  {string[]}  – food item IDs already in today's menu
 */
const AddFoodItemModal = ({
  open,
  onAdd,
  onClose,
  isLoading,
  existingItemIds = [],
}) => {
  const {
    categories = [],
    items = [],
    loading = false,
    pagination = null,
    search = "",
    setSearch,
    page = 1,
    setPage,
    categoryId = "",
    setCategoryId,
  } = useAddFoodItem();

  const [selectedIds, setSelectedIds] = useState(new Set());

  if (!open) return null;

  const totalPages = pagination?.totalPages ?? 1;
  const existingSet = new Set(existingItemIds);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filters = [
    {
      key: "category",
      label: "Danh mục",
      options: [
        { value: "", label: "Tất cả danh mục" },
        ...categories.map((cat) => ({ value: cat._id, label: cat.name })),
      ],
    },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Dialog */}
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-elevated p-6 w-full max-w-lg mx-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-secondary-container/20 text-secondary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">
              add_circle
            </span>
          </div>
          <div>
            <h3 className="text-headline-sm font-bold text-on-surface">
              Thêm món ăn
            </h3>
            <p className="text-body-sm text-on-surface-variant">
              Chọn các món để thêm vào thực đơn ngày
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <SearchBar
            placeholder="Tìm tên món..."
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            className="flex-1 min-w-[180px]"
          />
          <FilterBar
            filters={filters}
            values={{ category: categoryId }}
            onChange={(_key, value) => {
              setCategoryId(value);
              setPage(1);
            }}
            onReset={() => {
              setCategoryId("");
              setPage(1);
            }}
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[400px] space-y-2 pr-1">
          {loading && (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-[48px] text-outline/50 mb-2 block">
                search_off
              </span>
              <p className="text-body-sm text-on-surface-variant">
                Không tìm thấy món ăn.
              </p>
            </div>
          )}

          {!loading &&
            items.map((fi) => {
              const alreadyAdded = existingSet.has(fi._id);
              const isSelected = selectedIds.has(fi._id);
              return (
                <div
                  key={fi._id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    alreadyAdded
                      ? "border-outline-variant/50 bg-surface-container/30 opacity-60 cursor-not-allowed"
                      : isSelected
                      ? "border-primary bg-primary/5 cursor-pointer"
                      : "border-outline-variant hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                  }`}
                  onClick={() => {
                    if (!alreadyAdded && !isLoading) {
                      toggleSelect(fi._id);
                    }
                  }}
                >
                  {/* Checkbox */}
                  <div className="flex items-center justify-center shrink-0 pl-1">
                    {alreadyAdded ? (
                      <input
                        type="checkbox"
                        checked
                        disabled
                        className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/30 cursor-not-allowed"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(fi._id)}
                        className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/30 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>

                  {/* Icon */}
                  <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px] text-on-surface-variant">
                      lunch_dining
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-semibold text-on-surface truncate">
                      {fi.name}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      {fi.categoryName ?? "—"} • {formatVND(fi.basePrice)}
                    </p>
                  </div>

                  {/* Badge */}
                  {alreadyAdded && (
                    <span className="text-[11px] text-on-surface-variant px-2 py-0.5 rounded-full bg-surface-container-high">
                      Đã có
                    </span>
                  )}
                </div>
              );
            })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center pt-4 border-t border-outline-variant/50 mt-3">
            <PaginationControl
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}

        {/* Footer actions */}
        <div className="flex gap-3 mt-5 pt-4 border-t border-outline-variant/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl border border-outline-variant text-body-sm font-semibold text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isLoading || selectedIds.size === 0}
            onClick={() => onAdd(Array.from(selectedIds))}
            className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-body-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <Spinner size="sm" />}
            Thêm {selectedIds.size > 0 ? `(${selectedIds.size})` : ""} món
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AddFoodItemModal;
