import { formatCurrency } from "@/utils/formatters";

/**
 * QrPaymentPanel
 *
 * Props:
 *   order              {Object} - The current active order
 *   transactionCode    {string} - The inputted transaction reference code
 *   setTransactionCode {Function} - (code) => void
 */
const QrPaymentPanel = ({
  order,
  transactionCode,
  setTransactionCode,
}) => {
  if (!order) return null;

  return (
    <div className="w-full h-full min-h-[34rem] bg-white rounded-2xl p-6 border-2 border-dashed border-outline-variant/60 flex flex-col gap-6 items-center justify-center text-center select-none">
      <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center animate-pulse">
        <span className="material-symbols-outlined text-[48px]">
          qr_code_2
        </span>
      </div>

      <div className="max-w-sm space-y-2">
        <h4 className="font-headline-sm font-bold text-on-surface">
          Thanh toán qua PayOS
        </h4>
        <p className="text-on-surface-variant text-body-sm leading-relaxed">
          Nhấn nút <strong className="text-primary">"Thanh toán và in biên lai"</strong> bên dưới để hệ thống khởi tạo mã QR thanh toán động bằng PayOS trị giá{" "}
          <strong className="text-primary font-bold">
            {formatCurrency(order.finalAmount)}
          </strong>.
        </p>
      </div>

      <div className="w-full max-w-md text-left shrink-0 mt-auto">
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
