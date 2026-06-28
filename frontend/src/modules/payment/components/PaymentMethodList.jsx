import { PAYMENT_METHOD_OPTIONS } from "../constants/paymentConstants";

const PaymentMethodList = ({
  selectedMethod,
  onSelectMethod,
  disabled = false,
}) => (
  <div className="grid auto-rows-fr gap-4 select-none">
    {PAYMENT_METHOD_OPTIONS.map((method) => (
      <button
        key={method.value}
        type="button"
        disabled={disabled}
        onClick={() => onSelectMethod(method.value)}
        className={`flex h-full min-h-[6.75rem] w-full items-center gap-4 rounded-2xl border-2 p-4 text-left outline-none transition-all ${
          selectedMethod === method.value
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-outline-variant/60 bg-white hover:border-primary"
        } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
      >
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${method.tone}`}
        >
          <span className="material-symbols-outlined text-3xl">{method.icon}</span>
        </div>
        <div className="min-w-0">
          <p className="font-body-md font-bold text-on-surface">{method.label}</p>
          <p className="min-h-[2.5rem] text-xs leading-5 text-on-surface-variant">
            {method.description}
          </p>
        </div>
      </button>
    ))}
  </div>
);

export default PaymentMethodList;
