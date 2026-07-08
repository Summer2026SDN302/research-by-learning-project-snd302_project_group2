import CartItemRow from "./CartItemRow";
import { formatCurrency } from "@/utils/formatters";

const OrderSummaryCard = ({
  cart,
  totals,
  orderNotes,
  onOrderNotesChange,
  onUpdateNote,
  onUpdateQuantity,
  onRemove,
  onClearCart,
  onCheckout,
  isSubmitting = false,
}) => {
  const orderCaption = `${cart.items.length} mon trong gio`;
  const submitLabel = "Thanh toan";
  const loadingLabel = "Dang xu ly giao dich...";

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-soft border border-outline-variant p-6 flex flex-col h-full overflow-hidden select-none">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-outline-variant/60 shrink-0">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
            Chi tiet don hang
          </h2>
          <p className="font-label-md text-label-md text-on-surface-variant mt-0.5">
            {orderCaption}
          </p>
        </div>
        {cart.items.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="text-error hover:bg-error-container/20 p-2 rounded-full transition-colors flex items-center justify-center"
            title="Xoa gio hang"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 scrollbar-thin">
        {cart.items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <span className="material-symbols-outlined text-[48px] text-outline/55 mb-2">
              shopping_cart
            </span>
            <p className="text-body-sm text-on-surface-variant">Gio hang trong</p>
            <p className="text-[12px] text-on-surface-variant/80 mt-1 max-w-[200px]">
              Nhap chon cac mon an co san ben trai de them vao don.
            </p>
          </div>
        ) : (
          cart.items.map((item) => (
            <CartItemRow
              key={item.foodItemId}
              item={item}
              onUpdateNote={onUpdateNote}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
            />
          ))
        )}
      </div>

      {cart.items.length > 0 && (
        <div className="mb-4 shrink-0">
          <label
            htmlFor="order-notes"
            className="font-label-md text-on-surface-variant block mb-1 font-semibold"
          >
            Ghi chu chung
          </label>
          <input
            id="order-notes"
            type="text"
            placeholder="So ban, mang di, yeu cau dac biet..."
            value={orderNotes}
            onChange={(event) => onOrderNotesChange(event.target.value)}
            disabled={isSubmitting}
            className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
      )}

      {cart.items.length > 0 && (
        <div className="pt-4 border-t border-outline-variant/60 space-y-2.5 mb-4 shrink-0">
          <div className="flex justify-between items-center">
            <span className="font-body-sm text-on-surface-variant">Tam tinh</span>
            <span className="font-body-sm text-on-surface font-medium">
              {formatCurrency(totals.subtotal)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-outline-variant/30">
            <span className="font-body-md font-bold text-on-surface">
              Tong cong
            </span>
            <span className="font-headline-sm text-headline-sm text-primary font-bold">
              {formatCurrency(totals.totalAmount)}
            </span>
          </div>
        </div>
      )}

      {cart.items.length > 0 && (
        <div className="space-y-3 shrink-0">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCheckout}
            className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-body-md font-bold shadow-md hover:shadow-lg hover:opacity-95 transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>{loadingLabel}</span>
            ) : (
              <>
                {submitLabel}
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderSummaryCard;
