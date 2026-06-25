import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Spinner from "@/components/feedback/Spinner";
import useAppToast from "@/hooks/useAppToast";
import { formatCurrency } from "@/utils/formatters";
import { useOrderList } from "../hooks/useOrderList";

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
    case "Cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container/30 text-error border border-error-container font-label-md text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-error" />
          Đã hủy
        </span>
      );
    case "Preparing":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container/20 text-primary border border-primary-container font-label-md text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Đang chuẩn bị
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

const getPaymentStatusBadge = (status) => {
  switch (status) {
    case "Paid":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container/30 text-secondary border border-secondary-container font-label-md text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          Đã trả
        </span>
      );
    case "Unpaid":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container/30 text-error border border-error-container font-label-md text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-error" />
          Chưa trả
        </span>
      );
    case "Pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant font-label-md text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-outline" />
          Chờ thanh toán
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant border border-outline font-label-md text-[11px] font-bold">
          {status}
        </span>
      );
  }
};

const OrderListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useAppToast();
  const {
    orders,
    loading,
    filters,
    pagination,
    handleSearch,
    handlePageChange,
    handleFilterChange,
  } = useOrderList();

  const [searchInput, setSearchInput] = useState(filters.search);
  const roleBasePath = location.pathname.startsWith("/manager") ? "/manager" : "/admin";

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    handleSearch("");
  };

  const handleOpenReceipt = (order) => {
    const targetInvoiceId = order.invoiceId?._id || order.invoiceId;

    if (targetInvoiceId) {
      navigate(`${roleBasePath}/receipts/${targetInvoiceId}`);
      return;
    }

    toast.error(
      "Chưa có hóa đơn",
      "Đơn hàng này chưa hoàn tất thanh toán hoặc chưa có hóa đơn.",
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 bg-background min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface tracking-tight">
            Lịch sử đơn hàng
          </h2>
          <p className="text-body-md text-on-surface-variant mt-1">
            Quản lý, theo dõi và xử lý các giao dịch trong hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`${roleBasePath}/payments`)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 shadow-sm transition-opacity font-label-md text-label-md"
          >
            <span className="material-symbols-outlined text-[18px]">payments</span>
            Danh sách thanh toán
          </button>
          <button
            type="button"
            onClick={() =>
              navigate(
                roleBasePath === "/manager"
                  ? "/manager/create-order"
                  : "/admin/food-items",
              )
            }
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-on-secondary rounded-lg hover:opacity-90 transition-opacity font-label-md text-label-md"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {roleBasePath === "/manager" ? "Tạo đơn POS" : "Quản lý món"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-xl p-4 border border-outline-variant shadow-sm relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-outline-variant rounded-l-xl group-hover:bg-primary transition-colors" />
          <label className="block text-label-md font-bold text-on-surface-variant mb-2">
            Tìm kiếm đơn hàng
          </label>
          <form
            onSubmit={handleSearchSubmit}
            className="flex gap-2 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1 focus-within:ring-2 focus-within:ring-primary/20 transition-all"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[18px] self-center">
              search
            </span>
            <input
              className="bg-transparent border-none focus:ring-0 p-0 text-body-sm text-on-surface w-full outline-none"
              placeholder="Nhập mã ĐH..."
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-on-surface-variant hover:text-on-surface self-center"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </form>
        </div>

        <div className="bg-surface rounded-xl p-4 border border-outline-variant shadow-sm relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-outline-variant rounded-l-xl group-hover:bg-primary transition-colors" />
          <label className="block text-label-md font-bold text-on-surface-variant mb-2">
            Trạng thái thanh toán
          </label>
          <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
              pending_actions
            </span>
            <select
              value={filters.paymentStatus}
              onChange={(e) => handleFilterChange({ paymentStatus: e.target.value })}
              className="bg-transparent border-none focus:ring-0 p-0 text-body-sm text-on-surface w-full cursor-pointer outline-none appearance-none"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Paid">Đã thanh toán</option>
              <option value="Unpaid">Chưa thanh toán</option>
              <option value="Pending">Đang chờ</option>
            </select>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-4 border border-outline-variant shadow-sm relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-outline-variant rounded-l-xl group-hover:bg-primary transition-colors" />
          <label className="block text-label-md font-bold text-on-surface-variant mb-2">
            Trạng thái đơn hàng
          </label>
          <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
              list_alt
            </span>
            <select
              value={filters.orderStatus}
              onChange={(e) => handleFilterChange({ orderStatus: e.target.value })}
              className="bg-transparent border-none focus:ring-0 p-0 text-body-sm text-on-surface w-full cursor-pointer outline-none appearance-none"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Pending">Đang chờ</option>
              <option value="Confirmed">Đã xác nhận</option>
              <option value="Preparing">Đang chuẩn bị</option>
              <option value="Ready">Sẵn sàng</option>
              <option value="Completed">Hoàn thành</option>
              <option value="Cancelled">Đã hủy</option>
            </select>
          </div>
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
                  <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                    Loại tài khoản
                  </th>
                  <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant whitespace-nowrap text-right">
                    Tổng tiền
                  </th>
                  <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                    Thanh toán
                  </th>
                  <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                    Trạng thái đơn
                  </th>
                  <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant whitespace-nowrap text-center">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {orders.map((order) => {
                  const orderTimestamp = order.orderedAt || order.createdAt;

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
                      <td className="py-4 px-6 font-body-md text-body-md text-on-surface whitespace-nowrap">
                        {order.staffId?.fullName || order.staffId?.username || "Không rõ"}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getRoleLabel(order.staffId?.role)}
                      </td>
                      <td className="py-4 px-6 font-body-md text-body-md text-on-surface font-semibold text-right">
                        {formatCurrency(order.finalAmount || order.totalAmount || 0)}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getOrderStatusBadge(order.orderStatus)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenReceipt(order)}
                            className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Xem biên lai / In"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              visibility
                            </span>
                          </button>
                        </div>
                      </td>
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
                className="p-1.5 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                      className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-all ${
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
                className="p-1.5 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
