import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Datepicker from "react-tailwindcss-datepicker";
import Spinner from "@/components/feedback/Spinner";
import { formatCurrency } from "@/utils/formatters";
import { useOwnOrderHistory } from "../hooks/useOwnOrderHistory";

const PAYMENT_STATUS_OPTIONS = [
  { value: "", label: "Tat ca thanh toan" },
  { value: "Paid", label: "Da thanh toan" },
  { value: "Unpaid", label: "Chua thanh toan" },
  { value: "Pending", label: "Dang xu ly" },
  { value: "Refunded", label: "Hoan tien" },
];

const getPaymentStatusBadge = (status) => {
  switch (status) {
    case "Paid":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary-container bg-secondary-container/25 px-2.5 py-1 text-[11px] font-bold text-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          Da thanh toan
        </span>
      );
    case "Refunded":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-outline/15 px-2.5 py-1 text-[11px] font-bold text-on-surface-variant">
          <span className="h-1.5 w-1.5 rounded-full bg-outline" />
          Hoan tien
        </span>
      );
    case "Pending":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-tertiary-container bg-tertiary-container/25 px-2.5 py-1 text-[11px] font-bold text-tertiary">
          <span className="h-1.5 w-1.5 rounded-full bg-tertiary animate-pulse" />
          Dang xu ly
        </span>
      );
    case "Unpaid":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-error-container bg-error-container/20 px-2.5 py-1 text-[11px] font-bold text-error">
          <span className="h-1.5 w-1.5 rounded-full bg-error" />
          Chua thanh toan
        </span>
      );
    }
};

const getOrderItemsSummary = (items) => {
  if (!items || items.length === 0) {
    return "Khong co mon";
  }

  return items
    .map((item) => `${item.quantity}x ${item.name || "Mon an"}`)
    .join(", ");
};

const getOrderAmount = (order) => order.finalAmount || order.totalAmount || 0;
const getOrderTimestamp = (order) => order.createdAt || order.orderDate;
const getPaymentId = (order) => order?.paymentId?._id || order?.paymentId || null;

