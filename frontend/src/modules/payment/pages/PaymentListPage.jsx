import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Spinner from "@/components/feedback/Spinner";
import useAppToast from "@/hooks/useAppToast";
import { formatCurrency } from "@/utils/formatters";
import { usePaymentList } from "../hooks/usePaymentList";

const getMethodIcon = (method) => {
  switch (method) {
    case "Cash":
      return (
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
          payments
        </span>
      );
    case "QR":
      return (
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
          qr_code_scanner
        </span>
      );
    case "Card":
      return (
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
          credit_card
        </span>
      );
    default:
      return (
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
          monetization_on
        </span>
      );
    }
};

const getMethodLabel = (method) => {
  switch (method) {
    case "Cash":
      return "Tiền mặt";
    case "QR":
      return "Chuyển khoản QR";
    case "Card":
      return "Thẻ nội bộ";
    default:
      return method;
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case "Paid":
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
          Thành công
        </span>
      );
    case "Pending":
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
          Chờ thanh toán
        </span>
      );
    case "Failed":
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
          Thất bại
        </span>
      );
    case "Refunded":
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
          Hoàn tiền
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {status}
        </span>
      );
  }
};

const PaymentListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useAppToast();
  const {
    payments,
    loading,
    kpis,
    filters,
    pagination,
    getPaymentDisplayDate,
    handleSearch,
    handlePageChange,
    handleFilterChange,
    refetch,
  } = usePaymentList();

  const [searchInput, setSearchInput] = useState(filters.search);
  const roleBasePath = location.pathname.startsWith("/manager") ? "/manager" : "/admin";
  const roleLabel = roleBasePath === "/manager" ? "Quản lý" : "Admin";

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    handleSearch("");
  };

  const handleOpenReceipt = (payment) => {
    const targetInvoiceId = payment.invoiceId?._id || payment.invoiceId;

    if (targetInvoiceId) {
      navigate(`${roleBasePath}/receipts/${targetInvoiceId}`);
      return;
    }

    toast.error(
      "Chưa có hóa đơn",
      "Thanh toán này chưa có hóa đơn phát hành.",
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 bg-background min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex text-on-surface-variant text-xs font-semibold mb-2">
            <span>{roleLabel}</span>
            <span className="mx-2 text-outline-variant">&gt;</span>
            <span className="text-primary font-bold">Danh sách thanh toán</span>
          </nav>
          <h2 className="text-headline-lg font-bold text-on-surface">
            Danh sách thanh toán
          </h2>
          <p className="text-body-md text-on-surface-variant mt-1">
            Quản lý và theo dõi lịch sử giao dịch tại quầy.
          </p>
        </div>
        <button
          type="button"
          onClick={refetch}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 shadow-sm transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Tải lại danh sách
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-xl border border-outline-variant shadow-soft flex items-center gap-4">
          <div className="p-4 bg-primary-container/10 rounded-lg text-primary">
            <span className="material-symbols-outlined text-[32px]">payments</span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Tổng doanh thu hôm nay
            </p>
            <p className="text-headline-md font-bold text-on-surface">
              {formatCurrency(kpis.totalRevenue)}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              Doanh thu thực nhận
            </p>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-outline-variant shadow-soft flex items-center gap-4">
          <div className="p-4 bg-secondary-container/20 rounded-lg text-secondary">
            <span className="material-symbols-outlined text-[32px]">check_circle</span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Giao dịch thành công
            </p>
            <p className="text-headline-md font-bold text-on-surface">
              {kpis.successCount}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              Giao dịch hoàn tất hôm nay
            </p>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-outline-variant shadow-soft flex items-center gap-4">
          <div className="p-4 bg-error-container/10 rounded-lg text-error">
            <span className="material-symbols-outlined text-[32px]">schedule</span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Giao dịch chờ hôm nay
            </p>
            <p className="text-headline-md font-bold text-on-surface">
              {kpis.pendingCount}
            </p>
            <p className="text-xs text-error font-medium mt-1">
              Cần xác nhận thanh toán
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant shadow-soft overflow-hidden">
        <div className="p-6 border-b border-outline-variant flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 bg-surface-container-low p-1 rounded-full border border-outline-variant/60">
            <button
              type="button"
              onClick={() => handleFilterChange({ paymentStatus: "" })}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filters.paymentStatus === ""
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange({ paymentStatus: "Paid" })}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filters.paymentStatus === "Paid"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Thành công
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange({ paymentStatus: "Pending" })}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filters.paymentStatus === "Pending"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Chờ thanh toán
            </button>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <form onSubmit={handleSearchSubmit} className="relative flex gap-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                  search
                </span>
                <input
                  className="bg-background border border-outline-variant rounded-lg py-1.5 pl-9 pr-8 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Mã GD / Số thanh toán..."
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-primary text-on-primary text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                Tìm
              </button>
            </form>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-on-surface-variant">
                Phương thức:
              </span>
              <select
                value={filters.paymentMethod}
                onChange={(e) => handleFilterChange({ paymentMethod: e.target.value })}
                className="border border-outline-variant rounded-lg py-1.5 pl-3 pr-8 text-xs focus:border-primary focus:ring-1 focus:ring-primary bg-background text-on-surface cursor-pointer"
              >
                <option value="">Tất cả</option>
                <option value="Cash">Tiền mặt</option>
                <option value="QR">Chuyển khoản QR</option>
                <option value="Card">Thẻ nội bộ</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-on-surface-variant">
              Đang tải danh sách thanh toán...
            </p>
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] mb-2 text-outline/50">
              payments
            </span>
            <p className="font-semibold text-on-surface">Không tìm thấy giao dịch nào</p>
            <p className="text-xs">
              Vui lòng thay đổi từ khóa hoặc bộ lọc để xem kết quả.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Mã GD / Số thanh toán
                  </th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Mã Đơn hàng
                  </th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Phương thức
                  </th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                    Số tiền
                  </th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-sm">
                {payments.map((payment) => {
                  const displayDate = getPaymentDisplayDate(payment);

                  return (
                    <tr
                      key={payment._id}
                      className="hover:bg-surface-container-low transition-all duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-primary">
                          #{payment.paymentNumber}
                        </div>
                        {payment.transactionCode && (
                          <div className="text-[11px] text-on-surface-variant">
                            Mã GD: {payment.transactionCode}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-on-surface-variant">
                        #{payment.orderId?.orderNumber || "Không rõ"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-body-sm font-medium">
                          {dayjs(displayDate).format("HH:mm")}
                        </div>
                        <div className="text-[11px] text-on-surface-variant">
                          {dayjs(displayDate).format("DD/MM/YYYY")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-body-sm">
                          {getMethodIcon(payment.paymentMethod)}
                          <span>{getMethodLabel(payment.paymentMethod)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-on-surface text-right whitespace-nowrap">
                        {formatCurrency(payment.finalAmount || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.paymentStatus)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenReceipt(payment)}
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Xem biên lai"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            visibility
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && payments.length > 0 && (
          <div className="p-6 bg-surface border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-on-surface-variant">
              Hiển thị{" "}
              <span className="font-semibold text-on-surface">
                {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              của{" "}
              <span className="font-semibold text-on-surface">{pagination.total}</span>{" "}
              giao dịch
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg border border-outline-variant text-outline hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                className="p-1.5 rounded-lg border border-outline-variant text-outline hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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

export default PaymentListPage;
