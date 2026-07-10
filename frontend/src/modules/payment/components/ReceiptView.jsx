import dayjs from "dayjs";
import { formatCurrency, removeAccents } from "@/utils/formatters";

const ReceiptView = ({ receipt }) => {
  if (!receipt) return null;

  const {
    orderNumber,
    issuedAt,
    staff,
    lineItems = [],
    notes,
    finalAmount,
    amountReceived,
    changeReturned,
  } = receipt;

  return (
    <div className="receipt-paper w-full max-w-[430px] rounded-sm border-x border-outline-variant/20 px-8 py-9 font-mono text-sm leading-relaxed text-on-surface-variant select-text sm:max-w-[460px] sm:px-10 sm:py-10 sm:text-[15px]">
      <div className="mb-7 text-center">
        <div className="mb-2 inline-block border-2 border-primary px-2 py-1.5 text-xl font-black tracking-tighter text-primary select-none">
          STALLBOX
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-on-surface">
          Canteen Tech Hub
        </p>
        <p className="text-[11px] text-on-surface-variant/80">
          Khu Canteen Dai Hoc FPT
        </p>
        <p className="text-[11px] text-on-surface-variant/80">
          SDT: 028-1234-5678
        </p>
      </div>

      <div className="my-4 border-b border-dashed border-outline-variant" />

      <div className="mb-5 space-y-1.5 text-xs sm:text-[13px]">
        {orderNumber && (
          <div className="flex justify-between">
            <span>Don hang:</span>
            <span className="text-on-surface">{orderNumber}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Ngay:</span>
          <span className="text-on-surface">
            {dayjs(issuedAt).format("DD/MM/YYYY HH:mm")}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Nhan vien:</span>
          <span className="max-w-[190px] truncate text-on-surface sm:max-w-[220px]">
            {removeAccents(
              staff?.fullName || staff?.username || "POS Terminal",
            )}
          </span>
        </div>
      </div>

      <div className="my-4 border-b border-dashed border-outline-variant" />

      {notes && (
        <>
          <div className="mb-5 rounded-md border border-dashed border-primary/40 bg-primary/5 px-3.5 py-3 text-xs sm:text-[13px]">
            <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
              Ghi chu chung
            </p>
            <p className="mt-1 whitespace-pre-wrap break-words text-on-surface">
              {notes}
            </p>
          </div>

          <div className="my-4 border-b border-dashed border-outline-variant" />
        </>
      )}

      <div className="mb-5 space-y-3.5 text-xs sm:text-[13px]">
        {lineItems.map((item, index) => (
          <div key={`${item.name}-${index}`} className="flex flex-col">
            <div className="flex justify-between font-bold text-on-surface">
              <span className="max-w-[220px] truncate sm:max-w-[260px]">
                {removeAccents(item.name)}
              </span>
              <span>{formatCurrency(item.lineTotal ?? 0)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-on-surface-variant/80">
              <span>
                {item.quantity} x {formatCurrency(item.unitPrice)}
              </span>
            </div>
            {item.note && (
              <span className="whitespace-pre-wrap break-words text-[10px] italic text-primary">
                - Ghi chu: {item.note}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between border-t border-dashed border-outline-variant pt-2 text-lg font-bold text-on-surface sm:text-[28px]">
        <span>TONG TIEN:</span>
        <span>{formatCurrency(finalAmount)}</span>
      </div>

      {(amountReceived != null || changeReturned != null) && (
        <div className="mt-2 space-y-1 text-xs sm:text-[13px]">
          {amountReceived != null && (
            <div className="flex justify-between">
              <span>Tien khach tra:</span>
              <span className="font-semibold text-on-surface">
                {formatCurrency(amountReceived)}
              </span>
            </div>
          )}
          {changeReturned != null && (
            <div className="flex justify-between">
              <span>Tien thoi lai:</span>
              <span className="font-semibold text-on-surface">
                {formatCurrency(changeReturned)}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3 pt-3 text-center select-none">
        <p className="text-sm font-bold text-on-surface">Cam on Quy khach!</p>
        <p className="text-[10px] leading-relaxed text-on-surface-variant/70 sm:text-[11px]">
          Vui long mang bien lai nay toi quay nhan mon. StallBox phuc vu tan
          tam.
        </p>
      </div>
    </div>
  );
};

export default ReceiptView;
