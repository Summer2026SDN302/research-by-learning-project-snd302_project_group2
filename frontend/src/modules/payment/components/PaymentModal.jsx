import { createPortal } from "react-dom";
import PaymentMethodList from "./PaymentMethodList";
import CashKeypad from "./CashKeypad";
import QrPaymentPanel from "./QrPaymentPanel";
import Spinner from "@/components/feedback/Spinner";
import { formatCurrency } from "@/utils/formatters";

const getOrderAmount = (order) => order?.finalAmount || order?.totalAmount || 0;

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

  const orderAmount = getOrderAmount(order);
  const isConfirmDisabled =
    isSubmitting || (selectedMethod === "Cash" && !isCashValid);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center select-none">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={isSubmitting ? undefined : onClose}
      />

      <div className="relative mx-4 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[24px] bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between border-b border-outline-variant bg-white px-6 py-5 shrink-0">
          <div>
            <h2 className="font-headline-md text-headline-sm font-bold text-on-surface md:text-headline-md">
              Xác nhận thanh toán
            </h2>
            <p className="mt-0.5 text-xs font-medium text-on-surface-variant">
              {order.orderNumber
                ? `Đơn hàng #${order.orderNumber}`
                : "Biên lai sẽ được tạo sau khi thanh toán thành công"}
            </p>
          </div>
          <div className="text-right">
            <p className="font-label-md font-semibold uppercase tracking-wider text-primary">
              Tổng cộng
            </p>
            <p className="text-headline-lg font-black text-primary">
              {formatCurrency(orderAmount)}
            </p>
          </div>
        </div>

        <div className="grid min-h-[350px] flex-1 grid-cols-12 gap-6 overflow-y-auto p-6">
          <div className="col-span-12 border-b border-outline-variant/60 pb-6 md:col-span-5 md:min-h-[34rem] md:border-b-0 md:border-r md:pb-0 md:pr-6">
            <h3 className="mb-4 font-body-md font-bold text-on-surface">
              Phương thức thanh toán
            </h3>
            <PaymentMethodList
              selectedMethod={selectedMethod}
              onSelectMethod={setSelectedMethod}
            />
          </div>

          <div className="col-span-12 flex flex-col md:col-span-7 md:min-h-[34rem]">
            {selectedMethod === "Cash" ? (
              <CashKeypad
                cashReceived={cashReceived}
                changeReturned={changeReturned}
                isCashValid={isCashValid}
                finalAmount={orderAmount}
                quickCashOptions={quickCashOptions}
                onAppendDigit={appendDigit}
                onClearCash={clearCash}
                onSetCashAmount={setCashReceivedAmount}
              />
            ) : (
              <QrPaymentPanel
                selectedMethod={selectedMethod}
                order={{
                  ...order,
                  finalAmount: orderAmount,
                }}
                transactionCode={transactionCode}
                setTransactionCode={setTransactionCode}
                providerName={providerName}
                setProviderName={setProviderName}
              />
            )}
          </div>
        </div>

        <div className="flex gap-4 border-t border-outline-variant/50 bg-surface-container px-6 py-5 shrink-0">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="flex-1 rounded-xl border border-outline-variant px-6 py-3.5 font-bold text-on-surface-variant transition-all active:scale-[0.98] hover:bg-surface-container-high disabled:opacity-50"
          >
            Quay lại
          </button>
          <button
            type="button"
            disabled={isConfirmDisabled}
            onClick={onConfirm}
            className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-body-md font-bold text-on-primary shadow-lg shadow-primary/25 transition-all active:scale-[0.98] hover:opacity-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="text-on-primary" />
                Đang xử lý giao dịch...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">
                  print
                </span>
                Thanh toán và in biên lai
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
