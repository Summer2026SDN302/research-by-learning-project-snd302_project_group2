/**
 * CartItem
 *
 * A single line item in the order summary cart.
 * Shows name, unit price, quantity controls (+/-), and line total.
 *
 * Props:
 *   item        {object}  – { foodItemId, name, unitPrice, quantity }
 *   onIncrease  {fn}      – () => void
 *   onDecrease  {fn}      – () => void (removes item if qty reaches 0)
 */
const CartItem = ({ item, onIncrease, onDecrease }) => {
  const lineTotal = item.unitPrice * item.quantity;

  return (
    <div className="flex items-start justify-between gap-3 py-3">
      {/* Left: name + unit price */}
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-semibold text-on-surface truncate">
          {item.name}
        </p>
        <p className="text-label-md text-on-surface-variant mt-0.5">
          {item.unitPrice.toLocaleString("vi-VN")}đ
        </p>
      </div>

      {/* Center: quantity controls */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onDecrease}
          className="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
          aria-label="Giảm số lượng"
        >
          <span className="material-symbols-outlined text-[18px]">remove</span>
        </button>
        <span className="w-8 text-center text-body-sm font-bold text-on-surface">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={onIncrease}
          className="w-8 h-8 rounded-lg border border-primary/30 bg-primary/5 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
          aria-label="Tăng số lượng"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      </div>

      {/* Right: line total */}
      <p className="text-body-sm font-bold text-on-surface w-20 text-right shrink-0">
        {lineTotal.toLocaleString("vi-VN")}đ
      </p>
    </div>
  );
};

export default CartItem;
