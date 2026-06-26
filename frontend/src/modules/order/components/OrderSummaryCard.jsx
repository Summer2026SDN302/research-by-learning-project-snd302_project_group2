import CartItemRow from "./CartItemRow";
import { formatCurrency } from "@/utils/formatters";

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
 *
 * [CHƯA CÓ BE] Props tạm ẩn (BE chưa hỗ trợ):
 *   orderNotes         {string}   - Ghi chú chung cho đơn — BE chưa có field notes
 *   onOrderNotesChange {Function} - (value) => void
 *   onUpdateNote       {Function} - (foodItemId, note) => void — BE chưa có field note cho item
 */
const OrderSummaryCard = ({
  cart,
  totals,
  // [CHƯA CÓ BE] orderNotes,
  // [CHƯA CÓ BE] onOrderNotesChange,
  onUpdateQuantity,
  // [CHƯA CÓ BE] onUpdateNote,
  onRemove,
  onClearCart,
  onCheckout,
  isSubmitting = false,
}) => (
  <div className="bg-surface-container-lowest rounded-2xl shadow-soft border border-outline-variant p-6 flex flex-col h-full overflow-hidden select-none">
    {/* Order Header */}
    <div className="flex justify-between items-center mb-4 pb-3 border-b border-outline-variant/60 shrink-0">
      <div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
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
    <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 scrollbar-thin">
      {cart.items.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
          <span className="material-symbols-outlined text-[48px] text-outline/55 mb-2">
            shopping_cart
          </span>
          <p className="text-body-sm text-on-surface-variant">Giỏ hàng trống</p>
          <p className="text-[12px] text-on-surface-variant/80 mt-1 max-w-[200px]">
            Nhấp chọn các món ăn có sẵn bên trái để thêm vào đơn.
          </p>
        </div>
      ) : (
        cart.items.map((item) => (
          <CartItemRow
            key={item.foodItemId}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            // [CHƯA CÓ BE] onUpdateNote — BE chưa hỗ trợ field note cho item
            onRemove={onRemove}
          />
        ))
      )}
    </div>

    {/* [CHƯA CÓ BE] Order Notes — BE chưa hỗ trợ field notes cho order */}
    {/* {cart.items.length > 0 && (
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
    )} */}

    {/* Calculations & Pricing */}
    {cart.items.length > 0 && (
      <div className="pt-4 border-t border-outline-variant/60 space-y-2.5 mb-4 shrink-0">
        <div className="flex justify-between items-center">
          <span className="font-body-sm text-on-surface-variant">Tạm tính</span>
          <span className="font-body-sm text-on-surface font-medium">
            {formatCurrency(totals.subtotal)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-body-sm text-on-surface-variant">
            Thuế ({(totals.taxRate * 100).toFixed(0)}%)
          </span>
          <span className="font-body-sm text-on-surface font-medium">
            {formatCurrency(totals.taxAmount)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-outline-variant/30">
          <span className="font-body-md font-bold text-on-surface">Tổng cộng</span>
          <span className="font-headline-sm text-headline-sm text-primary font-bold">
            {formatCurrency(totals.totalAmount)}
          </span>
        </div>
      </div>
    )}

    {/* Checkout Action Panel */}
    {cart.items.length > 0 && (
      <div className="space-y-3 shrink-0">
        {/* [CHƯA CÓ BE] Nút chọn phương thức thanh toán (Thẻ / Tiền mặt) — module Payment chưa có
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => onCheckout("Card")} ...>Thẻ</button>
          <button onClick={() => onCheckout("Cash")} ...>Tiền mặt</button>
        </div> */}

        {/* Nút tạo đơn — gọi trực tiếp handleSubmitOrder (không mở PaymentModal) */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCheckout}
          className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-body-md font-bold shadow-md hover:shadow-lg hover:opacity-95 transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Đang xử lý đơn...</span>
          ) : (
            <>
              Tạo đơn hàng
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

export default OrderSummaryCard;
