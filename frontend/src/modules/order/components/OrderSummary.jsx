import CartItem from "./CartItem";
import Spinner from "../../../components/feedback/Spinner";
import { PAYMENT_METHOD } from "../constants/orderConstants";

/**
 * OrderSummary
 *
 * Right panel showing cart items, pricing breakdown, payment method selector,
 * and submit button. Shows empty state when cart is empty.
 *
 * Props:
 *   cart             {Array}   – [{ foodItemId, name, unitPrice, quantity }]
 *   subTotal         {number}  – Tạm tính
 *   tax              {number}  – Thuế 8%
 *   total            {number}  – Tổng cộng
 *   paymentMethod    {string}  – 'card' | 'cash'
 *   onIncrease       {fn}      – (foodItemId) => void
 *   onDecrease       {fn}      – (foodItemId) => void
 *   onClear          {fn}      – () => void
 *   onPaymentChange  {fn}      – (method) => void
 *   onSubmit         {fn}      – () => void
 *   isSubmitting     {boolean}
 */
const OrderSummary = ({
  cart = [],
  subTotal = 0,
  tax = 0,
  total = 0,
  paymentMethod = PAYMENT_METHOD.CASH,
  onIncrease,
  onDecrease,
  onClear,
  onPaymentChange,
  onSubmit,
  isSubmitting = false,
}) => {
  const isEmpty = cart.length === 0;

  return (
    <aside className="w-[380px] shrink-0 border-l border-outline-variant bg-surface-container-lowest flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center justify-between">
        <h2 className="text-headline-sm font-bold text-on-surface">
          Order Summary
        </h2>
        {!isEmpty && (
          <button
            type="button"
            onClick={onClear}
            className="p-2 rounded-lg text-error hover:bg-error/10 transition-colors"
            aria-label="Xóa giỏ hàng"
            title="Xóa tất cả"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        )}
      </div>

      {/* Cart items or empty state */}
      <div className="flex-1 overflow-y-auto px-6">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-[40px] text-outline/50">
                shopping_cart
              </span>
            </div>
            <p className="text-body-md font-semibold text-on-surface mb-2">
              Chưa có món nào được chọn
            </p>
            <p className="text-body-sm text-on-surface-variant max-w-[220px]">
              Vui lòng chọn món ăn từ danh sách bên trái để bắt đầu tạo đơn hàng mới.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/40">
            {cart.map((item) => (
              <CartItem
                key={item.foodItemId}
                item={item}
                onIncrease={() => onIncrease?.(item.foodItemId)}
                onDecrease={() => onDecrease?.(item.foodItemId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer: pricing + payment + submit */}
      <div className="px-6 pb-6 pt-4 border-t border-outline-variant/40 space-y-4">
        {/* Pricing breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-body-sm text-on-surface-variant">
            <span>Tạm tính</span>
            <span>{subTotal.toLocaleString("vi-VN")} đ</span>
          </div>
          <div className="flex justify-between text-body-sm text-on-surface-variant">
            <span>Thuế (8%)</span>
            <span>{tax.toLocaleString("vi-VN")} đ</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-outline-variant/40">
            <span className="text-body-md font-bold text-on-surface">Tổng cộng</span>
            <span className="text-headline-sm font-bold text-primary">
              {total.toLocaleString("vi-VN")} đ
            </span>
          </div>
        </div>

        {/* Payment method (UI only, not sent to BE) */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onPaymentChange?.(PAYMENT_METHOD.CARD)}
            className={`
              flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all
              ${
                paymentMethod === PAYMENT_METHOD.CARD
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-outline-variant/60 text-on-surface-variant hover:border-primary/30"
              }
            `}
          >
            <span className="material-symbols-outlined text-[24px]">credit_card</span>
            <span className="text-label-md font-semibold">Thẻ</span>
          </button>
          <button
            type="button"
            onClick={() => onPaymentChange?.(PAYMENT_METHOD.CASH)}
            className={`
              flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all
              ${
                paymentMethod === PAYMENT_METHOD.CASH
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-outline-variant/60 text-on-surface-variant hover:border-primary/30"
              }
            `}
          >
            <span className="material-symbols-outlined text-[24px]">payments</span>
            <span className="text-label-md font-semibold">Tiền mặt</span>
          </button>
        </div>

        {/* Submit button */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={isEmpty || isSubmitting}
          className={`
            w-full flex items-center justify-center gap-2 py-4 rounded-xl
            text-body-md font-bold transition-all duration-200
            ${
              isEmpty || isSubmitting
                ? "bg-outline/20 text-outline cursor-not-allowed"
                : "bg-primary text-on-primary shadow-md hover:opacity-90 active:scale-[0.98]"
            }
          `}
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" />
              Đang xử lý...
            </>
          ) : (
            <>
              Thanh toán
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default OrderSummary;
