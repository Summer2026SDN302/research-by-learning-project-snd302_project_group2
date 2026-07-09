import { useMemo } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import Spinner from "@/components/feedback/Spinner";
import StatusBadge from "@/components/data-display/StatusBadge";
import DataTable from "@/components/data-display/DataTable";

import { ORDER_DETAIL_TABLE_COLUMNS, ORDER_STATUS_MAP } from "../constants/orderConstants";
import { useOrderDetail } from "../hooks/useOrderDetail";

const getOrderStatusBadge = (status) => {
  const config = ORDER_STATUS_MAP[status];
  if (config) {
    return <StatusBadge status={config.statusKey} label={config.label} />;
  }
  return <StatusBadge status="pending" label={status} />;
};

const OrderDetailModal = ({ open, onClose, orderId }) => {
  const { order, loading, error } = useOrderDetail(orderId, open);

  const rows = useMemo(() => {
    if (!order) return [];
    const itemRows = (order.items || []).map((item, idx) => ({
      id: `item-${idx}`,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      note: item.note,
      isSummary: false,
    }));

    const summaryRows = [
      {
        id: "summary-subtotal",
        name: (
          <span className="font-medium text-on-surface-variant is-summary-row is-first-summary">
            Tổng tiền trước thuế
          </span>
        ),
        quantity: "",
        unitPrice: "",
        lineTotal: (
          <span className="font-semibold">
            {(order.subTotal || 0).toLocaleString("vi-VN")}₫
          </span>
        ),
        isSummary: true,
      },
    ];

    if (order.discountAmount > 0) {
      summaryRows.push({
        id: "summary-discount",
        name: (
          <span className="font-semibold text-primary is-summary-row">
            Giảm giá
          </span>
        ),
        quantity: "",
        unitPrice: "",
        lineTotal: (
          <span className="font-semibold bg-primary/10 px-2 py-0.5 rounded text-xs text-primary">
            -{order.discountAmount.toLocaleString("vi-VN")}₫
          </span>
        ),
        isSummary: true,
      });
    }

    if (order.taxAmount > 0) {
      summaryRows.push({
        id: "summary-tax",
        name: (
          <span className="font-medium text-on-surface-variant is-summary-row">
            Thuế (VAT)
          </span>
        ),
        quantity: "",
        unitPrice: "",
        lineTotal: (
          <span className="font-semibold">
            {order.taxAmount.toLocaleString("vi-VN")}₫
          </span>
        ),
        isSummary: true,
      });
    }

    summaryRows.push({
      id: "summary-total",
      name: (
        <span className="text-label-md font-bold text-on-surface uppercase tracking-wider is-summary-row is-total-row">
          Tổng cộng
        </span>
      ),
      quantity: "",
      unitPrice: "",
      lineTotal: (
        <span className="text-title-md font-bold text-primary">
          {(order.totalAmount || 0).toLocaleString("vi-VN")}₫
        </span>
      ),
      isSummary: true,
    });

    return [...itemRows, ...summaryRows];
  }, [order]);

  const renderCell = (key, value, row) => {
    if (row.isSummary) {
      return value;
    }

    switch (key) {
      case "name":
        return (
          <div>
            <span className="font-medium text-on-surface">{value}</span>
            {row.note && (
              <p className="text-xs text-on-surface-variant italic mt-0.5">
                * Ghi chú: {row.note}
              </p>
            )}
          </div>
        );
      case "quantity":
        return <span className="font-medium">{value}</span>;
      case "unitPrice":
        return `${(value || 0).toLocaleString("vi-VN")}₫`;
      case "lineTotal":
        return (
          <span className="font-bold text-primary">
            {(value || 0).toLocaleString("vi-VN")}₫
          </span>
        );
      default:
        return value;
    }
  };

  if (!open) return null;

  return createPortal(
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
                <span className="material-symbols-outlined text-[20px]">
                  receipt_long
                </span>
              </div>
              <div>
                <h3 className="text-title-md font-bold text-on-surface leading-tight">
                  Chi tiết đơn hàng
                </h3>
                {order && (
                  <p className="text-body-sm text-on-surface-variant">
                    #{order.orderNumber}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[20px]">
                close
              </span>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Spinner size="md" />
                <p className="text-sm text-on-surface-variant">
                  Đang tải dữ liệu...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-error text-[48px] mb-2">
                  error
                </span>
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
                    <span className="material-symbols-outlined text-on-surface-variant mt-0.5">
                      info
                    </span>
                    <div>
                      <p className="text-on-surface-variant text-[11px] uppercase tracking-wider font-bold mb-0.5">
                        Trạng thái
                      </p>
                      <p>{getOrderStatusBadge(order.orderStatus)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant mt-0.5">
                      calendar_month
                    </span>
                    <div>
                      <p className="text-on-surface-variant text-[11px] uppercase tracking-wider font-bold mb-0.5">
                        Thời gian đặt
                      </p>
                      <p className="font-semibold text-on-surface">
                        {dayjs(order.createdAt).format("HH:mm - DD/MM/YYYY")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant mt-0.5">
                      badge
                    </span>
                    <div>
                      <p className="text-on-surface-variant text-[11px] uppercase tracking-wider font-bold mb-0.5">
                        Nhân viên tạo
                      </p>
                      <p className="font-semibold text-on-surface">
                        {order.staffId?.fullName ||
                          order.staffId?.username ||
                          (typeof order.staffId === "string"
                            ? order.staffId.slice(-6)
                            : "N/A")}
                      </p>
                    </div>
                  </div>
                  {order.notes && (
                    <div className="flex items-start gap-3 md:col-span-2 border-t border-outline-variant/30 pt-3">
                      <span className="material-symbols-outlined text-on-surface-variant mt-0.5">
                        description
                      </span>
                      <div>
                        <p className="text-on-surface-variant text-[11px] uppercase tracking-wider font-bold mb-0.5">
                          Ghi chú đơn hàng
                        </p>
                        <p className="text-on-surface italic">"{order.notes}"</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <hr className="border-outline-variant" />

                {/* Items List & Summary Table */}
                <div className="space-y-3">
                  <h4 className="text-label-lg font-bold text-on-surface uppercase tracking-wider">
                    Chi Tiết Đơn Hàng
                  </h4>
                  <div className="[&_th:nth-child(2)]:text-right [&_td:nth-child(2)]:text-right [&_th:nth-child(2)_span]:justify-end [&_th:nth-child(2)_span]:w-full [&_th:nth-child(3)]:text-right [&_td:nth-child(3)]:text-right [&_th:nth-child(3)_span]:justify-end [&_th:nth-child(3)_span]:w-full [&_th:nth-child(4)]:text-right [&_td:nth-child(4)]:text-right [&_th:nth-child(4)_span]:justify-end [&_th:nth-child(4)_span]:w-full [&_tr:has(.is-summary-row)]:bg-surface-container-low [&_tr:has(.is-summary-row)]:hover:bg-surface-container-low [&_tr:has(.is-first-summary)]:border-t [&_tr:has(.is-first-summary)]:border-outline-variant [&_tr:has(.is-total-row)]:border-t [&_tr:has(.is-total-row)]:border-outline-variant [&_tr:has(.is-total-row)]:bg-surface-container [&_tr:has(.is-total-row)]:hover:bg-surface-container">
                    <DataTable
                      columns={ORDER_DETAIL_TABLE_COLUMNS}
                      rows={rows}
                      renderCell={renderCell}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default OrderDetailModal;
