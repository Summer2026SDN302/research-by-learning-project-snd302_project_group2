import { useMemo } from "react";

import EmptyState from "../../../components/data-display/EmptyState";
import FilterBar from "../../../components/search/FilterBar";
import SearchBar from "../../../components/search/SearchBar";
import { DAY_LABEL } from "../constants/scheduledMenuConstants";

const formatPrice = (price) =>
  price != null
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
    : "";

const FoodItemPickerModal = ({
  open,
  day,
  search,
  category,
  categories,
  items,
  onSearch,
  onCategory,
  onSelect,
  onClose,
}) => {
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

  if (!open) return null;

  const label = DAY_LABEL[day] ?? day;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex w-full max-w-lg flex-col rounded-2xl bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <h3 className="text-headline-sm font-bold text-on-surface">
            Thêm món — {label}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-3 px-6 py-4">
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

        <div className="max-h-72 overflow-y-auto px-6 pb-2">
          {items.length === 0 ? (
            <EmptyState
              icon="search_off"
              title="Không tìm thấy món"
              message="Thử đổi từ khóa hoặc bộ lọc danh mục."
            />
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <button
                  key={item._id}
                  onClick={() => onSelect(item)}
                  className="flex w-full items-center justify-between rounded-lg border border-outline-variant bg-surface px-4 py-3 text-left transition-colors hover:border-primary hover:bg-primary-container/10"
                >
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface">
                      {item.name}
                    </p>
                    <p className="text-label-md text-on-surface-variant">
                      {item.categoryName || item.categoryId?.name || ""}
                    </p>
                  </div>
                  <span className="ml-4 shrink-0 text-body-sm text-primary">
                    {formatPrice(item.basePrice)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-outline-variant px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-outline-variant py-2 text-label-md text-on-surface-variant hover:bg-surface-container"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodItemPickerModal;
