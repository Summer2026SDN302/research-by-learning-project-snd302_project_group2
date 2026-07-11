import CartItemRow from "./CartItemRow";
import { formatCurrency } from "@/utils/formatters";
import EmptyState from "@/components/data-display/EmptyState";

/**
 * OrderSummaryCard
 *
 * Props:
 *   cart               {Object}   - Cart state: { items }
 *   totals             {Object}   - Computed totals: { subtotal, taxRate, taxAmount, totalAmount }
 *   onUpdateQuantity   {Function} - (foodItemId, qty) => void
 *   onRemove           {Function} - (foodItemId) => void
 *   onClearCart        {Function} - () => void
 *   onCheckout         {Function} - () => void — tạo đơn trực tiếp (BE chưa có Payment module)
 *   isSubmitting       {boolean}  - Loading state during API order creation
 *   orderNotes         {string}   - Ghi chú chung cho đơn — BE chưa có field notes
 *   onOrderNotesChange {Function} - (value) => void
 *   onUpdateNote       {Function} - (foodItemId, note) => void — BE chưa có field note cho item
 */
const OrderSummaryCard = ({
  cart,
  totals,
  orderNotes,
  onOrderNotesChange,
  onUpdateQuantity,
  onUpdateNote,
  onRemove,
  onClearCart,
  onCheckout,
  isSubmitting = false,
}) => (
  <div className="bg-surface-container-lowest rounded-2xl shadow-soft border border-outline-variant p-6 flex flex-col h-full overflow-hidden select-none">
    {/* Order Header */}
    <div className="flex justify-between items-center mb-3 pb-2 border-b border-outline-variant/60 shrink-0">
      <div>
        <h2 className="font-title-large text-title-large text-on-surface font-bold">
          Chi tiết đơn hàng
        </h2>
        <p className="font-label-md text-label-md text-on-surface-variant mt-0.5">
          {cart.items.length} món trong giỏ
        </p>
      </div>
      {cart.items.length > 0 && (
        <button
          type="button"
          onClick={onClearCart}
          className="text-error hover:bg-error-container/20 p-2 rounded-full transition-colors flex items-center justify-center"
          title="Xóa giỏ hàng"
        >
          <span className="material-symbols-outlined text-[20px]">delete</span>
        </button>
      )}
    </div>

    {/* Cart Items List */}
    <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-3 scrollbar-thin">
      {cart.items.length === 0 ? (
        <EmptyState
          icon="shopping_cart"
          title="Giỏ hàng trống"
          message="Nhấp chọn các món ăn có sẵn bên trái để thêm vào đơn."
          compact={true}
        />
      ) : (
        cart.items.map((item) => (
          <CartItemRow
            key={item.foodItemId}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onUpdateNote={onUpdateNote}
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
          Ghi chú chung
        </label>
        <input
          id="order-notes"
          type="text"
          placeholder="Số bàn, mang đi, yêu cầu đặc biệt..."
          value={orderNotes}
          onChange={(e) => onOrderNotesChange(e.target.value)}
          disabled={isSubmitting}
          className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
        />
      </div>
    )}

    {/* Calculations & Pricing */}
    {cart.items.length > 0 && (
      <div className="pt-3 border-t border-outline-variant/60 space-y-2 mb-3 shrink-0">
        <div className="flex justify-between items-center">
          <span className="font-body-md font-bold text-on-surface">
            Tổng cộng
          </span>
          <span className="font-title-large text-title-large text-primary font-bold">
            {formatCurrency(totals.totalAmount)}
          </span>
        </div>
      </div>
    )}

    {/* Checkout Action Panel */}
    {cart.items.length > 0 && (
      <div className="space-y-3 shrink-0">
        {/* Nút thanh toán — gọi onCheckout (mở PaymentModal) */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCheckout}
          className="w-full bg-primary text-on-primary py-3 rounded-xl font-body-md font-bold shadow-md hover:shadow-lg hover:opacity-95 transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Đang xử lý...</span>
          ) : (
            <>
              Thanh toán
              <span className="material-symbols-outlined text-[20px]">
                payments
              </span>
            </>
          )}
        </button>
      </div>
    )}
  </div>
);

export default OrderSummaryCard;
