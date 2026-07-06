import React from "react";
// [CHƯA CÓ BE] useNavigate — sẽ cần khi BE có module Invoice
// import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Datepicker from "react-tailwindcss-datepicker";
import { useOwnOrderHistory } from "../hooks/useOwnOrderHistory";
import Spinner from "@/components/feedback/Spinner";
import ConfirmDialog from "@/components/feedback/ConfirmDialog";
import PaginationControl from "@/components/navigation/PaginationControl";
import OrderDetailModal from "../components/OrderDetailModal";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "Pending", label: "Đang chờ" },
  { value: "Confirmed", label: "Đã xác nhận" },
  { value: "Completed", label: "Hoàn thành" },
  { value: "Cancelled", label: "Đã hủy" },
  { value: "Returned", label: "Đã trả lại" },
];

const OwnOrderHistoryPage = () => {
  // [CHƯA CÓ BE] useNavigate
  // const navigate = useNavigate();
  const {
    orders,
    loading,
    kpis,
    filters,
    pagination,
    executeCancelOrder,
    // [CHƯA CÓ BE] handleSearch — BE chưa hỗ trợ search
    handlePageChange,
    handleFilterChange,
    refetch,
  } = useOwnOrderHistory();

  const [statusDropdownOpen, setStatusDropdownOpen] = React.useState(false);
  const [cancelOrderId, setCancelOrderId] = React.useState(null);
  const [detailOrderId, setDetailOrderId] = React.useState(null);
  const [isCanceling, setIsCanceling] = React.useState(false);

  const confirmCancel = async () => {
    setIsCanceling(true);
    await executeCancelOrder(cancelOrderId);
    setIsCanceling(false);
    setCancelOrderId(null);
  };

  const dateValue = React.useMemo(() => ({
    startDate: filters.fromDate || null,
    endDate: filters.toDate || null
  }), [filters.fromDate, filters.toDate]);

  /**
   * Badge trạng thái đơn hàng — khớp với BE ORDER_STATUS:
   * Pending, Confirmed, Completed, Cancelled, Returned
   */
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

  // [CHƯA CÓ BE] getPaymentStatusBadge — BE chưa có field paymentStatus trong Order model
  // const getPaymentStatusBadge = (status) => { ... };

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
      <div className="bg-surface rounded-xl border border-outline-variant shadow-soft overflow-visible flex flex-col">
        {/* Filter Section matching Image 2 */}
        <div className="p-4 border-b border-outline-variant bg-surface-container-lowest flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Khoảng thời gian (Date Picker) */}
          <div className="flex-1 max-w-md relative z-20">
            <Datepicker
              value={dateValue}
              onChange={(newValue) => {
                let from = newValue?.startDate || "";
                let to = newValue?.endDate || "";
                if (typeof from === 'string' && from.includes('/')) {
                  const [d, m, y] = from.split('/');
                  from = `${y}-${m}-${d}`;
                } else if (from) {
                  from = dayjs(from).format("YYYY-MM-DD");
                }
                
                if (typeof to === 'string' && to.includes('/')) {
                  const [d, m, y] = to.split('/');
                  to = `${y}-${m}-${d}`;
                } else if (to) {
                  to = dayjs(to).format("YYYY-MM-DD");
                }
                
                handleFilterChange({ 
                  fromDate: from, 
                  toDate: to 
                });
              }}
              useRange={false}
              showShortcuts={true}
              primaryColor="teal"
              inputClassName="w-full text-sm bg-white border border-outline-variant rounded-full px-4 py-2 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
              displayFormat="DD/MM/YYYY"
              placeholder="Chọn ngày"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Filter: Trạng thái đơn hàng */}
            <div className="relative">
              <div 
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className={`flex items-center bg-white border rounded-lg px-3 py-2 text-sm text-on-surface cursor-pointer transition-all ${statusDropdownOpen ? 'ring-1 ring-primary border-primary' : 'border-outline-variant hover:border-outline'}`}
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant mr-2">receipt_long</span>
                <span className="flex-1 text-[13px] truncate pr-4">
                  {STATUS_OPTIONS.find((opt) => opt.value === filters.orderStatus)?.label || "Tất cả trạng thái"}
                </span>
                <span className={`material-symbols-outlined text-[18px] text-on-surface-variant transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`}>
                  arrow_drop_down
                </span>
              </div>
              
              {/* Custom Dropdown List */}
              {statusDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setStatusDropdownOpen(false)}></div>
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-outline-variant rounded-xl shadow-lg z-40 overflow-hidden py-1 min-w-[160px]">
                    {STATUS_OPTIONS.map((option) => (
                      <div
                        key={option.value}
                        onClick={() => {
                          handleFilterChange({ orderStatus: option.value });
                          setStatusDropdownOpen(false);
                        }}
                        className={`px-4 py-2.5 text-[13px] cursor-pointer transition-colors ${
                          filters.orderStatus === option.value
                            ? "bg-primary-container text-on-primary-container font-semibold"
                            : "text-on-surface hover:bg-surface-container-low"
                        }`}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <button
              onClick={refetch}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-primary text-primary rounded-lg hover:bg-primary-container transition-all font-label-md text-sm font-semibold"
              title="Tải lại dữ liệu"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Tải lại
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
                  {/* [CHƯA CÓ BE] Cột "Thanh Toán" — paymentStatus chưa có trong Order model */}
                  <th className="px-6 py-4 font-bold text-center">Trạng Thái Đơn</th>
                  <th className="px-6 py-4 font-bold text-center">Biên Lai / Hành Động</th>
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
                    {/* Dùng totalAmount — BE DTO trả về totalAmount (không có finalAmount) */}
                    <td className="px-6 py-4 font-bold text-right">
                      {(order.totalAmount || 0).toLocaleString("vi-VN")}₫
                    </td>
                    {/* [CHƯA CÓ BE] Cột paymentStatus
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(order.orderStatus)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setDetailOrderId(order._id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
                          title="Xem chi tiết đơn hàng"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                        {order.orderStatus === "Pending" && (
                          <button
                            onClick={() => setCancelOrderId(order._id)}
                            className="px-3 py-1.5 bg-error-container text-on-error-container text-xs font-semibold rounded-lg hover:bg-error hover:text-white transition-colors"
                            title="Huỷ đơn hàng"
                          >
                            Huỷ đơn
                          </button>
                        )}
                      </div>
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
            <PaginationControl
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Cancel Order Confirm Dialog */}
      <ConfirmDialog
        open={!!cancelOrderId}
        title="Huỷ đơn hàng"
        description="Bạn có chắc chắn muốn huỷ đơn hàng này? Thao tác này không thể hoàn tác."
        confirmLabel="Huỷ đơn"
        cancelLabel="Đóng"
        variant="danger"
        isLoading={isCanceling}
        onConfirm={confirmCancel}
        onCancel={() => setCancelOrderId(null)}
      />

      {/* Order Detail Modal */}
      <OrderDetailModal 
        open={!!detailOrderId}
        onClose={() => setDetailOrderId(null)}
        orderId={detailOrderId}
      />
    </div>
  );
};

export default OwnOrderHistoryPage;
