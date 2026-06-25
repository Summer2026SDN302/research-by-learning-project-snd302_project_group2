import React from "react";
import { formatCurrency } from "@/utils/formatters";

/**
 * PosMenuGrid
 *
 * Props:
 *   items        {Array}    - List of daily menu items: { foodItemId, currentPrice, originalPrice, preparedQuantity, soldQuantity, remainingQuantity, status }
 *   onAddItem    {Function} - Callback when an item card is clicked: (foodItem, currentPrice) => void
 */
const PosMenuGrid = ({ items = [], onAddItem }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 flex-1">
        <span className="material-symbols-outlined text-[64px] text-outline/40 mb-4">
          search_off
        </span>
        <p className="text-headline-sm font-bold text-on-surface mb-2">
          Không tìm thấy món ăn
        </p>
        <p className="text-body-sm text-on-surface-variant text-center max-w-xs">
          Vui lòng điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-8 pr-2 flex-1 min-h-0">
      {items.map((item) => {
        const {
          foodItemId,
          currentPrice,
          originalPrice,
          preparedQuantity,
          soldQuantity,
          remainingQuantity,
          status,
        } = item;

        if (!foodItemId) return null;

        // Determine availability status
        const isUnavailable =
          status === "Unavailable" || remainingQuantity <= 0;
        const isLowStock = !isUnavailable && remainingQuantity <= 3;
        const isAiPricing = currentPrice !== originalPrice;

        return (
          <div
            key={foodItemId._id}
            onClick={() => {
              if (!isUnavailable) {
                onAddItem(foodItemId, currentPrice);
              }
            }}
            className={`relative bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden flex flex-col py-2 transition-all duration-200 select-none ${
              isUnavailable
                ? "opacity-60 cursor-not-allowed"
                : "cursor-pointer hover:shadow-md hover:border-primary/50 group active:scale-[0.98]"
            }`}
          >
            {/* AI Dynamic Pricing Badge */}
            {isAiPricing && !isUnavailable && (
              <div
                className="absolute top-2 right-2 bg-inverse-primary text-on-primary-fixed rounded-full p-1 shadow-sm z-10 flex items-center justify-center"
                title="Giá được tối ưu bởi AI"
              >
                <span className="material-symbols-outlined text-[16px]">
                  auto_awesome
                </span>
              </div>
            )}

            <div className="p-4 flex flex-col flex-1 min-h-[120px]">
              <h3 className="font-body-md font-semibold text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-2">
                {foodItemId.name}
              </h3>
              <p className="font-body-md text-primary font-bold mb-3">
                {formatCurrency(currentPrice)}
              </p>

              {/* Status Badge */}
              <div className="mt-auto">
                {isUnavailable ? (
                  <div className="inline-flex items-center gap-1 bg-surface-container-highest text-on-surface-variant px-2 py-1 rounded-md w-fit">
                    <span className="material-symbols-outlined text-[14px]">
                      cancel
                    </span>
                    <span className="font-label-md text-[10px] uppercase">
                      Hết hàng
                    </span>
                  </div>
                ) : isLowStock ? (
                  <div className="inline-flex items-center gap-1 bg-tertiary-container bg-opacity-20 text-tertiary px-2 py-1 rounded-md w-fit">
                    <span className="material-symbols-outlined text-[14px]">
                      warning
                    </span>
                    <span className="font-label-md text-[10px] uppercase">
                      Sắp hết ({remainingQuantity})
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 bg-secondary-container bg-opacity-20 text-secondary px-2 py-1 rounded-md w-fit">
                    <span className="material-symbols-outlined text-[14px]">
                      check_circle
                    </span>
                    <span className="font-label-md text-[10px] uppercase">
                      Có sẵn
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PosMenuGrid;
