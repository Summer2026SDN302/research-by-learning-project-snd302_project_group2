import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { getOrderById } from "../api/orderApi";
import Spinner from "@/components/feedback/Spinner";

const getOrderStatusBadge = (status) => {
  switch (status) {
    case "Completed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container/30 text-secondary border border-secondary-container font-label-md text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          Hoàn thành
        </span>
      );
    case "Pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-container/30 text-tertiary border border-tertiary-container font-label-md text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
          Đang chờ
        </span>
      );
    case "Confirmed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container/20 text-primary border border-primary-container font-label-md text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
          Đã xác nhận
        </span>
      );
    case "Cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container/30 text-error border border-error-container font-label-md text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
          Đã hủy
        </span>
      );
    case "Returned":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-outline/20 text-on-surface-variant border border-outline font-label-md text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
          Đã trả lại
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-outline/20 text-on-surface-variant border border-outline font-label-md text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
          {status}
        </span>
      );
  }
};

const OrderDetailModal = ({ open, onClose, orderId }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchOrderDetail = async () => {
      if (!orderId || !open) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getOrderById(orderId);
        if (isMounted) setOrder(data);
      } catch (err) {
        if (isMounted) setError(err?.message || "Không thể tải chi tiết đơn hàng");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchOrderDetail();
    return () => {
      isMounted = false;
    };
  }, [orderId, open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-xl flex flex-col pointer-events-auto max-h-[90vh] overflow-hidden">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container/30 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              </div>
              <div>
                <h3 className="text-title-md font-bold text-on-surface leading-tight">
                  Chi tiết đơn hàng
                </h3>
                {order && <p className="text-body-sm text-on-surface-variant">#{order.orderNumber}</p>}
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Spinner size="md" />
                <p className="text-sm text-on-surface-variant">Đang tải dữ liệu...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-error text-[48px] mb-2">error</span>
                <p className="text-on-surface font-semibold">{error}</p>
                <button 
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-full text-sm font-semibold"
                >
                  Đóng
                </button>
              </div>
            ) : order ? (
              <div className="flex flex-col gap-6">
                
                {/* General Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/50 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant mt-0.5">info</span>
                    <div>
                      <p className="text-on-surface-variant text-[11px] uppercase tracking-wider font-bold mb-0.5">Trạng thái</p>
                      <p>{getOrderStatusBadge(order.orderStatus)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant mt-0.5">calendar_month</span>
                    <div>
                      <p className="text-on-surface-variant text-[11px] uppercase tracking-wider font-bold mb-0.5">Thời gian đặt</p>
                      <p className="font-semibold text-on-surface">{dayjs(order.orderDate).format("HH:mm - DD/MM/YYYY")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant mt-0.5">badge</span>
                    <div>
                      <p className="text-on-surface-variant text-[11px] uppercase tracking-wider font-bold mb-0.5">Nhân viên tạo</p>
                      <p className="font-semibold text-on-surface">
                        {order.staffId?.fullName || order.staffId?.username || (typeof order.staffId === "string" ? order.staffId.slice(-6) : "N/A")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant mt-0.5">person</span>
                    <div>
                      <p className="text-on-surface-variant text-[11px] uppercase tracking-wider font-bold mb-0.5">Khách hàng</p>
                      <p className="font-semibold text-on-surface">
                        {order.customerName ? `${order.customerName} - ${order.customerPhone || ''}` : "Khách vãng lai"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <hr className="border-outline-variant" />

                {/* Items List */}
                <div>
                  <h4 className="text-label-lg font-bold text-on-surface mb-3 uppercase tracking-wider">Danh Sách Món</h4>
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-surface-container-low border-b border-outline-variant">
                        <tr>
                          <th className="px-4 py-2 font-semibold">Tên món</th>
                          <th className="px-4 py-2 font-semibold text-right">SL</th>
                          <th className="px-4 py-2 font-semibold text-right">Đơn giá</th>
                          <th className="px-4 py-2 font-semibold text-right">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/50">
                        {order.items?.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3">{item.name}</td>
                            <td className="px-4 py-3 text-right">{item.quantity}</td>
                            <td className="px-4 py-3 text-right">{(item.unitPrice || 0).toLocaleString("vi-VN")}₫</td>
                            <td className="px-4 py-3 text-right font-semibold">{(item.lineTotal || 0).toLocaleString("vi-VN")}₫</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary */}
                <div className="flex flex-col gap-2.5 items-end text-sm bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/50 shadow-sm mt-2">
                  <div className="flex justify-between w-full max-w-[250px] items-center">
                    <span className="text-on-surface-variant">Tạm tính</span>
                    <span className="font-semibold">{(order.subTotal || 0).toLocaleString("vi-VN")}₫</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between w-full max-w-[250px] items-center text-primary">
                      <span>Giảm giá</span>
                      <span className="font-semibold bg-primary/10 px-2 rounded">-{(order.discountAmount).toLocaleString("vi-VN")}₫</span>
                    </div>
                  )}
                  {order.taxAmount > 0 && (
                    <div className="flex justify-between w-full max-w-[250px] items-center">
                      <span className="text-on-surface-variant">Thuế (VAT)</span>
                      <span className="font-semibold">{(order.taxAmount).toLocaleString("vi-VN")}₫</span>
                    </div>
                  )}
                  <div className="w-full max-w-[250px] h-[1px] bg-outline-variant my-1"></div>
                  <div className="flex justify-between w-full max-w-[250px] items-center">
                    <span className="text-title-sm font-bold text-on-surface uppercase">Tổng cộng</span>
                    <span className="text-title-lg font-bold text-primary">{(order.totalAmount || 0).toLocaleString("vi-VN")}₫</span>
                  </div>
                </div>

              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-lowest flex justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-full text-sm font-semibold transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailModal;
