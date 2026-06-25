
/**
 * PaymentMethodList
 *
 * Props:
 *   selectedMethod     {string}   - Currently selected payment method: 'Cash' | 'Card' | 'QR'
 *   onSelectMethod     {Function} - (method) => void
 */
const PaymentMethodList = ({ selectedMethod, onSelectMethod }) => {
  return (
    <div className="space-y-4 select-none">
      {/* Cash Option */}
      <button
        type="button"
        onClick={() => onSelectMethod("Cash")}
        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left outline-none ${
          selectedMethod === "Cash"
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-outline-variant/60 bg-white hover:border-primary"
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-3xl">payments</span>
        </div>
        <div className="min-w-0">
          <p className="font-body-md font-bold text-on-surface">Tiền mặt</p>
          <p className="text-on-surface-variant text-xs truncate">
            Thanh toán trực tiếp bằng tiền mặt
          </p>
        </div>
      </button>

      {/* Card Option */}
      <button
        type="button"
        onClick={() => onSelectMethod("Card")}
        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left outline-none ${
          selectedMethod === "Card"
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-outline-variant/60 bg-white hover:border-primary"
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
          <span className="material-symbols-outlined text-3xl">credit_card</span>
        </div>
        <div className="min-w-0">
          <p className="font-body-md font-bold text-on-surface">Thẻ ATM/Credit</p>
          <p className="text-on-surface-variant text-xs truncate">
            Visa, Mastercard, Napas nội địa
          </p>
        </div>
      </button>

      {/* QR Option */}
      <button
        type="button"
        onClick={() => onSelectMethod("QR")}
        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left outline-none ${
          selectedMethod === "QR"
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-outline-variant/60 bg-white hover:border-primary"
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0">
          <span className="material-symbols-outlined text-3xl">qr_code_2</span>
        </div>
        <div className="min-w-0">
          <p className="font-body-md font-bold text-on-surface">Chuyển khoản QR</p>
          <p className="text-on-surface-variant text-xs truncate">
            Quét mã VietQR chuyển khoản nhanh
          </p>
        </div>
      </button>
    </div>
  );
};

export default PaymentMethodList;
