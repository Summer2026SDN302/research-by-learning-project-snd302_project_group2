import { MENU_ITEM_STATUS } from "../constants/orderConstants";

/**
 * MenuItemCard
 *
 * Displays a single food item from the daily menu as a clickable card.
 * Unavailable items are dimmed and non-clickable.
 *
 * Props:
 *   item           {object}  – daily menu item (has foodItemId, currentPrice, status, remainingQuantity)
 *   isSelected     {boolean} – highlight border when item is already in cart
 *   onAdd          {fn}      – () => void, called when clicking an available card
 */
const MenuItemCard = ({ item, isSelected = false, onAdd }) => {
  const foodItem = item.foodItemId;
  const name = foodItem?.name ?? "Món ăn";
  const price = item.currentPrice ?? 0;
  const status = item.status;
  const remaining = item.remainingQuantity ?? 0;

  const isAvailable = status === MENU_ITEM_STATUS.AVAILABLE;
  const isLowStock = isAvailable && remaining > 0 && remaining <= 5;

  const handleClick = () => {
    if (isAvailable && onAdd) onAdd(item);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isAvailable}
      className={`
        relative text-left w-full rounded-2xl border p-5
        transition-all duration-200 group
        ${
          !isAvailable
            ? "opacity-50 cursor-not-allowed border-outline-variant/40 bg-surface-container-low"
            : isSelected
              ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
              : "border-outline-variant/60 bg-surface-container-lowest shadow-soft hover:shadow-md hover:border-primary/40 cursor-pointer"
        }
      `}
    >
      {/* Status badge */}
      <div className="mb-3">
        {isAvailable && !isLowStock && (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 text-[11px] font-semibold text-secondary uppercase tracking-wide">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            Có sẵn
          </span>
        )}
        {isLowStock && (
          <span className="inline-flex items-center gap-1 rounded-full bg-tertiary/10 px-2.5 py-1 text-[11px] font-semibold text-tertiary uppercase tracking-wide">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            Sắp hết ({remaining})
          </span>
        )}
        {!isAvailable && (
          <span className="inline-flex items-center gap-1 rounded-full bg-outline/10 px-2.5 py-1 text-[11px] font-semibold text-outline uppercase tracking-wide">
            <span className="material-symbols-outlined text-[14px]">cancel</span>
            Hết hàng
          </span>
        )}
      </div>

      {/* Food name */}
      <h3 className="text-body-md font-semibold text-on-surface leading-snug mb-2 line-clamp-2 min-h-[48px]">
        {name}
      </h3>

      {/* Price */}
      <p className="text-body-sm font-bold text-primary">
        {price.toLocaleString("vi-VN")}đ
      </p>
    </button>
  );
};

export default MenuItemCard;
