const PAYMENT_METHODS = [
  {
    value: "Cash",
    label: "Tiền mặt",
    description: "Thanh toán trực tiếp bằng tiền mặt",
    icon: "payments",
    tone: "bg-primary/10 text-primary",
  },
  {
    value: "Card",
    label: "Thẻ ATM/Credit",
    description: "Visa, Mastercard, Napas nội địa",
    icon: "credit_card",
    tone: "bg-secondary/10 text-secondary",
  },
  {
    value: "QR",
    label: "Chuyển khoản QR",
    description: "Quét mã VietQR chuyển khoản nhanh",
    icon: "qr_code_2",
    tone: "bg-tertiary/10 text-tertiary",
  },
];

/**
 * PaymentMethodList
 *
 * Props:
 *   selectedMethod     {string}   - Currently selected payment method: 'Cash' | 'Card' | 'QR'
 *   onSelectMethod     {Function} - (method) => void
 */
const PaymentMethodList = ({ selectedMethod, onSelectMethod }) => (
  <div className="grid gap-4 auto-rows-fr select-none">
    {PAYMENT_METHODS.map((method) => (
      <button
        key={method.value}
        type="button"
        onClick={() => onSelectMethod(method.value)}
        className={`w-full h-full min-h-[6.75rem] flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left outline-none ${
          selectedMethod === method.value
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-outline-variant/60 bg-white hover:border-primary"
        }`}
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${method.tone}`}
        >
          <span className="material-symbols-outlined text-3xl">{method.icon}</span>
        </div>
        <div className="min-w-0">
          <p className="font-body-md font-bold text-on-surface">{method.label}</p>
          <p className="text-on-surface-variant text-xs leading-5 min-h-[2.5rem]">
            {method.description}
          </p>
        </div>
      </button>
    ))}
  </div>
);

export default PaymentMethodList;
