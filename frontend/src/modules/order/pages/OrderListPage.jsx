import React from "react";
import { useLocation } from "react-router-dom";
// [CHƯA CÓ BE] useNavigate — sẽ cần khi BE có module Invoice
// import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Spinner from "@/components/feedback/Spinner";
// [CHƯA CÓ BE] useAppToast — tạm không cần vì bỏ logic receipt
// import useAppToast from "@/hooks/useAppToast";
// [CHƯA CÓ BE] formatCurrency — dùng toLocaleString trực tiếp
// import { formatCurrency } from "@/utils/formatters";
import { useOrderList } from "../hooks/useOrderList";
import Datepicker from "react-tailwindcss-datepicker";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "Pending", label: "Đang chờ" },
  { value: "Confirmed", label: "Đã xác nhận" },
  { value: "Completed", label: "Hoàn thành" },
  { value: "Cancelled", label: "Đã hủy" },
  { value: "Returned", label: "Đã trả lại" },
];

const getRoleLabel = (role) => {
  switch (role) {
    case "Admin":
      return (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-error" />
          <span className="text-on-surface">Admin</span>
        </div>
      );
    case "Manager":
      return (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary-container" />
          <span className="text-on-surface">Quản lý</span>
        </div>
      );
    case "Staff":
      return (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span className="text-on-surface">Nhân viên</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-outline" />
          <span className="text-on-surface">Khách lẻ</span>
        </div>
      );
  }
};

/**
 * Badge trạng thái đơn hàng — khớp với BE ORDER_STATUS:
 * Pending, Confirmed, Completed, Cancelled, Returned
 */
const getOrderStatusBadge = (status) => {
  switch (status) {
    case "Completed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container/30 text-secondary border border-secondary-container font-label-md text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          Hoàn thành
        </span>
      );
    case "Pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-container/30 text-tertiary border border-tertiary-container font-label-md text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
          Đang chờ
        </span>
      );
    case "Confirmed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container/20 text-primary border border-primary-container font-label-md text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Đã xác nhận
        </span>
      );
    case "Cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container/30 text-error border border-error-container font-label-md text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-error" />
          Đã hủy
        </span>
      );
    case "Returned":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-outline/20 text-on-surface-variant border border-outline font-label-md text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-outline" />
          Đã trả lại
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-outline/20 text-on-surface-variant border border-outline font-label-md text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-outline" />
          {status}
        </span>
      );
  }
};

// [CHƯA CÓ BE] getPaymentStatusBadge — BE chưa có field paymentStatus trong Order model
// const getPaymentStatusBadge = (status) => { ... };

