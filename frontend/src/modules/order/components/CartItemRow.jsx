import React from "react";
import { formatCurrency } from "@/utils/formatters";

/**
 * CartItemRow
 *
 * Props:
 *   item             {Object}   - Cart item: { foodItemId, name, unitPrice, quantity }
 *   onUpdateQuantity {Function} - (foodItemId, newQty) => void
 *   onRemove         {Function} - (foodItemId) => void
 *
 * [CHƯA CÓ BE] Props tạm ẩn (BE chưa hỗ trợ):
 *   onUpdateNote     {Function} - (foodItemId, newNote) => void — BE chưa có field note cho item
 */
const CartItemRow = ({ item, onUpdateQuantity, /* [CHƯA CÓ BE] onUpdateNote, */ onRemove }) => {
  // [CHƯA CÓ BE] Note state — BE chưa hỗ trợ field note cho từng item
  // const [showNoteInput, setShowNoteInput] = useState(false);
  // const [noteValue, setNoteValue] = useState(item.note || "");
  // const handleNoteSave = () => { onUpdateNote(item.foodItemId, noteValue); setShowNoteInput(false); };
  // const handleNoteCancel = () => { setNoteValue(item.note || ""); setShowNoteInput(false); };

  return (
    <div className="flex flex-col gap-1 pb-3 border-b border-outline-variant/30 last:border-b-0 group">
      <div className="flex justify-between items-start gap-4">
        {/* Item Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-body-md text-body-md text-on-surface font-semibold truncate">
            {item.name}
          </h4>

          {/* [CHƯA CÓ BE] Display Note — BE chưa hỗ trợ field note
          {item.note && !showNoteInput && (
            <p className="text-[12px] text-primary italic font-medium mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">edit_note</span>
              {item.note}
            </p>
          )} */}

          <div className="font-body-sm text-primary font-bold mt-1">
            {formatCurrency(item.unitPrice)}
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* [CHƯA CÓ BE] Note Toggle Button — BE chưa hỗ trợ
          {!showNoteInput && (
            <button
              type="button"
              onClick={() => setShowNoteInput(true)}
              className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Thêm ghi chú"
            >
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
            </button>
          )} */}

          {/* Quantity selector */}
          <div className="flex items-center gap-3 bg-surface-container rounded-lg p-1">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.foodItemId, item.quantity - 1)}
              className="w-6 h-6 flex items-center justify-center rounded-md bg-surface-container-lowest text-on-surface hover:text-primary hover:shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
            <span className="font-label-md text-label-md text-on-surface w-4 text-center select-none font-semibold">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.foodItemId, item.quantity + 1)}
              className="w-6 h-6 flex items-center justify-center rounded-md bg-surface-container-lowest text-on-surface hover:text-primary hover:shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>

          {/* Remove Button */}
          <button
            type="button"
            onClick={() => onRemove(item.foodItemId)}
            className="p-1 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-md transition-colors"
            title="Xóa khỏi đơn"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      {/* [CHƯA CÓ BE] Expandable Note Input — BE chưa hỗ trợ field note cho item
      {showNoteInput && (
        <div className="flex gap-2 mt-2 items-center bg-surface-container-low p-2 rounded-lg border border-outline-variant/40">
          <input type="text" ... />
          <button onClick={handleNoteSave}>Lưu</button>
          <button onClick={handleNoteCancel}>Hủy</button>
        </div>
      )} */}
    </div>
  );
};

export default CartItemRow;
