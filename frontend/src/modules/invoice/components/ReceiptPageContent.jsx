import React from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import ReceiptView from "./ReceiptView";
import ReceiptActionPanel from "./ReceiptActionPanel";
import Spinner from "@/components/feedback/Spinner";
import { PAYMENT_METHODS_MAP } from "@/modules/payment/constants/paymentConstants";

const RECEIPT_PAGE_CONFIG = {
  staff: {
    backPath: "/staff/pos",
    backLabel: "Quay lai POS",
    heading: "Thanh toan thanh cong!",
    subheadingPrefix: "Ma thanh toan:",
    introIcon: "check_circle",
    introIconTone: "bg-secondary-container bg-opacity-20 text-secondary",
    showConfetti: true,
    summaryTitle: "Chi tiet giao dich",
  },
  manager: {
    backPath: "/manager/payments",
    backLabel: "Quay lai thanh toan",
    heading: "Bien lai quan ly",
    subheadingPrefix: "So thanh toan:",
    introIcon: "receipt_long",
    introIconTone: "bg-primary-container/20 text-primary",
    showConfetti: false,
    summaryTitle: "Thong tin quan ly",
  },
  admin: {
    backPath: "/admin/payments",
    backLabel: "Quay lai thanh toan",
    heading: "Bien lai quan tri",
    subheadingPrefix: "So thanh toan:",
    introIcon: "admin_panel_settings",
    introIconTone: "bg-primary-container/20 text-primary",
    showConfetti: false,
    summaryTitle: "Thong tin quan tri",
  },
};

const getErrorMessage = (error) => error?.message || error || null;

const ReceiptPageContent = ({
  role = "staff",
  receipt,
  loading,
  error,
  onPrint,
}) => {
  const navigate = useNavigate();
  const config = RECEIPT_PAGE_CONFIG[role] || RECEIPT_PAGE_CONFIG.staff;
  const errorMessage = getErrorMessage(error);

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3 select-none">
        <Spinner size="lg" />
        <p className="text-body-sm font-medium text-on-surface-variant">
          Dang tai chi tiet bien lai thanh toan...
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
          Khong the tim thay bien lai
        </h2>
        <p className="max-w-sm text-body-sm text-on-surface-variant">
          {errorMessage ||
            "Ma thanh toan khong hop le hoac ban khong co quyen truy cap."}
        </p>
        <button
          type="button"
          onClick={() => navigate(config.backPath)}
          className="mt-6 rounded-xl bg-primary px-5 py-2.5 font-bold text-on-primary shadow transition-opacity hover:opacity-90"
        >
          {config.backLabel}
        </button>
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

      {config.showConfetti && (
        <div
          id="confetti-container"
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
        />
      )}

      <div className="z-10 mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div
          className={`mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full shadow-sm transition-transform hover:scale-105 ${config.introIconTone}`}
        >
          <span className="material-symbols-outlined !text-[44px]">
            {config.introIcon}
          </span>
        </div>
        <h2 className="mb-1 text-headline-sm font-black text-primary">
          {config.heading}
        </h2>
        <p className="text-body-sm text-on-surface-variant">
          {config.subheadingPrefix}{" "}
          <span className="font-bold text-on-surface">#{receipt.paymentNumber}</span>
        </p>
      </div>

      <div className="z-10 grid w-full max-w-[1120px] grid-cols-1 items-start gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(440px,_1.05fr)_minmax(380px,_0.95fr)] lg:gap-10">
        <div className="flex w-full justify-center lg:justify-end">
          <ReceiptView receipt={receipt} />
        </div>

        <div className="w-full max-w-[460px] justify-self-center lg:justify-self-start">
          <div className="rounded-2xl border border-outline-variant bg-white p-6 shadow-sm sm:p-7">
            <h3 className="mb-5 flex items-center gap-2 border-b border-outline-variant/30 pb-3 font-body-md font-bold text-on-surface">
              <span className="material-symbols-outlined text-[20px] text-primary">
                analytics
              </span>
              {config.summaryTitle}
            </h3>

            <div className="mb-6 space-y-3.5 select-text">
              <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3.5">
                <span className="material-symbols-outlined text-[24px] text-secondary">
                  payments
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-on-surface-variant">
                    Phuong thuc thanh toan
                  </p>
                  <p className="text-body-sm font-bold text-on-surface">
                    {PAYMENT_METHODS_MAP[receipt.paymentMethod] ||
                      receipt.paymentMethod ||
                      "Tien mat"}
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
                      Don hang
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
                      Ma tham chieu giao dich
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
                      Nhan vien lap don
                    </p>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Ho ten:</span>
                      <span className="font-bold text-on-surface">
                        {receipt.staff?.fullName || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Username:</span>
                      <span className="font-bold text-on-surface">
                        {receipt.staff?.username || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Vai tro:</span>
                      <span className="font-bold text-on-surface">
                        {receipt.staff?.role || "Staff"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3.5 text-xs">
                    <div className="flex justify-between">
                      <span className="font-medium text-on-surface-variant">
                        Trang thai thanh toan:
                      </span>
                      <span className="font-bold uppercase text-secondary">
                        {receipt.paymentStatus || "Paid"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-on-surface-variant">
                        So lan in:
                      </span>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                        {receipt.printCount || 0} lan
                      </span>
                    </div>
                    {receipt.lastPrintedAt && (
                      <div className="flex justify-between gap-3">
                        <span className="font-medium text-on-surface-variant">
                          Lan in cuoi:
                        </span>
                        <span className="font-bold text-on-surface">
                          {dayjs(receipt.lastPrintedAt).format("DD/MM/YYYY HH:mm:ss")}
                        </span>
                      </div>
                    )}
                    {receipt.lastPrintedBy && (
                      <div className="flex justify-between gap-3">
                        <span className="font-medium text-on-surface-variant">
                          Nguoi in cuoi:
                        </span>
                        <span className="font-bold text-on-surface">
                          {receipt.lastPrintedBy.fullName ||
                            receipt.lastPrintedBy.username ||
                            "-"}
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
