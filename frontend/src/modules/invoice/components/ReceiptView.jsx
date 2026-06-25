import React from "react";
import dayjs from "dayjs";
import { formatCurrency } from "@/utils/formatters";

/**
 * ReceiptView
 *
 * Renders the classic zigzag-style receipt paper.
 * Props:
 *   receipt   {Object} - The formatted receipt details from backend:
 *                        { invoiceNumber, issuedAt, staff, lineItems, notes, subtotalAmount, discountAmount, taxRate, taxAmount, finalAmount }
 */
const ReceiptView = ({ receipt }) => {
  if (!receipt) return null;

  const {
    invoiceNumber,
    issuedAt,
    staff,
    lineItems = [],
    notes,
    subtotalAmount,
    discountAmount = 0,
    taxRate,
    taxAmount,
    finalAmount,
  } = receipt;

  return (
    <div className="receipt-paper w-full max-w-[360px] p-8 font-mono text-on-surface-variant rounded-sm text-sm border-x border-outline-variant/20 select-text">
      {/* zigzag & falling styles are defined in pages */}

      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-block p-1.5 border-2 border-primary text-primary font-black text-lg tracking-tighter mb-2 select-none">
          STALLBOX
        </div>
        <p className="text-xs font-bold uppercase text-on-surface">Canteen Tech Hub</p>
        <p className="text-[10px] text-on-surface-variant/80">
          Khu Cong Nghe Phan Mem DHQG HCM
        </p>
        <p className="text-[10px] text-on-surface-variant/80">SDT: 028-1234-5678</p>
      </div>

      <div className="border-b border-dashed border-outline-variant my-3" />

      {/* Metadata */}
      <div className="space-y-1 text-xs mb-4">
        <div className="flex justify-between">
          <span>Số HĐ:</span>
          <span className="text-on-surface font-semibold">{invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Ngày:</span>
          <span className="text-on-surface">
            {dayjs(issuedAt).format("DD/MM/YYYY HH:mm")}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Nhân viên:</span>
          <span className="text-on-surface truncate max-w-[150px]">
            {staff?.fullName || staff?.username || "POS Terminal"}
          </span>
        </div>
      </div>

      <div className="border-b border-dashed border-outline-variant my-3" />

      {notes && (
        <>
          <div className="mb-4 rounded-md border border-dashed border-primary/40 bg-primary/5 px-3 py-2.5 text-xs">
            <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
              Ghi chú chung
            </p>
            <p className="mt-1 whitespace-pre-wrap break-words text-on-surface">
              {notes}
            </p>
          </div>

          <div className="border-b border-dashed border-outline-variant my-3" />
        </>
      )}

      {/* Item List */}
      <div className="space-y-3 mb-4 text-xs">
        {lineItems.map((item, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="flex justify-between text-on-surface font-bold">
              <span className="truncate max-w-[200px]">{item.name}</span>
              <span>{formatCurrency(item.lineTotal ?? item.unitPrice * item.quantity)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-on-surface-variant/80">
              <span>
                {item.quantity} x {formatCurrency(item.unitPrice)}
              </span>
            </div>
            {item.note && (
              <span className="text-[10px] italic text-primary whitespace-pre-wrap break-words">
                - Ghi chú: {item.note}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="border-b border-dashed border-outline-variant my-3" />

      {/* Calculations */}
      <div className="space-y-1.5 mb-6 text-xs">
        <div className="flex justify-between">
          <span>Tạm tính:</span>
          <span>{formatCurrency(subtotalAmount)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between">
            <span>Khuyến mãi:</span>
            <span className="text-primary">-{formatCurrency(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Thuế VAT ({(taxRate * 100).toFixed(0)}%):</span>
          <span>{formatCurrency(taxAmount)}</span>
        </div>
        <div className="flex justify-between text-base font-bold text-on-surface pt-1.5 border-t border-dashed border-outline-variant">
          <span>TỔNG TIỀN:</span>
          <span>{formatCurrency(finalAmount)}</span>
        </div>
      </div>

      {/* Footer Message */}
      <div className="text-center space-y-3 pt-2 select-none">
        <p className="font-bold text-on-surface text-xs">Cảm ơn Quý khách!</p>
        <p className="text-[9px] leading-relaxed text-on-surface-variant/70">
          Vui lòng mang hóa đơn này tới quầy nhận món. StallBox phục vụ tận tâm.
        </p>
      </div>
    </div>
  );
};

export default ReceiptView;
