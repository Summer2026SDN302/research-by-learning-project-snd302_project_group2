import React from "react";
import { formatCurrency } from "@/utils/formatters";

/**
 * CashKeypad
 *
 * Props:
 *   cashReceived       {string}   - Active string of digits representing cash value
 *   changeReturned     {number}   - Calculated change
 *   isCashValid        {boolean}  - True if cashReceived >= finalAmount
 *   finalAmount        {number}   - Total order amount
 *   onAppendDigit      {Function} - (digit) => void
 *   onClearCash        {Function} - () => void
 *   onSetCashAmount    {Function} - (amount) => void
 */
const CashKeypad = ({
  cashReceived,
  changeReturned,
  isCashValid,
  finalAmount,
  onAppendDigit,
  onClearCash,
  onSetCashAmount,
}) => {
  const parsedReceived = parseInt(cashReceived, 10) || 0;

  const keypadButtons = [
    "1", "2", "3",
    "4", "5", "6",
    "7", "8", "9",
    "C", "0", ".000",
  ];

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 flex flex-col h-full select-none border border-outline-variant/30">
      {/* Inputs and computations */}
      <div className="mb-6 grid grid-cols-2 gap-4">
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
            {isCashValid ? `${changeReturned.toLocaleString("vi-VN")}đ` : "Chưa đủ"}
          </p>
        </div>
      </div>

      {/* Numeric Keypad */}
      <div className="grid grid-cols-3 gap-2 flex-1 min-h-[220px]">
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
              className={`h-full rounded-xl shadow-sm text-lg font-bold transition-all active:scale-95 flex items-center justify-center py-3 select-none ${
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

      {/* Quick Select Preset Keys */}
      <div className="mt-4 grid grid-cols-3 gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onSetCashAmount(finalAmount)}
          className="bg-white/70 border border-outline-variant rounded-xl py-2.5 text-xs font-bold hover:bg-white hover:border-primary transition-all text-on-surface active:scale-95"
        >
          Đúng số tiền
        </button>
        <button
          type="button"
          onClick={() => onSetCashAmount(200000)}
          className="bg-white/70 border border-outline-variant rounded-xl py-2.5 text-xs font-bold hover:bg-white hover:border-primary transition-all text-on-surface active:scale-95"
        >
          200,000đ
        </button>
        <button
          type="button"
          onClick={() => onSetCashAmount(500000)}
          className="bg-white/70 border border-outline-variant rounded-xl py-2.5 text-xs font-bold hover:bg-white hover:border-primary transition-all text-on-surface active:scale-95"
        >
          500,000đ
        </button>
      </div>
    </div>
  );
};

export default CashKeypad;