const getShortOrderNumber = (orderNumber) => {
  const normalized = String(orderNumber ?? "").replace(/^#/, "");
  const [prefix = "ORD", rawDate = "", rawSuffix = ""] = normalized.split("-");
  const shortDate =
    rawDate.length === 8 ? `${rawDate.slice(4, 6)}${rawDate.slice(6, 8)}` : rawDate;
  const shortSuffix = rawSuffix.slice(-6) || rawSuffix;

  if (!shortDate && !shortSuffix) {
    return `#${normalized}`;
  }

  return `#${prefix}-${shortDate}-${shortSuffix}`;
};

const OwnOrderHistoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    orders,
    loading,
    kpis,
    filters,
    pagination,
    handlePageChange,
    handleFilterChange,
    refetch,
  } = useOwnOrderHistory();

  const [statusDropdownOpen, setStatusDropdownOpen] = React.useState(false);
  const roleBasePath =
    location.pathname.startsWith("/manager") ? "/manager" : "/staff";

  const dateValue = React.useMemo(
    () => ({
      startDate: filters.fromDate || null,
      endDate: filters.toDate || null,
    }),
    [filters.fromDate, filters.toDate],
  );

  const handleOpenReceipt = React.useCallback(
    (paymentId) => {
      if (!paymentId) {
        return;
      }

      navigate(`${roleBasePath}/receipts/${paymentId}`);
    },
    [navigate, roleBasePath],
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-headline-lg font-bold tracking-tight text-on-background">
            Lich su don cua toi
          </h2>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Theo doi cac don da thanh toan va bien lai giao dich.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex items-start justify-between rounded-xl border border-outline-variant bg-surface p-6 shadow-soft">
            <div>
              <p className="mb-1 text-label-md uppercase tracking-wider text-on-surface-variant">
                Don hang hom nay
              </p>
              <h3 className="text-headline-md font-bold text-on-surface">
                {kpis.todayOrdersCount} don
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container bg-opacity-20 text-primary">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
          </div>

          <div className="flex items-start justify-between rounded-xl border border-outline-variant bg-surface p-6 shadow-soft">
            <div>
              <p className="mb-1 text-label-md uppercase tracking-wider text-on-surface-variant">
                Doanh thu ca nhan
              </p>
              <h3 className="text-headline-md font-bold text-on-surface">
                {formatCurrency(kpis.personalRevenue)}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container bg-opacity-20 text-secondary">
              <span className="material-symbols-outlined">payments</span>
            </div>
          </div>

          <div className="flex items-start justify-between rounded-xl border border-outline-variant bg-surface p-6 shadow-soft">
            <div>
              <p className="mb-1 text-label-md uppercase tracking-wider text-on-surface-variant">
                Don da thanh toan
              </p>
              <h3 className="text-headline-md font-bold text-on-surface">
                {kpis.completedOrdersCount ?? 0} don
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary-container bg-opacity-20 text-tertiary">
              <span className="material-symbols-outlined">task_alt</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col overflow-visible rounded-xl border border-outline-variant bg-surface shadow-soft">
          <div className="flex flex-col justify-between gap-4 border-b border-outline-variant bg-surface-container-lowest p-4 md:flex-row md:items-center">
            <div className="relative z-20 max-w-md flex-1">
              <Datepicker
                value={dateValue}
                onChange={(newValue) => {
                  let from = newValue?.startDate || "";
                  let to = newValue?.endDate || "";

                  if (typeof from === "string" && from.includes("/")) {
                    const [day, month, year] = from.split("/");
                    from = `${year}-${month}-${day}`;
                  } else if (from) {
                    from = dayjs(from).format("YYYY-MM-DD");
                  }

                  if (typeof to === "string" && to.includes("/")) {
                    const [day, month, year] = to.split("/");
                    to = `${year}-${month}-${day}`;
                  } else if (to) {
                    to = dayjs(to).format("YYYY-MM-DD");
                  }

                  handleFilterChange({
                    fromDate: from,
                    toDate: to,
                  });
                }}
                useRange={false}
                showShortcuts={true}
                primaryColor="teal"
                inputClassName="w-full rounded-full border border-outline-variant bg-white px-4 py-2 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                displayFormat="DD/MM/YYYY"
                placeholder="Chon ngay"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  className={`flex cursor-pointer items-center rounded-lg border px-3 py-2 text-sm text-on-surface transition-all ${
                    statusDropdownOpen
                      ? "border-primary ring-1 ring-primary"
                      : "border-outline-variant hover:border-outline"
                  }`}
                >
                  <span className="material-symbols-outlined mr-2 text-[18px] text-on-surface-variant">
                    payments
                  </span>
                  <span className="flex-1 truncate pr-4 text-[13px]">
                    {PAYMENT_STATUS_OPTIONS.find(
                      (opt) => opt.value === filters.paymentStatus,
                    )?.label || "Tat ca thanh toan"}
                  </span>
                  <span
                    className={`material-symbols-outlined text-[18px] text-on-surface-variant transition-transform ${
                      statusDropdownOpen ? "rotate-180" : ""
                    }`}
                  >
                    arrow_drop_down
                  </span>
                </div>

                {statusDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setStatusDropdownOpen(false)}
                    />
                    <div className="absolute left-0 right-0 top-full z-40 mt-2 min-w-[160px] overflow-hidden rounded-xl border border-outline-variant bg-white py-1 shadow-lg">
                      {PAYMENT_STATUS_OPTIONS.map((option) => (
                        <div
                          key={option.value}
                          onClick={() => {
                            handleFilterChange({
                              paymentStatus: option.value,
                              orderStatus: "",
                            });
                            setStatusDropdownOpen(false);
                          }}
                          className={`cursor-pointer px-4 py-2.5 text-[13px] transition-colors ${
                            filters.paymentStatus === option.value
                              ? "bg-primary-container font-semibold text-on-primary-container"
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

              <button
                type="button"
                onClick={refetch}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-primary bg-white px-3 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary-container"
                title="Tai lai du lieu"
              >
                <span className="material-symbols-outlined text-[18px]">
                  refresh
                </span>
                Tai lai
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 p-12">
              <Spinner size="lg" />
              <p className="text-sm text-on-surface-variant">
                Dang tai lich su don hang...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined mb-2 text-[48px] text-outline/50">
                receipt_long
              </span>
              <p className="font-semibold text-on-surface">
                Khong tim thay don hang nao
              </p>
              <p className="text-xs">
                Hay thu doi bo loc hoac tu khoa tim kiem khac.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="border-b border-outline-variant bg-surface-container-low text-xs uppercase tracking-wider text-on-surface-variant">
                  <tr>
                    <th className="whitespace-nowrap px-6 py-4 font-bold">Ma Don</th>
                    <th className="px-6 py-4 font-bold">Thoi Gian</th>
                    <th className="px-6 py-4 font-bold">Mon An</th>
                    <th className="px-6 py-4 text-right font-bold">Tong Tien</th>
                    <th className="whitespace-nowrap px-6 py-4 font-bold">
                      Thanh Toan
                    </th>
                    <th className="px-6 py-4 text-center font-bold">Thao Tac</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-sm text-body-sm">
                  {orders.map((order) => {
                    const paymentId = getPaymentId(order);
                    const paymentStatus = order.paymentStatus || "Unpaid";
                    const canOpenReceipt =
                      Boolean(paymentId) &&
                      ["Paid", "Refunded"].includes(paymentStatus);

                    return (
                      <tr
                        key={order._id}
                        className="transition-colors hover:bg-surface-container-low"
                      >
                        <td
                          className="whitespace-nowrap px-6 py-4 font-bold text-primary"
                          title={`#${order.orderNumber}`}
                        >
                          {getShortOrderNumber(order.orderNumber)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {dayjs(getOrderTimestamp(order)).format("HH:mm - DD/MM/YYYY")}
                        </td>
                        <td
                          className="max-w-xs truncate px-6 py-4"
                          title={getOrderItemsSummary(order.items)}
                        >
                          {getOrderItemsSummary(order.items)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold">
                          {formatCurrency(getOrderAmount(order))}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {getPaymentStatusBadge(paymentStatus)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {canOpenReceipt ? (
                              <button
                                type="button"
                                onClick={() => handleOpenReceipt(paymentId)}
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-outline-variant bg-surface-container-low p-4 sm:flex-row">
              <div className="text-xs text-on-surface-variant">
                Hien thi{" "}
                <span className="font-semibold text-on-surface">
                  {(pagination.page - 1) * pagination.limit + 1} -{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{" "}
                trong{" "}
                <span className="font-semibold text-on-surface">
                  {pagination.total}
                </span>{" "}
                don hang
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
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
                      className={`flex h-8 w-8 items-center justify-center rounded-full font-bold transition-all ${
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
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
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

export default OwnOrderHistoryPage;
