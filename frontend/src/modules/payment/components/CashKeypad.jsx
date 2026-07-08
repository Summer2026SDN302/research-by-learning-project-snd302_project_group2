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

  const keypadButtons = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "C",
    "0",
    ".000",
  ];

  return (
    <div className="w-full h-full min-h-[34rem] bg-surface-container-low rounded-2xl p-6 flex flex-col select-none border border-outline-variant/30">
      <div className="mb-6 grid grid-cols-2 gap-4 shrink-0">
        <div>
          <label className="font-label-md text-on-surface-variant mb-2 block font-semibold">
            Số tiền khách đưa
          </label>
          <div className="relative">
            <input
              type="text"
              readOnly
              value={parsedReceived.toLocaleString("vi-VN")}
              className="w-full bg-white border-2 border-primary rounded-2xl px-4 py-3 text-2xl font-bold text-on-surface text-right focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary">
              đ
            </span>
          </div>
        </div>

        <div>
          <label className="font-label-md text-on-surface-variant mb-2 block text-right font-semibold">
            Tiền thừa trả khách
          </label>
          <p
            className={`text-2xl font-bold text-right py-3 transition-colors ${
              isCashValid ? "text-secondary" : "text-error"
            }`}
          >
            {isCashValid
              ? `${changeReturned.toLocaleString("vi-VN")}đ`
              : "Chưa đủ"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 flex-1 auto-rows-fr min-h-[15rem]">
        {keypadButtons.map((btn) => {
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
              className={`min-h-[4.5rem] rounded-xl shadow-sm text-lg font-bold transition-all active:scale-95 flex items-center justify-center py-3 ${
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

      <div className="mt-4 grid grid-cols-3 gap-3 shrink-0">
        <button
          type="button"
          onClick={() => onSetCashAmount(finalAmount)}
          className="min-h-[3rem] bg-white/70 border border-outline-variant rounded-xl py-2.5 text-xs font-bold hover:bg-white hover:border-primary transition-all text-on-surface active:scale-95"
        >
          Đúng số tiền
        </button>
        {quickCashOptions.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => onSetCashAmount(amount)}
            className="min-h-[3rem] bg-white/70 border border-outline-variant rounded-xl py-2.5 text-xs font-bold hover:bg-white hover:border-primary transition-all text-on-surface active:scale-95"
          >
            {amount.toLocaleString("vi-VN")}đ
          </button>
        ))}
      </div>
    </div>
  );
};

export default CashKeypad;
