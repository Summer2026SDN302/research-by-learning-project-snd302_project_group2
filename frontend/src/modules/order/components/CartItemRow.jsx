import React from "react";
import { formatCurrency } from "@/utils/formatters";

/**
 * CartItemRow
 *
 * Props:
 *   item             {Object}   - Cart item: { foodItemId, name, unitPrice, quantity }
 *   onUpdateQuantity {Function} - (foodItemId, newQty) => void
 *   onRemove         {Function} - (foodItemId) => void
 *   onUpdateNote     {Function} - (foodItemId, newNote) => void
 */
const CartItemRow = ({ item, onUpdateQuantity, onUpdateNote, onRemove }) => {
  const [isNoteOpen, setIsNoteOpen] = React.useState(false);
  const canIncreaseQuantity =
    item.canIncreaseQuantity ?? item.quantity < (item.maxSelectableQuantity ?? Infinity);
  const hasItemNote = Boolean(String(item.note ?? "").trim());

  return (
    <div className="flex flex-col gap-1 pb-3 border-b border-outline-variant/30 last:border-b-0 group">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-body-sm text-body-sm text-on-surface font-semibold break-words">
            {item.name}
          </h4>

          <div className="font-body-xs text-on-surface-variant mt-0.5 text-[12px] font-medium">
            {item.quantity} × {formatCurrency(item.unitPrice)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={`Ghi chu rieng cho ${item.name}`}
            aria-expanded={isNoteOpen}
            onClick={() => setIsNoteOpen((prev) => !prev)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
              isNoteOpen || hasItemNote
                ? "border-primary/20 bg-primary-container/70 text-primary"
                : "border-transparent bg-surface-container text-on-surface-variant hover:text-primary"
            }`}
            title={hasItemNote ? "Da co ghi chu rieng" : "Them ghi chu rieng"}
          >
            <span className="material-symbols-outlined text-[16px]">
              edit_note
            </span>
          </button>

          <div className="flex items-center gap-2 bg-surface-container rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.foodItemId, item.quantity - 1)}
              className="w-5 h-5 flex items-center justify-center rounded-lg bg-surface-container-lowest text-on-surface hover:text-primary hover:shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[13px]">remove</span>
            </button>
            <span className="font-label-sm text-sm text-on-surface w-6 text-center font-semibold bg-transparent border-none select-none">
              {item.quantity}
            </span>
            <button
              type="button"
              disabled={!canIncreaseQuantity}
              onClick={() => onUpdateQuantity(item.foodItemId, item.quantity + 1)}
              className="w-5 h-5 flex items-center justify-center rounded-lg bg-surface-container-lowest text-on-surface hover:text-primary hover:shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[13px]">add</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.foodItemId)}
            className="p-1 text-error hover:text-error hover:bg-error-container/20 rounded-md transition-colors flex items-center justify-center"
            title="Xoa khoi don"
          >
            <span className="material-symbols-outlined text-[16px]">
              delete
            </span>
          </button>
        </div>
      </div>

      {isNoteOpen && (
        <div className="pr-9 pt-2">
          <label
            htmlFor={`item-note-${item.foodItemId}`}
            className="sr-only"
          >
            Ghi chu rieng cho {item.name}
          </label>
          <input
            id={`item-note-${item.foodItemId}`}
            type="text"
            value={item.note ?? ""}
            onChange={(event) => onUpdateNote(item.foodItemId, event.target.value)}
            placeholder="Vi du: it da, khong hanh, tach rieng..."
            className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-low px-3 py-2 text-[13px] text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}
    </div>
  );
};

export default CartItemRow;
