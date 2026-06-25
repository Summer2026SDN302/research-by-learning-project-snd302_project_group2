import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReceipt } from "../hooks/useReceipt";
import ReceiptView from "../components/ReceiptView";
import ReceiptActionPanel from "../components/ReceiptActionPanel";
import Spinner from "@/components/feedback/Spinner";
import { PAYMENT_METHODS_MAP } from "@/modules/payment/constants/paymentConstants";
import dayjs from "dayjs";

const ManagerReceiptPage = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { receipt, loading, error, fetchReceipt, handlePrint, resetState } = useReceipt();

  useEffect(() => {
    fetchReceipt(invoiceId);
    return () => {
      resetState();
    };
  }, [invoiceId, fetchReceipt, resetState]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3 select-none">
        <Spinner size="lg" />
        <p className="text-body-sm text-on-surface-variant font-medium">
          Đang tải chi tiết biên lai quản trị...
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
          Lỗi tải biên lai quản trị
        </h2>
        <p className="text-body-sm text-on-surface-variant max-w-sm">
          {error || "Hóa đơn không hợp lệ hoặc bạn không có quyền truy cập."}
        </p>
        <button
          type="button"
          onClick={() => navigate("/manager/dashboard")}
          className="mt-6 px-5 py-2.5 bg-primary text-on-primary font-bold rounded-xl shadow hover:opacity-90 transition-opacity"
        >
          Quay lại Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col items-center justify-center select-none bg-background py-6">
      
      {/* Dynamic styles for receipt zigzag paper */}
      <style>{`
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

      {/* Page Header */}
      <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="font-headline-sm text-headline-sm text-primary font-black mb-1">
          Hóa đơn Quản lý (Manager View)
        </h2>
        <p className="text-body-sm text-on-surface-variant">
          Số hóa đơn: <span className="font-bold text-on-surface">#{receipt.invoiceNumber}</span>
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-4xl items-start px-4">
        
        {/* Receipt Paper Card */}
        <div className="flex justify-center w-full">
          <ReceiptView receipt={receipt} />
        </div>

        {/* Manager Action & Stats Dashboard */}
        <div className="space-y-6 w-full">
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
            <h3 className="font-body-md font-bold mb-4 text-on-surface border-b border-outline-variant/30 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">
                security
              </span>
              Thông tin Quản lý
            </h3>

            {/* Management Stats Grid */}
            <div className="space-y-3.5 mb-6 select-text">
              {/* Print Counter */}
              <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs">
                <span className="text-on-surface-variant font-medium">Số lần in hóa đơn:</span>
                <span className="font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[11px]">
                  {receipt.printCount || 0} lần
                </span>
              </div>

              {/* Last Printed Timestamp */}
              {receipt.lastPrintedAt && (
                <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs">
                  <span className="text-on-surface-variant font-medium">Thời gian in cuối:</span>
                  <span className="font-bold text-on-surface">
                    {dayjs(receipt.lastPrintedAt).format("DD/MM/YYYY HH:mm:ss")}
                  </span>
                </div>
              )}

              {/* Staff who served the order */}
              <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs space-y-1.5 font-mono">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase select-none">
                  Nhân viên lập đơn
                </p>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Họ tên:</span>
                  <span className="font-bold text-on-surface">
                    {receipt.staff?.fullName || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Username:</span>
                  <span className="font-bold text-on-surface">
                    {receipt.staff?.username || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Vai trò:</span>
                  <span className="font-bold text-on-surface">
                    {receipt.staff?.role || "Staff"}
                  </span>
                </div>
              </div>

              {/* Transaction details */}
              <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs space-y-1.5 font-mono">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase select-none">
                  Chi tiết thanh toán
                </p>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Phương thức:</span>
                  <span className="font-bold text-on-surface">
                    {PAYMENT_METHODS_MAP[receipt.paymentMethod] || receipt.paymentMethod || "Tiền mặt"}
                  </span>
                </div>
                {receipt.transactionCode && (
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Mã GD:</span>
                    <span className="font-bold text-primary truncate max-w-[160px]" title={receipt.transactionCode}>
                      {receipt.transactionCode}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Trạng thái:</span>
                  <span className="font-bold text-secondary uppercase text-[10px]">
                    {receipt.invoiceStatus || "Issued"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <ReceiptActionPanel
              role="manager"
              invoiceId={invoiceId}
              onPrint={() => handlePrint(invoiceId)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerReceiptPage;
