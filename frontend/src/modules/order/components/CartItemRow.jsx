import React from "react";
import { formatCurrency } from "@/utils/formatters";

const CartItemRow = ({ item, onUpdateNote, onUpdateQuantity, onRemove }) => {
  const [isNoteOpen, setIsNoteOpen] = React.useState(false);
  const canIncreaseQuantity =
    item.canIncreaseQuantity ?? item.quantity < (item.maxSelectableQuantity ?? Infinity);
  const actualRemainingQuantity = item.actualRemainingQuantity ?? 0;
  const reservedQuantity = item.reservedQuantity ?? 0;
  const hasItemNote = Boolean(String(item.note ?? "").trim());

  return (
    <div className="flex flex-col gap-1 pb-3 border-b border-outline-variant/30 last:border-b-0 group">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-body-md text-body-md text-on-surface font-semibold truncate">
            {item.name}
          </h4>

          <div className="font-body-sm text-primary font-bold mt-1">
            {formatCurrency(item.unitPrice)}
          </div>

          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-on-surface-variant">
            <span>Con lai he thong: {actualRemainingQuantity}</span>
            <span>Toi da chon: {item.maxSelectableQuantity ?? item.quantity}</span>
            {reservedQuantity > 0 && <span>Da giu trong don: {reservedQuantity}</span>}
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
            <span className="material-symbols-outlined text-[18px]">
              edit_note
            </span>
          </button>

          <div className="flex items-center gap-3 bg-surface-container rounded-lg p-1">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.foodItemId, item.quantity - 1)}
              className="w-6 h-6 flex items-center justify-center rounded-md bg-surface-container-lowest text-on-surface hover:text-primary hover:shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
            <span className="font-label-md text-label-md text-on-surface min-w-[1.25rem] text-center select-none font-semibold">
              {item.quantity}
            </span>
            <button
              type="button"
              disabled={!canIncreaseQuantity}
              onClick={() => onUpdateQuantity(item.foodItemId, item.quantity + 1)}
              className="w-6 h-6 flex items-center justify-center rounded-md bg-surface-container-lowest text-on-surface hover:text-primary hover:shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none disabled:hover:text-on-surface"
              title={
                canIncreaseQuantity
                  ? "Tang so luong"
                  : "Da dat toi da so luong con lai"
              }
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.foodItemId)}
            className="p-1 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-md transition-colors"
            title="Xoa khoi don"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
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