const OrderListPage = () => {
  // [CHƯA CÓ BE] useNavigate — sẽ cần khi BE có module Invoice
  // const navigate = useNavigate();
  const location = useLocation();
  // [CHƯA CÓ BE] toast — tạm không cần
  // const { toast } = useAppToast();
  const {
    orders,
    loading,
    filters,
    pagination,
    // [CHƯA CÓ BE] handleSearch,
    handlePageChange,
    handleFilterChange,
    refetch,
  } = useOrderList();

  const [statusDropdownOpen, setStatusDropdownOpen] = React.useState(false);
  const roleBasePath = location.pathname.startsWith("/manager") ? "/manager" : "/admin";

  const dateValue = React.useMemo(() => ({
    startDate: filters.fromDate || null,
    endDate: filters.toDate || null
  }), [filters.fromDate, filters.toDate]);

  return (
    <div className="flex-1 p-container-p-mobile md:p-container-p-desktop flex flex-col h-full bg-background overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface tracking-tight">
            Lịch sử đơn hàng
          </h2>
          <p className="text-body-md text-on-surface-variant mt-1">
            Quản lý, theo dõi và xử lý các giao dịch trong hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* [CHƯA CÓ BE] Nút "Danh sách thanh toán" — module Payment chưa có */}
          {/* <button
            type="button"
            onClick={() => navigate(`${roleBasePath}/payments`)}
            className="..."
          >
            Danh sách thanh toán
          </button> */}
        </div>
      </div>

      {/* Filter Section matching Mockup */}
      <div className="flex flex-col xl:flex-row gap-4 mb-6 xl:items-end">
        {/* Filters Group */}
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          {/* Filter 1: Khoảng thời gian (Date Picker) */}
          <div className="flex-1 bg-white border border-outline-variant rounded-2xl p-4 flex flex-col justify-center relative z-20">
            <span className="text-[13px] font-semibold text-on-surface mb-3">Khoảng thời gian</span>
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
              placeholder="Từ ngày - Đến ngày"
              separator="-"
            />
          </div>

          {/* Filter 2: Trạng thái đơn hàng (Custom Dropdown) */}
          <div className="flex-1 bg-white border border-outline-variant rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-[13px] font-semibold text-on-surface mb-3">Trạng thái đơn hàng</span>
            <div className="relative">
              <div 
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className={`flex items-center bg-white border rounded-full px-4 py-2 text-sm text-on-surface cursor-pointer transition-all ${statusDropdownOpen ? 'ring-1 ring-primary border-primary' : 'border-outline-variant hover:border-outline'}`}
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant mr-2">receipt_long</span>
                <span className="flex-1 text-[13px] truncate">
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
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-outline-variant rounded-xl shadow-lg z-40 overflow-hidden py-1">
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
          </div>

          {/* Filter 3: Phương thức (Vẫn giữ nhưng mờ đi vì BE ko có) */}
          <div className="flex-1 bg-white border border-outline-variant rounded-2xl p-4 flex flex-col justify-center opacity-50 cursor-not-allowed" title="Chưa hỗ trợ">
            <span className="text-[13px] font-semibold text-on-surface mb-3">Phương thức</span>
            <div className="flex items-center gap-2 bg-white border border-outline-variant rounded-full px-4 py-2 text-sm text-on-surface">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">payments</span>
              <span className="flex-1 text-[13px]">Tất cả phương thức</span>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">arrow_drop_down</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row xl:flex-col items-stretch sm:items-center xl:items-end gap-3 justify-end">
          {roleBasePath === "/manager" && (
            <button
              type="button"
              onClick={() => window.location.href = "/manager/create-order"}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-all shadow-sm font-label-md text-sm font-semibold h-[42px] w-full sm:w-[130px]"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tạo POS
            </button>
          )}
          <button
            onClick={refetch}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-primary text-primary rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm font-label-md text-sm font-semibold h-[42px] w-full sm:w-[130px]"
            title="Tải lại dữ liệu"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Tải lại
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-on-surface-variant">
              Đang tải danh sách đơn hàng...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] mb-2 text-outline/50">
              receipt_long
            </span>
            <p className="font-semibold text-on-surface">Không tìm thấy đơn hàng nào</p>
            <p className="text-xs">
              Vui lòng thay đổi từ khóa hoặc bộ lọc để xem kết quả.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                    Mã ĐH
                  </th>
                  <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                    Thời gian
                  </th>
                  <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                    Người tạo
                  </th>
                  {/* [CHƯA CÓ BE] staffId chưa populate ở BE DTO nên không lấy được role.
                      Tạm ẩn cột "Loại tài khoản" */}
                  {/* <th>Loại tài khoản</th> */}
                  <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant whitespace-nowrap text-right">
                    Tổng tiền
                  </th>
                  {/* [CHƯA CÓ BE] Cột "Thanh toán" — paymentStatus chưa có */}
                  <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                    Trạng thái đơn
                  </th>
                  {/* [CHƯA CÓ BE] Cột "Thao tác" (xem biên lai) — module Invoice chưa có */}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {orders.map((order) => {
                  const orderTimestamp = order.orderDate || order.createdAt;

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-surface-container-low transition-colors duration-200"
                    >
                      <td className="py-4 px-6 font-label-md text-label-md text-primary font-bold">
                        #{order.orderNumber}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-body-md text-body-md text-on-surface">
                          {dayjs(orderTimestamp).format("HH:mm")}
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">
                          {dayjs(orderTimestamp).format("DD/MM/YYYY")}
                        </div>
                      </td>
                      {/* BE DTO trả staffId là ObjectId (chưa populate) nên hiện ID tạm */}
                      <td className="py-4 px-6 font-body-md text-body-md text-on-surface whitespace-nowrap">
                        {order.staffId?.fullName || order.staffId?.username || (typeof order.staffId === "string" ? order.staffId.slice(-6) : "N/A")}
                      </td>
                      {/* [CHƯA CÓ BE] Cột role
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getRoleLabel(order.staffId?.role)}
                      </td> */}
                      {/* Dùng totalAmount — BE DTO trả totalAmount (không có finalAmount) */}
                      <td className="py-4 px-6 font-body-md text-body-md text-on-surface font-semibold text-right">
                        {(order.totalAmount || 0).toLocaleString("vi-VN")}₫
                      </td>
                      {/* [CHƯA CÓ BE] Cột paymentStatus
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </td> */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getOrderStatusBadge(order.orderStatus)}
                      </td>
                      {/* [CHƯA CÓ BE] Nút xem biên lai — module Invoice chưa có
                      <td className="py-4 px-6 text-center">
                        <button onClick={() => handleOpenReceipt(order)}>...</button>
                      </td> */}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="bg-surface-container-low border-t border-outline-variant p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-on-surface-variant">
              Hiển thị{" "}
              <span className="font-semibold text-on-surface">
                {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              trong{" "}
              <span className="font-semibold text-on-surface">{pagination.total}</span>{" "}
              đơn hàng
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded-full text-on-surface-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  chevron_left
                </span>
              </button>

              <div className="flex items-center gap-1 text-xs">
                {Array.from({ length: pagination.totalPages }, (_, index) => {
                  const pageNumber = index + 1;

                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full font-bold transition-all ${
                        pagination.page === pageNumber
                          ? "bg-primary text-on-primary shadow-sm"
                          : "hover:bg-surface-container text-on-surface"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded-full text-on-surface-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderListPage;
