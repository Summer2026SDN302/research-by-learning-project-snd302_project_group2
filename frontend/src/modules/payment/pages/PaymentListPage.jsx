import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Spinner from "@/components/feedback/Spinner";
import useAppToast from "@/hooks/useAppToast";
import { formatCurrency } from "@/utils/formatters";
import {
  getPaymentMethodIcon,
  getPaymentMethodLabel,
  PAYMENT_METHOD_OPTIONS,
} from "../constants/paymentConstants";
import { usePaymentList } from "../hooks/usePaymentList";

const STATUS_FILTERS = [
  { value: "", label: "Tat ca" },
  { value: "Paid", label: "Thanh cong" },
  { value: "Pending", label: "Dang cho" },
  { value: "Failed", label: "That bai" },
  { value: "Refunded", label: "Hoan tien" },
];

const getStatusBadge = (status) => {
  switch (status) {
    case "Paid":
      return (
        <span className="rounded-full border border-green-200 bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
          Thanh cong
        </span>
      );
    case "Pending":
      return (
        <span className="rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
          Dang cho
        </span>
      );
    case "Failed":
      return (
        <span className="rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
          That bai
        </span>
      );
    case "Refunded":
      return (
        <span className="rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
          Hoan tien
        </span>
      );
    default:
      return (
        <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
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
  const roleBasePath =
    location.pathname.startsWith("/manager") ? "/manager" : "/admin";
  const roleLabel = roleBasePath === "/manager" ? "Quan ly" : "Admin";

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    handleSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    handleSearch("");
  };

  const handleOpenReceipt = (payment) => {
    const canOpenReceipt = ["Paid", "Refunded"].includes(payment.paymentStatus);

    if (canOpenReceipt && payment?._id) {
      navigate(`${roleBasePath}/receipts/${payment._id}`);
      return;
    }

    toast.error(
      "Chua co bien lai",
      "Thanh toan nay chua hoan tat de mo bien lai.",
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <nav className="mb-2 flex text-xs font-semibold text-on-surface-variant">
              <span>{roleLabel}</span>
              <span className="mx-2 text-outline-variant">&gt;</span>
              <span className="font-bold text-primary">Danh sach thanh toan</span>
            </nav>
            <h2 className="text-headline-lg font-bold text-on-surface">
              Danh sach thanh toan
            </h2>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Quan ly va theo doi lich su giao dich tai quay.
            </p>
          </div>

          <button
            type="button"
            onClick={refetch}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-bold text-on-primary shadow-sm transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Tai lai danh sach
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border border-outline-variant bg-surface p-6 shadow-soft">
            <div className="rounded-lg bg-primary-container/10 p-4 text-primary">
              <span className="material-symbols-outlined text-[32px]">payments</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Tong doanh thu hom nay
              </p>
              <p className="text-headline-md font-bold text-on-surface">
                {formatCurrency(kpis.totalRevenue)}
              </p>
              <p className="mt-1 text-xs text-on-surface-variant">
                Doanh thu thuc nhan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-outline-variant bg-surface p-6 shadow-soft">
            <div className="rounded-lg bg-secondary-container/20 p-4 text-secondary">
              <span className="material-symbols-outlined text-[32px]">
                check_circle
              </span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Giao dich thanh cong
              </p>
              <p className="text-headline-md font-bold text-on-surface">
                {kpis.successCount}
              </p>
              <p className="mt-1 text-xs text-on-surface-variant">
                Giao dich hoan tat hom nay
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-outline-variant bg-surface p-6 shadow-soft">
            <div className="rounded-lg bg-error-container/10 p-4 text-error">
              <span className="material-symbols-outlined text-[32px]">schedule</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Giao dich dang cho
              </p>
              <p className="text-headline-md font-bold text-on-surface">
                {kpis.pendingCount}
              </p>
              <p className="mt-1 text-xs font-medium text-error">
                Can xac nhan thanh toan
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant p-6">
            <div className="flex flex-wrap gap-2 rounded-full border border-outline-variant/60 bg-surface-container-low p-1">
              {STATUS_FILTERS.map((statusFilter) => (
                <button
                  key={statusFilter.value}
                  type="button"
                  onClick={() =>
                    handleFilterChange({ paymentStatus: statusFilter.value })
                  }
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                    filters.paymentStatus === statusFilter.value
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {statusFilter.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <form onSubmit={handleSearchSubmit} className="relative flex gap-2">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                    search
                  </span>
                  <input
                    className="rounded-lg border border-outline-variant bg-background py-1.5 pl-9 pr-8 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="So thanh toan / Ma GD / Don hang..."
                    type="text"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        close
                      </span>
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-on-primary transition-opacity hover:opacity-90"
                >
                  Tim
                </button>
              </form>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-on-surface-variant">
                  Phuong thuc:
                </span>
                <select
                  value={filters.paymentMethod}
                  onChange={(event) =>
                    handleFilterChange({ paymentMethod: event.target.value })
                  }
                  className="cursor-pointer rounded-lg border border-outline-variant bg-background py-1.5 pl-3 pr-8 text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Tat ca</option>
                  {PAYMENT_METHOD_OPTIONS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 p-12">
              <Spinner size="lg" />
              <p className="text-sm text-on-surface-variant">
                Dang tai danh sach thanh toan...
              </p>
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined mb-2 text-[48px] text-outline/50">
                payments
              </span>
              <p className="font-semibold text-on-surface">
                Khong tim thay giao dich nao
              </p>
              <p className="text-xs">
                Vui long thay doi tu khoa hoac bo loc de xem ket qua.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low">
                    <th className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                      Thanh toan
                    </th>
                    <th className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                      Don hang
                    </th>
                    <th className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                      Thoi gian
                    </th>
                    <th className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                      Phuong thuc
                    </th>
                    <th className="px-6 py-4 text-right text-label-md uppercase tracking-wider text-on-surface-variant">
                      So tien
                    </th>
                    <th className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                      Trang thai
                    </th>
                    <th className="px-6 py-4 text-center text-label-md uppercase tracking-wider text-on-surface-variant">
                      Thao tac
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-sm">
                  {payments.map((payment) => {
                    const displayDate = getPaymentDisplayDate(payment);
                    const canOpenReceipt = ["Paid", "Refunded"].includes(
                      payment.paymentStatus,
                    );

                    return (
                      <tr
                        key={payment._id}
                        className="transition-all duration-150 hover:bg-surface-container-low"
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-primary">
                            #{payment.paymentNumber}
                          </div>
                          {payment.transactionCode && (
                            <div className="text-[11px] text-on-surface-variant">
                              Ma GD: {payment.transactionCode}
                            </div>
                          )}
                          {Number(payment.printCount) > 0 && (
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-on-surface-variant">
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                                In {payment.printCount} lan
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-on-surface-variant">
                          #{payment.orderId?.orderNumber || "Khong ro"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-body-sm font-medium">
                            {dayjs(displayDate).format("HH:mm")}
                          </div>
                          <div className="text-[11px] text-on-surface-variant">
                            {dayjs(displayDate).format("DD/MM/YYYY")}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-2 text-body-sm">
                            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                              {getPaymentMethodIcon(payment.paymentMethod)}
                            </span>
                            <span>{getPaymentMethodLabel(payment.paymentMethod)}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right font-bold text-on-surface">
                          {formatCurrency(payment.finalAmount || 0)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {getStatusBadge(payment.paymentStatus)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {canOpenReceipt ? (
                            <button
                              type="button"
                              onClick={() => handleOpenReceipt(payment)}
                              className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
                              title="Xem bien lai"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                visibility
                              </span>
                            </button>
                          ) : (
                            <span className="text-xs text-on-surface-variant">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && payments.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-outline-variant bg-surface p-6 sm:flex-row">
              <p className="text-xs text-on-surface-variant">
                Hien thi{" "}
                <span className="font-semibold text-on-surface">
                  {(pagination.page - 1) * pagination.limit + 1} -{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{" "}
                cua{" "}
                <span className="font-semibold text-on-surface">
                  {pagination.total}
                </span>{" "}
                giao dich
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="rounded-lg border border-outline-variant p-1.5 text-outline transition-all hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_left
                  </span>
                </button>

                <div className="flex items-center gap-1 text-xs">
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, index) => index + 1,
                  ).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => handlePageChange(pageNumber)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold transition-all ${
                        pagination.page === pageNumber
                          ? "bg-primary text-on-primary shadow-sm"
                          : "text-on-surface hover:bg-surface-container"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="rounded-lg border border-outline-variant p-1.5 text-outline transition-all hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
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
    </div>
  );
};

export default PaymentListPage;
