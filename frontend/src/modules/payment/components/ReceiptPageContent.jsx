import ReceiptView from "./ReceiptView";
import ReceiptActionPanel from "./ReceiptActionPanel";
import Spinner from "@/components/feedback/Spinner";
import { PAYMENT_METHODS_MAP } from "@/modules/payment/constants/paymentConstants";
import { formatCurrency } from "@/utils/formatters";

const getErrorMessage = (error) => error?.message || error || null;

const ReceiptPageContent = ({
  role = "staff",
  receipt,
  loading,
  error,
  onPrint,
}) => {
  const errorMessage = getErrorMessage(error);

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3 select-none">
        <Spinner size="lg" />
        <p className="text-body-sm font-medium text-on-surface-variant">
          Đang tải chi tiết thanh toán...
        </p>
      </div>
    );
  }

  if (errorMessage || !receipt) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center px-4 text-center select-none">
        <span className="material-symbols-outlined mb-4 text-[64px] text-error">
          error
        </span>
        <h2 className="mb-2 text-headline-sm font-bold text-on-surface">
          Không thể tìm thấy biên lai
        </h2>
        <p className="max-w-sm text-body-sm text-on-surface-variant">
          {errorMessage ||
            "Ma thanh toan khong hop le hoac ban khong co quyen truy cap."}
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-140px)] flex-col items-center justify-center bg-background py-6 select-none">
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
          }
        }
        .receipt-paper {
          background-image: radial-gradient(circle at 2px 2px, #f3f4f6 1.5px, transparent 0);
          background-size: 16px 16px;
          background-color: white;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -5px rgba(0, 0, 0, 0.02);
          position: relative;
        }
        .receipt-paper::before {
          content: "";
          position: absolute;
          top: -8px;
          left: 0;
          right: 0;
          height: 8px;
          background: linear-gradient(-45deg, white 4px, transparent 0), linear-gradient(45deg, white 4px, transparent 0);
          background-size: 8px 8px;
        }
        .receipt-paper::after {
          content: "";
          position: absolute;
          bottom: -8px;
          left: 0;
          right: 0;
          height: 8px;
          background: linear-gradient(-45deg, transparent 4px, white 0), linear-gradient(45deg, transparent 4px, white 0);
          background-size: 8px 8px;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-paper, .receipt-paper * {
            visibility: visible;
          }
          .receipt-paper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none;
          }
        }
      `}</style>

      <div className="z-10 grid w-full max-w-[1120px] grid-cols-1 items-start gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(440px,_1.05fr)_minmax(380px,_0.95fr)] lg:gap-10">
        <div className="flex w-full justify-center lg:justify-end">
          <ReceiptView receipt={receipt} />
        </div>

        <div className="w-full max-w-[460px] justify-self-center lg:justify-self-start">
          <div className="rounded-2xl border border-outline-variant bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-6 space-y-3.5 select-text">
              <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3.5">
                <span className="material-symbols-outlined text-[24px] text-secondary">
                  payments
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-on-surface-variant">
                    Phương thức thanh toán
                  </p>
                  <p className="text-body-sm font-bold text-on-surface">
                    {PAYMENT_METHODS_MAP[receipt.paymentMethod] ||
                      receipt.paymentMethod ||
                      "Tiền mặt"}
                  </p>
                </div>
              </div>

              {receipt.orderNumber && (
                <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3.5">
                  <span className="material-symbols-outlined text-[24px] text-primary">
                    receipt_long
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold text-on-surface-variant">
                      Đơn hàng
                    </p>
                    <p className="font-mono text-body-sm font-bold text-on-surface">
                      {receipt.orderNumber}
                    </p>
                  </div>
                </div>
              )}

              {receipt.transactionCode && (
                <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3.5">
                  <span className="material-symbols-outlined text-[24px] text-primary">
                    receipt
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold text-on-surface-variant">
                      Mã tham chiếu giao dịch
                    </p>
                    <p className="font-mono text-body-sm font-bold text-on-surface">
                      {receipt.transactionCode}
                    </p>
                  </div>
                </div>
              )}

              {(role === "manager" || role === "admin") && (
                <>
                  <div className="space-y-1.5 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3.5 font-mono text-xs">
                    <p className="text-[10px] font-bold uppercase text-on-surface-variant">
                      Nhân viên lập đơn
                    </p>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Họ tên:</span>
                      <span className="font-bold text-on-surface">
                        {receipt.staff?.fullName || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">
                        Tài khoản:
                      </span>
                      <span className="font-bold text-on-surface">
                        {receipt.staff?.username || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Vai trò:</span>
                      <span className="font-bold text-on-surface">
                        {receipt.staff?.role || "Staff"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3.5 text-xs">
                    <div className="flex justify-between">
                      <span className="font-medium text-on-surface-variant">
                        Trạng thái thanh toán:
                      </span>
                      <span className="font-bold uppercase text-secondary">
                        {receipt.paymentStatus || "Paid"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-on-surface-variant">
                        Tổng tiền trước thuế:
                      </span>
                      <span className="font-bold text-on-surface">
                        {formatCurrency(receipt.subtotalAmount ?? 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-on-surface-variant">
                        Thuế (VAT):
                      </span>
                      <span className="font-bold text-on-surface">
                        {formatCurrency(receipt.taxAmount ?? 0)}
                      </span>
                    </div>
                    {(receipt.discountAmount ?? 0) > 0 && (
                      <div className="flex justify-between">
                        <span className="font-medium text-on-surface-variant">
                          Giảm giá:
                        </span>
                        <span className="font-bold text-primary">
                          -{formatCurrency(receipt.discountAmount)}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <ReceiptActionPanel role={role} onPrint={onPrint} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPageContent;
