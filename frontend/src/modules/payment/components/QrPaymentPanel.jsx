import React from "react";
import { BANK_CONFIG } from "../constants/paymentConstants";
import { formatCurrency } from "@/utils/formatters";

/**
 * QrPaymentPanel
 *
 * Props:
 *   selectedMethod     {string} - 'Card' | 'QR'
 *   order              {Object} - The current active order
 *   transactionCode    {string} - The inputted transaction reference code
 *   setTransactionCode {Function} - (code) => void
 *   providerName       {string} - Provider name (e.g., "Visa", "VietQR")
 *   setProviderName    {Function} - (name) => void
 */
const QrPaymentPanel = ({
  selectedMethod,
  order,
  transactionCode,
  setTransactionCode,
  providerName,
  setProviderName,
}) => {
  if (!order) return null;

  const isQr = selectedMethod === "QR";
  const qrCodeUrl = `https://img.vietqr.io/image/${BANK_CONFIG.BANK_ID}-${BANK_CONFIG.ACCOUNT_NO}-qr_only.png?amount=${order.finalAmount}&addInfo=StallBox%20${order.orderNumber}`;

  return (
    <div className="w-full h-full min-h-[34rem] bg-white rounded-2xl p-6 border-2 border-dashed border-outline-variant/60 flex flex-col gap-5 select-none">
      {isQr ? (
        <>
          <div className="relative mx-auto w-56 h-56 p-3 bg-white border border-outline-variant rounded-2xl shadow-sm flex items-center justify-center shrink-0">
            <img
              src={qrCodeUrl}
              alt="VietQR Code"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 border border-outline-variant rounded-2xl pointer-events-none" />
          </div>

          <div className="mx-auto max-w-sm text-center space-y-1">
            <h4 className="font-body-md font-bold text-on-surface">
              Quét mã VietQR
            </h4>
            <p className="text-on-surface-variant text-xs leading-relaxed">
              Hướng dẫn khách hàng quét mã trên để chuyển khoản nhanh số tiền{" "}
              <strong className="text-primary">{formatCurrency(order.finalAmount)}</strong>.
            </p>
          </div>

          <div className="w-full max-w-[36rem] mx-auto bg-surface-container-low p-3.5 rounded-xl text-left font-mono text-xs space-y-1.5 border border-outline-variant/30 select-text shrink-0">
            <div className="flex justify-between gap-4">
              <span className="text-on-surface-variant">Ngân hàng:</span>
              <span className="font-bold text-on-surface">{BANK_CONFIG.BANK_ID} Bank</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-on-surface-variant">Số tài khoản:</span>
              <span className="font-bold text-on-surface">{BANK_CONFIG.ACCOUNT_NO}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-on-surface-variant">Tên tài khoản:</span>
              <span className="font-bold text-on-surface">{BANK_CONFIG.ACCOUNT_NAME}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-on-surface-variant">Nội dung chuyển:</span>
              <span className="font-bold text-primary">StallBox {order.orderNumber}</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="w-28 h-28 mx-auto rounded-full bg-secondary-container/20 text-secondary flex items-center justify-center animate-pulse shrink-0">
            <span className="material-symbols-outlined text-[48px]">
              point_of_sale
            </span>
          </div>

          <div className="mx-auto max-w-sm text-center space-y-1">
            <h4 className="font-body-md font-bold text-on-surface">
              Kết nối Máy POS Thẻ
            </h4>
            <p className="text-on-surface-variant text-xs leading-relaxed">
              Chèn hoặc quẹt thẻ của khách hàng vào máy đọc POS để thanh toán{" "}
              <strong className="text-primary">{formatCurrency(order.finalAmount)}</strong>.
            </p>
          </div>

          <div className="w-full max-w-[36rem] mx-auto shrink-0">
            <label className="font-label-md text-on-surface-variant text-left block mb-1 font-semibold">
              Nhà mạng thẻ
            </label>
            <select
              value={providerName || "Napas"}
              onChange={(e) => setProviderName(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none"
            >
              <option value="Napas">Napas Nội Địa</option>
              <option value="Visa">Visa Card</option>
              <option value="Mastercard">Mastercard</option>
              <option value="JCB">JCB Card</option>
            </select>
          </div>
        </>
      )}

      <div className="w-full max-w-[36rem] mx-auto text-left shrink-0 mt-auto">
        <label className="font-label-md text-on-surface-variant block mb-1 font-semibold">
          Mã tham chiếu / Mã GD (Không bắt buộc)
        </label>
        <input
          type="text"
          placeholder="Nhập mã GD từ hóa đơn / biên lai..."
          value={transactionCode}
          onChange={(e) => setTransactionCode(e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
        />
      </div>
    </div>
  );
};

export default QrPaymentPanel;
