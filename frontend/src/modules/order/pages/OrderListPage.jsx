import React from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Datepicker from "react-tailwindcss-datepicker";
import Spinner from "@/components/feedback/Spinner";
import { formatCurrency } from "@/utils/formatters";
import { useOrderList } from "../hooks/useOrderList";
import { clearCart } from "../redux/orderSlice";

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

const OrderListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    orders,
    loading,
    filters,
    pagination,
    handlePageChange,
    handleFilterChange,
    refetch,
  } = useOrderList();

  const [statusDropdownOpen, setStatusDropdownOpen] = React.useState(false);
  const roleBasePath =
    location.pathname.startsWith("/manager") ? "/manager" : "/admin";
  const posPagePath = "/manager/create-order";

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
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-background p-container-p-mobile md:p-container-p-desktop">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-headline-lg font-bold tracking-tight text-on-surface">
            Lich su don hang
          </h2>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Quan ly va theo doi cac don hang da thanh toan trong he thong.
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row">
          <div className="relative z-20 flex flex-1 flex-col justify-center rounded-2xl border border-outline-variant bg-white p-4">
            <span className="mb-3 text-[13px] font-semibold text-on-surface">
              Khoang thoi gian
            </span>
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
              placeholder="Tu ngay - Den ngay"
              separator="-"
            />
          </div>

          <div className="flex flex-1 flex-col justify-center rounded-2xl border border-outline-variant bg-white p-4">
            <span className="mb-3 text-[13px] font-semibold text-on-surface">
              Thanh toan
            </span>
            <div className="relative">
              <div
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className={`flex cursor-pointer items-center rounded-full border px-4 py-2 text-sm text-on-surface transition-all ${
                  statusDropdownOpen
                    ? "border-primary ring-1 ring-primary"
                    : "border-outline-variant hover:border-outline"
                }`}
              >
                <span className="material-symbols-outlined mr-2 text-[18px] text-on-surface-variant">
                  payments
                </span>
                <span className="flex-1 truncate text-[13px]">
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
                  <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-outline-variant bg-white py-1 shadow-lg">
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
          </div>
        </div>

        <div className="flex flex-col items-stretch justify-end gap-3 sm:flex-row sm:items-center xl:flex-col xl:items-end">
          {roleBasePath === "/manager" && (
            <button
              type="button"
              onClick={() => {
                dispatch(clearCart());
                navigate(posPagePath);
              }}
              className="h-[42px] w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:bg-primary/90 sm:w-[130px]"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Tao POS
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={refetch}
            className="flex h-[42px] w-full items-center justify-center gap-2 rounded-full border border-primary bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-sm transition-all hover:bg-primary-container hover:text-on-primary-container sm:w-[130px]"
            title="Tai lai du lieu"
          >
            <span className="material-symbols-outlined text-[18px]">
              refresh
            </span>
            Tai lai
          </button>
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-12">
            <Spinner size="lg" />
            <p className="text-sm text-on-surface-variant">
              Dang tai danh sach don hang...
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
              Vui long thay doi tu khoa hoac bo loc de xem ket qua.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container">
                  <th className="whitespace-nowrap px-6 py-4 text-label-md text-on-surface-variant">
                    Ma DH
                  </th>
                  <th className="whitespace-nowrap px-6 py-4 text-label-md text-on-surface-variant">
                    Thoi gian
                  </th>
                  <th className="whitespace-nowrap px-6 py-4 text-label-md text-on-surface-variant">
                    Nguoi tao
                  </th>
                  <th className="whitespace-nowrap px-6 py-4 text-right text-label-md text-on-surface-variant">
                    Tong tien
                  </th>
                  <th className="whitespace-nowrap px-6 py-4 text-label-md text-on-surface-variant">
                    Thanh toan
                  </th>
                  <th className="whitespace-nowrap px-6 py-4 text-center text-label-md text-on-surface-variant">
                    Thao tac
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {orders.map((order) => {
                  const orderTimestamp = getOrderTimestamp(order);
                  const paymentId = getPaymentId(order);
                  const paymentStatus = order.paymentStatus || "Unpaid";
                  const canOpenReceipt =
                    Boolean(paymentId) &&
                    ["Paid", "Refunded"].includes(paymentStatus);

                  return (
                    <tr
                      key={order._id}
                      className="transition-colors duration-200 hover:bg-surface-container-low"
                    >
                      <td
                        className="whitespace-nowrap px-6 py-4 text-label-md font-bold text-primary"
                        title={`#${order.orderNumber}`}
                      >
                        {getShortOrderNumber(order.orderNumber)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-body-md text-on-surface">
                          {dayjs(orderTimestamp).format("HH:mm")}
                        </div>
                        <div className="text-body-sm text-on-surface-variant">
                          {dayjs(orderTimestamp).format("DD/MM/YYYY")}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-body-md text-on-surface">
                        {order.staffId?.fullName ||
                          order.staffId?.username ||
                          (typeof order.staffId === "string"
                            ? order.staffId.slice(-6)
                            : "N/A")}
                      </td>
                      <td className="px-6 py-4 text-right text-body-md font-semibold text-on-surface">
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
  );
};

export default OrderListPage;
