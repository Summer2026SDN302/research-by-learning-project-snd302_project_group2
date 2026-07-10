import { KEYPAD_BUTTONS } from "../constants/paymentConstants";

/**
 * CashKeypad
 *
 * Props:
 *   cashReceived       {string}   - Active string of digits representing cash value
 *   changeReturned     {number}   - Calculated change
 *   isCashValid        {boolean}  - True if cashReceived >= finalAmount
 *   finalAmount        {number}   - Total order amount
 *   quickCashOptions   {number[]} - Suggested quick cash amounts above the order total
 *   onAppendDigit      {Function} - (digit) => void
 *   onClearCash        {Function} - () => void
 *   onSetCashAmount    {Function} - (amount) => void
 */
const CashKeypad = ({
  cashReceived,
  changeReturned,
  isCashValid,
  finalAmount,
  quickCashOptions = [],
  onAppendDigit,
  onClearCash,
  onSetCashAmount,
}) => {
  const parsedReceived = parseInt(cashReceived, 10) || 0;


  return (
    <div className="w-full h-full min-h-[22rem] bg-surface-container-low rounded-2xl p-4 flex flex-col select-none border border-outline-variant/30">
      <div className="mb-3 grid grid-cols-2 gap-4 shrink-0">
        <div>
          <label className="font-label-md text-on-surface-variant mb-1 block font-semibold text-[13px]">
            Số tiền khách đưa
          </label>
          <div className="relative">
            <input
              type="text"
              readOnly
              value={parsedReceived.toLocaleString("vi-VN")}
              className="w-full bg-white border-2 border-primary rounded-2xl px-3 py-1.5 text-xl font-bold text-on-surface text-right focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-primary text-[15px]">
              đ
            </span>
          </div>
        </div>

        <div>
          <label className="font-label-md text-on-surface-variant mb-1 block text-right font-semibold text-[13px]">
            Tiền thừa trả khách
          </label>
          <p
            className={`text-xl font-bold text-right py-1.5 transition-colors ${
              isCashValid ? "text-secondary" : "text-error"
            }`}
          >
            {isCashValid
              ? `${changeReturned.toLocaleString("vi-VN")}đ`
              : "Chưa đủ"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 flex-1 auto-rows-fr min-h-[12rem]">
        {KEYPAD_BUTTONS.map((btn) => {
          const isClear = btn === "C";

          return (
            <button
              key={btn}
              type="button"
              onClick={() => {
                if (isClear) {
                  onClearCash();
                } else {
                  onAppendDigit(btn);
                }
              }}
              className={`min-h-[2.8rem] rounded-xl shadow-sm text-md font-bold transition-all active:scale-95 flex items-center justify-center py-2 ${
                isClear
                  ? "bg-error-container/20 text-error hover:bg-error-container/30"
                  : "bg-white text-on-surface hover:bg-surface-container-high"
              }`}
            >
              {btn === ".000" ? ",000" : btn}
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onSetCashAmount(finalAmount)}
          className="min-h-[2.5rem] bg-white/70 border border-outline-variant rounded-xl py-1.5 text-xs font-bold hover:bg-white hover:border-primary transition-all text-on-surface active:scale-95"
        >
          Đúng số tiền
        </button>
        {quickCashOptions.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => onSetCashAmount(amount)}
            className="min-h-[2.5rem] bg-white/70 border border-outline-variant rounded-xl py-1.5 text-xs font-bold hover:bg-white hover:border-primary transition-all text-on-surface active:scale-95"
          >
            {amount.toLocaleString("vi-VN")}đ
          </button>
        ))}
      </div>
    </div>
  );
};

export default CashKeypad;
