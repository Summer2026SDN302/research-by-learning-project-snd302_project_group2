import { useMemo, useState } from "react";

import EmptyState from "../../../../components/data-display/EmptyState";
import FilterBar from "../../../../components/search/FilterBar";
import SearchBar from "../../../../components/search/SearchBar";
import { DAY_LABEL } from "../../constants/scheduledMenuConstants";

const formatPrice = (price) =>
  price != null
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price)
    : "";

const FoodItemPickerModal = ({
  open,
  day,
  search,
  category,
  categories,
  items,
  initialSelectedIds = [],
  onSearch,
  onCategory,
  onAdd,
  onClose,
}) => {
  const [newSelectedItems, setNewSelectedItems] = useState([]);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setNewSelectedItems([]);
    }
  }

  const categoryFilters = useMemo(
    () => [
      {
        key: "category",
        label: "Danh mục",
        options: [
          { value: "", label: "Tất cả danh mục" },
          ...categories.map((cat) => ({
            value: cat._id,
            label: cat.name,
          })),
        ],
      },
    ],
    [categories],
  );

  const label = DAY_LABEL[day] ?? day;

  const handleToggle = (item) => {
    if (initialSelectedIds.includes(item._id)) return;
    setNewSelectedItems((prev) =>
      prev.some((i) => i._id === item._id)
        ? prev.filter((i) => i._id !== item._id)
        : [...prev, item],
    );
  };

  const handleConfirmAdd = () => {
    onAdd(newSelectedItems);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex w-[500px] h-[650px] flex-col rounded-2xl bg-surface shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4 shrink-0">
          <h3 className="text-headline-sm font-bold text-on-surface">
            Thêm món — {label}
          </h3>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container flex items-center justify-center"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3 px-6 py-4 shrink-0">
          <SearchBar
            placeholder="Tìm món ăn..."
            value={search}
            onChange={onSearch}
          />

          {categories.length > 0 && (
            <FilterBar
              filters={categoryFilters}
              values={{ category }}
              onChange={(_key, value) => onCategory(value)}
              onReset={() => onCategory("")}
            />
          )}
        </div>

        {/* Item List (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 pb-2 space-y-2">
          {items.length === 0 ? (
            <EmptyState
              icon="search_off"
              title="Không tìm thấy món"
              message="Thử đổi từ khóa hoặc bộ lọc danh mục."
            />
          ) : (
            <div className="space-y-2">
              {items.map((item) => {
                const isAlreadyAdded = initialSelectedIds.includes(item._id);
                const isNewSelected = newSelectedItems.some(
                  (i) => i._id === item._id,
                );
                const isChecked = isAlreadyAdded || isNewSelected;

                return (
                  <div
                    key={item._id}
                    onClick={() => !isAlreadyAdded && handleToggle(item)}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors select-none ${
                      isAlreadyAdded
                        ? "border-outline-variant bg-surface-container-low opacity-60 cursor-not-allowed"
                        : isNewSelected
                          ? "border-primary bg-primary-container/10 cursor-pointer"
                          : "border-outline-variant bg-surface hover:border-primary cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isAlreadyAdded}
                        readOnly
                        className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-body-sm font-semibold text-on-surface flex items-center gap-2">
                          <span>{item.name}</span>
                          {isAlreadyAdded && (
                            <span className="text-[10px] font-normal text-on-surface-variant bg-outline-variant/30 px-1.5 py-0.5 rounded shrink-0">
                              Đã thêm
                            </span>
                          )}
                        </p>
                        <p className="text-label-md text-on-surface-variant mt-0.5">
                          {item.categoryName || item.categoryId?.name || ""}
                        </p>
                      </div>
                    </div>
                    <span className="ml-4 shrink-0 text-body-sm text-primary font-medium">
                      {formatPrice(item.basePrice)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-outline-variant px-6 py-4 shrink-0">
          <button
            onClick={handleConfirmAdd}
            disabled={newSelectedItems.length === 0}
            className="w-full rounded-lg bg-primary py-2.5 text-label-md font-bold text-on-primary hover:bg-surface-tint disabled:bg-outline-variant disabled:text-on-surface-variant disabled:cursor-not-allowed transition-colors"
          >
            Thêm{" "}
            {newSelectedItems.length > 0 ? `(${newSelectedItems.length})` : ""}{" "}
            món
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodItemPickerModal;
