import { formatCurrency } from "@/utils/formatters";
import EmptyState from "@/components/data-display/EmptyState";

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
      <EmptyState
        icon="search_off"
        title="Không tìm thấy món ăn"
        message="Vui lòng điều chỉnh bộ lọc hoặc từ khóa tìm kiếm."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 content-start gap-4 overflow-y-auto max-h-[calc(100vh-285px)] pb-8 pr-2 flex-1 min-h-0">
      {items.map((item) => {
        const {
          foodItemId,
          currentPrice,
          remainingQuantity,
          status,
          priceHistory,
        } = item;

        if (!foodItemId) return null;

        // Determine availability status
        const isUnavailable =
          status === "Unavailable" || remainingQuantity <= 0;
        const isLowStock = !isUnavailable && remainingQuantity <= 3;
        const isAiPricing =
          Array.isArray(priceHistory) &&
          priceHistory.length > 0 &&
          priceHistory[priceHistory.length - 1]?.source === "AI";

        return (
          <div
            key={foodItemId._id}
            onClick={() => {
              if (!isUnavailable) {
                onAddItem(foodItemId, currentPrice);
              }
            }}
            className={`relative w-full h-30 bg-surface-container-lowest rounded-2xl border border-outline-variant p-3 flex flex-col items-center text-center transition-all duration-200 select-none ${
              isUnavailable
                ? "opacity-60 cursor-not-allowed"
                : "cursor-pointer hover:shadow-md hover:border-primary/50 group active:scale-[0.98]"
            }`}
          >
            {/* AI Dynamic Pricing Badge */}
            {isAiPricing && !isUnavailable && (
              <div
                className="absolute top-1 right-1 bg-inverse-primary text-on-primary-fixed rounded-full p-0.5 shadow-sm z-10 flex items-center justify-center"
                title="Giá được tối ưu bởi AI"
              >
                <span className="material-symbols-outlined text-[14px]">
                  auto_awesome
                </span>
              </div>
            )}

            <h3 className="font-body-md text-body-md text-on-surface font-semibold group-hover:text-primary transition-colors break-words mt-2 flex-1 w-full">
              {foodItemId.name}
            </h3>

            {/* Status Badge */}
            <div className="w-fit">
              {isUnavailable ? (
                <span className="inline-flex items-center gap-1 bg-error-container bg-opacity-20 text-error px-2 py-0.5 rounded-full text-[10px] font-medium uppercase">
                  Hết hàng
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1 bg-tertiary-container bg-opacity-20 text-tertiary px-2 py-0.5 rounded-full text-[10px] font-medium uppercase">
                  Sắp hết: {remainingQuantity}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-secondary-container bg-opacity-20 text-secondary px-2 py-0.5 rounded-full text-[10px] font-medium uppercase">
                  Còn: {remainingQuantity}
                </span>
              )}
            </div>

            {/* Card Footer */}
            <div className="flex justify-center mt-auto pt-1 w-full">
              {/* Price */}
              <span className="font-body-md text-body-md text-primary font-bold">
                {formatCurrency(currentPrice)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PosMenuGrid;
