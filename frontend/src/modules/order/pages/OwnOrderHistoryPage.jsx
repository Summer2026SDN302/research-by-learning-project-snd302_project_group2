import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useOwnOrderHistory } from "../hooks/useOwnOrderHistory";
import Spinner from "@/components/feedback/Spinner";

const OwnOrderHistoryPage = () => {
  const navigate = useNavigate();
  const {
    orders,
    loading,
    kpis,
    filters,
    pagination,
    handleSearch,
    handlePageChange,
    handleFilterChange,
    refetch,
  } = useOwnOrderHistory();

  const [searchInput, setSearchInput] = useState(filters.search);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    handleSearch("");
  };

  const getStatusBadge = (status) => {
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
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container/30 text-error border border-error-container font-label-md text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
            Đã hủy
          </span>
        );
      case "Preparing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container/20 text-primary border border-primary-container font-label-md text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Đang chuẩn bị
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

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container text-[11px] font-bold">
            Đã trả
          </span>
        );
      case "Unpaid":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-error-container text-on-error-container text-[11px] font-bold">
            Chưa trả
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[11px] font-bold">
            Đang chờ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[11px] font-bold">
            {status}
          </span>
        );
    }
  };

  const getOrderItemsSummary = (items) => {
    if (!items || items.length === 0) return "Không có món";
    return items.map((i) => `${i.quantity}x ${i.name}`).join(", ");
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 bg-background min-h-screen">
      {/* Title */}
      <div>
        <h2 className="text-headline-lg font-bold text-on-background tracking-tight">
          Lịch sử đơn của tôi
        </h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Quản lý và theo dõi hiệu suất bán hàng cá nhân hôm nay.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-xl p-6 border border-outline-variant shadow-soft flex justify-between items-start">
          <div>
            <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
              Đơn hàng hôm nay
            </p>
            <h3 className="text-headline-md font-bold text-on-surface">
              {kpis.todayOrdersCount} đơn
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-container bg-opacity-20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-6 border border-outline-variant shadow-soft flex justify-between items-start">
          <div>
            <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
              Doanh thu cá nhân
            </p>
            <h3 className="text-headline-md font-bold text-on-surface">
              {kpis.personalRevenue.toLocaleString("vi-VN")}₫
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary-container bg-opacity-20 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined">payments</span>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-6 border border-outline-variant shadow-soft flex justify-between items-start">
          <div>
            <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
              Đơn đang chờ
            </p>
            <h3 className="text-headline-md font-bold text-on-surface">
              {kpis.pendingOrdersCount} đơn
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-tertiary-container bg-opacity-20 flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
        </div>
      </div>

      {/* Table & Filters Card */}
      <div className="bg-surface rounded-xl border border-outline-variant shadow-soft overflow-hidden flex flex-col">
        {/* Filters Header */}
        <div className="p-6 border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md flex gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant">
                search
              </span>
              <input
                className="w-full pl-10 pr-10 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background outline-none transition-all text-on-surface"
                placeholder="Tìm kiếm đơn hàng..."
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Tìm
            </button>
          </form>

          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-on-surface-variant">Trạng thái:</span>
              <select
                value={filters.orderStatus}
                onChange={(e) => handleFilterChange({ orderStatus: e.target.value })}
                className="border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs bg-background text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Tất cả</option>
                <option value="Pending">Đang chờ</option>
                <option value="Confirmed">Xác nhận</option>
                <option value="Preparing">Đang làm</option>
                <option value="Ready">Sẵn sàng</option>
                <option value="Completed">Hoàn thành</option>
                <option value="Cancelled">Đã hủy</option>
              </select>
            </div>

            <button
              onClick={refetch}
              className="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
              title="Tải lại dữ liệu"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
            </button>
          </div>
        </div>

        {/* Loading / Data Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-on-surface-variant">Đang tải lịch sử đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] mb-2 text-outline/50">
              receipt_long
            </span>
            <p className="font-semibold text-on-surface">Không tìm thấy đơn hàng nào</p>
            <p className="text-xs">Hãy thử đổi bộ lọc hoặc từ khóa tìm kiếm khác.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low text-on-surface-variant font-label-md text-xs uppercase tracking-wider border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-4 font-bold">Mã Đơn</th>
                  <th className="px-6 py-4 font-bold">Thời Gian</th>
                  <th className="px-6 py-4 font-bold">Món Ăn</th>
                  <th className="px-6 py-4 font-bold text-right">Tổng Tiền</th>
                  <th className="px-6 py-4 font-bold">Thanh Toán</th>
                  <th className="px-6 py-4 font-bold">Trạng Thái Đơn</th>
                  <th className="px-6 py-4 font-bold text-center">Biên Lai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-body-sm text-sm">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-surface-container-low transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-primary">
                      #{order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {dayjs(order.createdAt).format("HH:mm - DD/MM/YYYY")}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={getOrderItemsSummary(order.items)}>
                      {getOrderItemsSummary(order.items)}
                    </td>
                    <td className="px-6 py-4 font-bold text-right">
                      {(order.finalAmount || order.totalAmount || 0).toLocaleString("vi-VN")}₫
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.orderStatus)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          const role = window.location.pathname.startsWith("/manager") ? "manager" : "staff";
                          const targetInvoiceId = order.invoiceId?._id || order.invoiceId;
                          if (targetInvoiceId) {
                            navigate(`/${role}/receipts/${targetInvoiceId}`);
                          } else {
                            // If no invoice yet (unpaid or custom state), navigate to POS checkout or detail if needed
                            toast.error("Chưa có hóa đơn", "Đơn hàng này chưa hoàn tất thanh toán.");
                          }
                        }}
                        className="p-2 text-primary hover:bg-primary-container hover:bg-opacity-10 rounded-full transition-colors"
                        title="Xem biên lai / In"
                      >
                        <span className="material-symbols-outlined text-[18px]">print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && orders.length > 0 && (
          <div className="bg-surface-container-low border-t border-outline-variant p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-on-surface-variant">
              Hiển thị <span className="font-semibold text-on-surface">{(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)}</span> trong <span className="font-semibold text-on-surface">{pagination.total}</span> đơn hàng
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              
              <div className="flex items-center gap-1 text-xs">
                {Array.from({ length: pagination.totalPages }, (_, index) => {
                  const pNum = index + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => handlePageChange(pNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-all ${
                        pagination.page === pNum
                          ? "bg-primary text-on-primary shadow-sm"
                          : "hover:bg-surface-container text-on-surface"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnOrderHistoryPage;
