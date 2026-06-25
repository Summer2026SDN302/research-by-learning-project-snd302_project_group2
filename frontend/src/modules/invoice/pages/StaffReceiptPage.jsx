import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReceipt } from "../hooks/useReceipt";
import ReceiptView from "../components/ReceiptView";
import ReceiptActionPanel from "../components/ReceiptActionPanel";
import Spinner from "@/components/feedback/Spinner";
import { PAYMENT_METHODS_MAP } from "@/modules/payment/constants/paymentConstants";

const StaffReceiptPage = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { receipt, loading, error, fetchReceipt, handlePrint, resetState } = useReceipt();

  useEffect(() => {
    fetchReceipt(invoiceId);
    return () => {
      resetState();
    };
  }, [invoiceId, fetchReceipt, resetState]);

  // Confetti celebration effect
  useEffect(() => {
    if (loading || error || !receipt) return;

    const container = document.getElementById("confetti-container");
    if (!container) return;

    const colors = ["#00685f", "#4edea3", "#6bd8cb", "#006c49", "#ffb59a"];
    const elements = [];

    for (let i = 0; i < 60; i++) {
      const confetti = document.createElement("div");
      confetti.style.position = "absolute";
      confetti.style.width = `${Math.random() * 8 + 6}px`;
      confetti.style.height = `${Math.random() * 8 + 6}px`;
      confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.top = "-20px";
      confetti.style.opacity = Math.random().toString();
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      const duration = Math.random() * 3 + 2.5;
      const delay = Math.random() * 1.5;
      confetti.style.animation = `fall ${duration}s linear ${delay}s forwards`;
      
      container.appendChild(confetti);
      elements.push(confetti);
    }

    return () => {
      elements.forEach((el) => el.remove());
    };
  }, [loading, error, receipt]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3 select-none">
        <Spinner size="lg" />
        <p className="text-body-sm text-on-surface-variant font-medium">
          Đang tải chi tiết biên lai...
        </p>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] select-none text-center px-4">
        <span className="material-symbols-outlined text-[64px] text-error mb-4">
          error
        </span>
        <h2 className="text-headline-sm font-bold text-on-surface mb-2">
          Không thể tìm thấy biên lai
        </h2>
        <p className="text-body-sm text-on-surface-variant max-w-sm">
          {error || "Mã hóa đơn không hợp lệ hoặc bạn không có quyền truy cập."}
        </p>
        <button
          type="button"
          onClick={() => navigate("/staff/pos")}
          className="mt-6 px-5 py-2.5 bg-primary text-on-primary font-bold rounded-xl shadow hover:opacity-90 transition-opacity"
        >
          Quay lại POS
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col items-center justify-center select-none bg-background py-6">
      
      {/* Dynamic inline styles for receipt zigzag paper and confetti */}
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

      {/* Confetti celebration container */}
      <div id="confetti-container" className="absolute inset-0 pointer-events-none overflow-hidden z-10" />

      {/* Success Title */}
      <div className="text-center mb-8 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary-container bg-opacity-20 text-secondary mb-4 shadow-sm hover:scale-105 transition-transform">
          <span className="material-symbols-outlined !text-[44px]">
            check_circle
          </span>
        </div>
        <h2 className="font-headline-sm text-headline-sm text-primary font-black mb-1">
          Thanh toán thành công!
        </h2>
        <p className="text-body-sm text-on-surface-variant">
          Mã hóa đơn: <span className="font-bold text-on-surface">#{receipt.invoiceNumber}</span>
        </p>
      </div>

      {/* Receipt body layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-4xl items-start z-10 px-4">
        
        {/* Receipt Paper Card */}
        <div className="flex justify-center w-full">
          <ReceiptView receipt={receipt} />
        </div>

        {/* Action Panel and summaries */}
        <div className="space-y-6 w-full">
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
            <h3 className="font-body-md font-bold mb-5 flex items-center gap-2 text-on-surface select-none border-b border-outline-variant/30 pb-3">
              <span className="material-symbols-outlined text-primary text-[20px]">
                analytics
              </span>
              Chi tiết giao dịch
            </h3>

            {/* Methods */}
            <div className="space-y-3.5 mb-6 select-text">
              <div className="flex items-center gap-4 p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/30">
                <span className="material-symbols-outlined text-secondary text-[24px]">
                  payments
                </span>
                <div>
                  <p className="text-[10px] text-on-surface-variant font-semibold">
                    Phương thức thanh toán
                  </p>
                  <p className="text-body-sm font-bold text-on-surface">
                    {PAYMENT_METHODS_MAP[receipt.paymentMethod] || receipt.paymentMethod || "Tiền mặt"}
                  </p>
                </div>
              </div>

              {receipt.transactionCode && (
                <div className="flex items-center gap-4 p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary text-[24px]">
                    receipt
                  </span>
                  <div>
                    <p className="text-[11px] text-on-surface-variant font-semibold">
                      Mã tham chiếu giao dịch
                    </p>
                    <p className="text-body-sm font-mono font-bold text-on-surface">
                      {receipt.transactionCode}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions panel */}
            <ReceiptActionPanel
              role="staff"
              invoiceId={invoiceId}
              onPrint={() => handlePrint(invoiceId)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffReceiptPage;
