import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as orderApi from "@/modules/order/api/orderApi";
import * as paymentApi from "@/modules/payment/api/paymentApi";
import Spinner from "@/components/feedback/Spinner";
import { formatCurrency } from "@/utils/formatters";
import dayjs from "dayjs";
import useAppToast from "@/hooks/useAppToast";

const ReceiptPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useAppToast();

  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch order and payment details
  const fetchReceiptData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const orderData = await orderApi.getOrderById(orderId);
      setOrder(orderData);

      if (orderData.paymentId) {
        const paymentId = orderData.paymentId._id || orderData.paymentId;
        const paymentData = await paymentApi.getPaymentById(paymentId);
        setPayment(paymentData);
      }
    } catch (err) {
      setError(err?.message || "Không thể tải dữ liệu hóa đơn.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchReceiptData();
  }, [fetchReceiptData]);

  // Confetti Effect
  useEffect(() => {
    if (loading || error || !order) return;

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
  }, [loading, error, order]);

  const handlePrint = () => {
    window.print();
    toast.success("In hóa đơn", "Yêu cầu in hóa đơn đã được gửi.");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3 select-none">
        <Spinner size="lg" />
        <p className="text-body-sm text-on-surface-variant font-medium">
          Đang tải chi tiết hóa đơn...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] select-none text-center px-4">
        <span className="material-symbols-outlined text-[64px] text-error mb-4">
          error
        </span>
        <h2 className="text-headline-sm font-bold text-on-surface mb-2">
          Lỗi tải hóa đơn
        </h2>
        <p className="text-body-sm text-on-surface-variant max-w-sm">
          {error || "Không tìm thấy thông tin đơn hàng."}
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
      
      {/* Styles for Confetti & Zigzag Receipt Paper */}
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

      {/* Confetti Container */}
      <div id="confetti-container" className="absolute inset-0 pointer-events-none overflow-hidden z-10" />

      {/* Success Header */}
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
          Mã đơn hàng: <span className="font-bold text-on-surface">#{order.orderNumber}</span>
        </p>
      </div>

      {/* Main Grid: Left is Receipt, Right is Action Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-4xl items-start z-10 px-4">
        
        {/* Left: Classic Receipt Paper Graphic */}
        <div className="flex justify-center w-full">
          <div className="receipt-paper w-full max-w-[360px] p-8 font-mono text-on-surface-variant rounded-sm text-sm border-x border-outline-variant/20">
            
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-block p-1.5 border-2 border-primary text-primary font-black text-lg tracking-tighter mb-2">
                STALLBOX
              </div>
              <p className="text-xs font-bold uppercase text-on-surface">Canteen Tech Hub</p>
              <p className="text-[10px] text-on-surface-variant/80">
                Khu Công Nghệ Phần Mềm ĐHQG HCM
              </p>
              <p className="text-[10px] text-on-surface-variant/80">SĐT: 028-1234-5678</p>
            </div>

            <div className="border-b border-dashed border-outline-variant my-3" />

            {/* Receipt metadata */}
            <div className="space-y-1 text-xs mb-4">
              <div className="flex justify-between">
                <span>Số HĐ:</span>
                <span className="text-on-surface font-semibold">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Ngày:</span>
                <span className="text-on-surface">
                  {dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Nhân viên:</span>
                <span className="text-on-surface truncate max-w-[150px]">
                  {order.servedBy?.fullName || order.servedBy?.username || "Staff POS"}
                </span>
              </div>
            </div>

            <div className="border-b border-dashed border-outline-variant my-3" />

            {/* Items detail list */}
            <div className="space-y-3 mb-4 text-xs">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className="flex justify-between text-on-surface font-bold">
                    <span className="truncate max-w-[200px]">{item.name}</span>
                    <span>{(item.unitPrice * item.quantity).toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-on-surface-variant/80">
                    <span>{item.quantity} x {item.unitPrice.toLocaleString("vi-VN")}đ</span>
                  </div>
                  {item.note && (
                    <span className="text-[10px] italic text-primary">- Ghi chú: {item.note}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="border-b border-dashed border-outline-variant my-3" />

            {/* Calculations totals */}
            <div className="space-y-1.5 mb-6 text-xs shrink-0">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{order.subtotalAmount?.toLocaleString("vi-VN")}đ</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span>Khuyến mãi:</span>
                  <span className="text-primary">-{order.discountAmount?.toLocaleString("vi-VN")}đ</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Thuế VAT ({(order.taxRate * 100).toFixed(0)}%):</span>
                <span>{order.taxAmount?.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between text-base font-bold text-on-surface pt-1.5 border-t border-dashed border-outline-variant">
                <span>TỔNG TIỀN:</span>
                <span>{order.finalAmount?.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>

            {/* Thank you note */}
            <div className="text-center space-y-3 pt-2">
              <p className="font-bold text-on-surface text-xs">Cảm ơn Quý khách!</p>
              <p className="text-[9px] leading-relaxed text-on-surface-variant/70">
                Vui lòng mang hóa đơn này tới quầy nhận món. StallBox phục vụ tận tâm.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions & Details summary card */}
        <div className="space-y-6 w-full">
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
            <h3 className="font-body-md font-bold mb-5 flex items-center gap-2 text-on-surface select-none">
              <span className="material-symbols-outlined text-primary text-[20px]">
                analytics
              </span>
              Chi tiết giao dịch
            </h3>

            {/* Method Details */}
            <div className="space-y-3.5 mb-6 select-text">
              <div className="flex items-center gap-4 p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/30">
                <span className="material-symbols-outlined text-secondary text-[24px]">
                  payments
                </span>
                <div>
                  <p className="text-[11px] text-on-surface-variant font-semibold">
                    Phương thức thanh toán
                  </p>
                  <p className="text-body-sm font-bold text-on-surface">
                    {payment?.paymentMethod === "Cash"
                      ? "Tiền mặt (Cash)"
                      : payment?.paymentMethod === "Card"
                      ? `Thẻ POS - ${payment.providerName || "Napas"}`
                      : `Chuyển khoản QR - ${payment?.providerName || "VietQR"}`}
                  </p>
                </div>
              </div>

              {/* If cash, show details */}
              {payment?.paymentMethod === "Cash" && (
                <div className="grid grid-cols-2 gap-3 shrink-0">
                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-left">
                    <p className="text-[10px] text-on-surface-variant font-semibold">Khách đưa</p>
                    <p className="text-body-md font-bold text-on-surface">
                      {payment.amountReceived ? `${payment.amountReceived.toLocaleString("vi-VN")}đ` : "—"}
                    </p>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-left">
                    <p className="text-[10px] text-on-surface-variant font-semibold">Tiền thừa</p>
                    <p className="text-body-md font-bold text-secondary">
                      {payment.changeReturned !== undefined ? `${payment.changeReturned.toLocaleString("vi-VN")}đ` : "—"}
                    </p>
                  </div>
                </div>
              )}

              {/* If QR or Card and has reference code */}
              {payment?.transactionCode && (
                <div className="flex items-center gap-4 p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary text-[24px]">
                    receipt
                  </span>
                  <div>
                    <p className="text-[11px] text-on-surface-variant font-semibold">
                      Mã tham chiếu giao dịch
                    </p>
                    <p className="text-body-sm font-mono font-bold text-on-surface">
                      {payment.transactionCode}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => navigate("/staff/pos")}
                className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-md"
              >
                <span className="material-symbols-outlined">add_circle</span>
                Tạo đơn mới
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="py-3.5 border-2 border-primary text-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/5 active:scale-[0.98] transition-all"
                >
                  <span className="material-symbols-outlined">print</span>
                  In lại
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/staff/dashboard")}
                  className="py-3.5 bg-surface-container-high text-on-surface rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-surface-container-highest active:scale-[0.98] transition-all"
                >
                  <span className="material-symbols-outlined">dashboard</span>
                  Tổng quan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPage;
