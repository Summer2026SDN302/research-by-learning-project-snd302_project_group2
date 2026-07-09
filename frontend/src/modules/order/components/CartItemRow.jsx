import { useState } from "react";
import { formatCurrency } from "@/utils/formatters";

/**
 * CartItemRow
 *
 * Props:
 *   item             {Object}   - Cart item: { foodItemId, name, unitPrice, quantity }
 *   onUpdateQuantity {Function} - (foodItemId, newQty) => void
 *   onRemove         {Function} - (foodItemId) => void
 *   onUpdateNote     {Function} - (foodItemId, newNote) => void — BE chưa có field note cho item
 */
const CartItemRow = ({ item, onUpdateQuantity, onUpdateNote, onRemove }) => {
  const [localQty, setLocalQty] = useState(item.quantity);
  const [prevQty, setPrevQty] = useState(item.quantity);

  if (item.quantity !== prevQty) {
    setPrevQty(item.quantity);
    setLocalQty(item.quantity);
  }

  const handleInputChange = (e) => {
    const valStr = e.target.value;
    setLocalQty(valStr);
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      onUpdateQuantity(item.foodItemId, parsed);
    }
  };

  const handleInputBlur = () => {
    const parsed = parseInt(localQty, 10);
    if (isNaN(parsed) || parsed < 1) {
      setLocalQty(1);
      onUpdateQuantity(item.foodItemId, 1);
    }
  };

  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteValue, setNoteValue] = useState(item.note || "");
  const handleNoteSave = () => {
    onUpdateNote(item.foodItemId, noteValue);
    setShowNoteInput(false);
  };
  const handleNoteCancel = () => {
    setNoteValue(item.note || "");
    setShowNoteInput(false);
  };

  return (
    <div className="flex flex-col gap-0.5 pb-2 border-b border-outline-variant/30 last:border-b-0 group">
      <div className="flex justify-between items-center gap-4">
        {/* Item Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-body-sm text-body-sm text-on-surface font-semibold truncate">
            {item.name}
          </h4>

          {item.note && !showNoteInput && (
            <p className="text-[11px] text-primary italic font-medium mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">
                edit_note
              </span>
              {item.note}
            </p>
          )}

          <div className="font-body-xs text-on-surface-variant mt-0.5 text-[12px] font-medium">
            {item.quantity} × {formatCurrency(item.unitPrice)}
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {!showNoteInput && (
            <button
              type="button"
              onClick={() => setShowNoteInput(true)}
              className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Thêm ghi chú"
            >
              <span className="material-symbols-outlined text-[16px]">
                edit_note
              </span>
            </button>
          )}

          {/* Quantity Selector + Line Total underneath */}
          <div className="flex flex-col items-center gap-1">
            {/* Quantity selector */}
            <div className="flex items-center gap-2 bg-surface-container rounded-lg p-0.5">
              <button
                type="button"
                onClick={() =>
                  onUpdateQuantity(item.foodItemId, item.quantity - 1)
                }
                className="w-5 h-5 flex items-center justify-center rounded-lg bg-surface-container-lowest text-on-surface hover:text-primary hover:shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[13px]">
                  remove
                </span>
              </button>
              <input
                type="number"
                min="1"
                value={localQty}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="font-label-sm text-sm text-on-surface w-6 text-center font-semibold bg-transparent focus:outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() =>
                  onUpdateQuantity(item.foodItemId, item.quantity + 1)
                }
                className="w-5 h-5 flex items-center justify-center rounded-lg bg-surface-container-lowest text-on-surface hover:text-primary hover:shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[13px]">
                  add
                </span>
              </button>
            </div>

            {/* Line Total */}
            <div className="text-[12px] font-body-xs text-primary font-bold">
              {formatCurrency(item.unitPrice * item.quantity)}
            </div>
          </div>

          {/* Remove Button */}
          <button
            type="button"
            onClick={() => onRemove(item.foodItemId)}
            className="p-1 text-error hover:text-error hover:bg-error-container/20 rounded-md transition-colors flex items-center justify-center"
            title="Xóa khỏi đơn"
          >
            <span className="material-symbols-outlined text-[16px]">
              delete
            </span>
          </button>
        </div>
      </div>

      {showNoteInput && (
        <div className="flex gap-2 mt-2 items-center bg-surface-container-low p-2 rounded-lg border border-outline-variant/40">
          <input
            type="text"
            placeholder="Ghi chú món ăn..."
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            className="flex-1 bg-surface-container-lowest border border-outline-variant/60 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface"
          />
          <button
            type="button"
            onClick={handleNoteSave}
            className="px-2.5 py-1 bg-primary text-on-primary rounded-md text-xs font-semibold hover:opacity-95"
          >
            Lưu
          </button>
          <button
            type="button"
            onClick={handleNoteCancel}
            className="px-2.5 py-1 bg-surface-container text-on-surface rounded-md text-xs font-semibold hover:bg-surface-container-high"
          >
            Hủy
          </button>
        </div>
      )}
    </div>
  );
};

export default CartItemRow;
