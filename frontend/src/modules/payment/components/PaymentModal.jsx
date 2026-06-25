import React from "react";
import { createPortal } from "react-dom";
import PaymentMethodList from "./PaymentMethodList";
import CashKeypad from "./CashKeypad";
import QrPaymentPanel from "./QrPaymentPanel";
import Spinner from "@/components/feedback/Spinner";
import { formatCurrency } from "@/utils/formatters";

/**
 * PaymentModal
 *
 * Props:
 *   open                 {boolean}
 *   order                {Object}
 *   onClose              {Function}
 *   onConfirm            {Function}
 *   selectedMethod       {string}
 *   setSelectedMethod    {Function}
 *   cashReceived         {string}
 *   transactionCode      {string}
 *   setTransactionCode   {Function}
 *   providerName         {string}
 *   setProviderName      {Function}
 *   isSubmitting         {boolean}
 *   appendDigit          {Function}
 *   clearCash            {Function}
 *   setCashReceivedAmount{Function}
 *   changeReturned       {number}
 *   isCashValid          {boolean}
 *   quickCashOptions     {number[]}
 */
const PaymentModal = ({
  open,
  order,
  onClose,
  onConfirm,
  selectedMethod,
  setSelectedMethod,
  cashReceived,
  transactionCode,
  setTransactionCode,
  providerName,
  setProviderName,
  isSubmitting,
  appendDigit,
  clearCash,
  setCashReceivedAmount,
  changeReturned,
  isCashValid,
  quickCashOptions,
}) => {
  if (!open || !order) return null;

  const isConfirmDisabled =
    isSubmitting || (selectedMethod === "Cash" && !isCashValid);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center select-none">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={isSubmitting ? undefined : onClose}
      />

      <div className="relative bg-surface w-full max-w-4xl rounded-[24px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh] mx-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="font-headline-md text-headline-sm md:text-headline-md text-on-surface font-bold">
              Xác nhận Thanh toán
            </h2>
            <p className="text-on-surface-variant text-xs font-medium mt-0.5">
              Đơn hàng #{order.orderNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="font-label-md text-primary uppercase tracking-wider font-semibold">
              Tổng cộng
            </p>
            <p className="font-headline-lg text-headline-lg text-primary font-black">
              {formatCurrency(order.finalAmount)}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-12 gap-6 min-h-[350px]">
          <div className="col-span-12 md:col-span-5 md:min-h-[34rem] border-b md:border-b-0 md:border-r border-outline-variant/60 pb-6 md:pb-0 md:pr-6">
            <h3 className="font-body-md font-bold mb-4 text-on-surface">
              Phương thức thanh toán
            </h3>
            <PaymentMethodList
              selectedMethod={selectedMethod}
              onSelectMethod={setSelectedMethod}
            />
          </div>

          <div className="col-span-12 md:col-span-7 flex flex-col md:min-h-[34rem]">
            {selectedMethod === "Cash" ? (
              <CashKeypad
                cashReceived={cashReceived}
                changeReturned={changeReturned}
                isCashValid={isCashValid}
                finalAmount={order.finalAmount}
                quickCashOptions={quickCashOptions}
                onAppendDigit={appendDigit}
                onClearCash={clearCash}
                onSetCashAmount={setCashReceivedAmount}
              />
            ) : (
              <QrPaymentPanel
                selectedMethod={selectedMethod}
                order={order}
                transactionCode={transactionCode}
                setTransactionCode={setTransactionCode}
                providerName={providerName}
                setProviderName={setProviderName}
              />
            )}
          </div>
        </div>

        <div className="px-6 py-5 bg-surface-container flex gap-4 shrink-0 border-t border-outline-variant/50">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="flex-1 py-3.5 px-6 rounded-xl border border-outline-variant text-body-md font-bold text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-[0.98] disabled:opacity-50"
          >
            Quay lại
          </button>
          <button
            type="button"
            disabled={isConfirmDisabled}
            onClick={onConfirm}
            className="flex-[2] py-3.5 px-6 rounded-xl bg-primary text-on-primary font-body-md font-bold shadow-lg shadow-primary/25 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="text-on-primary" />
                Đang xử lý giao dịch...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">print</span>
                Xác nhận &amp; In hóa đơn
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default PaymentModal;
