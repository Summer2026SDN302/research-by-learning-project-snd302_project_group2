import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import useAppToast from "@/hooks/useAppToast";
import { formatCurrency } from "@/utils/formatters";
import {
  getPaymentMethodIcon,
  getPaymentMethodLabel,
  mapStatus,
  mapStatusLabel,
} from "../constants/paymentConstants";
import { usePaymentList } from "../hooks/usePaymentList";
import useSearch from "@/hooks/useSearch";

// Shared Components
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/data-display/StatusBadge";
import DataTable from "@/components/data-display/DataTable";
import PaginationControl from "@/components/navigation/PaginationControl";

// Module Components
import PaymentStats from "../components/PaymentStats";
import PaymentToolbar from "../components/PaymentToolbar";

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

  const roleBasePath = location.pathname.startsWith("/manager")
    ? "/manager"
    : "/admin";
  const roleLabel =
    roleBasePath === "/manager" ? "Quản lý" : "Quản trị hệ thống";

  const {
    query: searchInput,
    handleSearch: handleSearchInputChange,
    resetSearch: handleClearSearch,
  } = useSearch(handleSearch, 300);

  const handleOpenReceipt = (payment) => {
    const canOpenReceipt = ["Paid", "Refunded"].includes(payment.paymentStatus);

    if (canOpenReceipt && payment?._id) {
      navigate(`${roleBasePath}/receipts/${payment._id}`);
      return;
    }

    toast.error(
      "Chưa có biên lai",
      "Thanh toán này chưa hoàn tất để mở biên lai.",
    );
  };

  const columns = [
    { key: "paymentNumber", label: "Mã Thanh toán" },
    { key: "orderNumber", label: "Mã Đơn hàng" },
    { key: "time", label: "Thời gian", sortable: true },
    { key: "paymentMethod", label: "Phương thức" },
    { key: "finalAmount", label: "Số tiền" },
    { key: "paymentStatus", label: "Trạng thái" },
  ];

  const renderCell = (key, value, row) => {
    const displayDate = getPaymentDisplayDate(row);
    const canOpenReceipt = ["Paid", "Refunded"].includes(row.paymentStatus);

    switch (key) {
      case "paymentNumber":
        return (
          <>
            {canOpenReceipt ? (
              <button
                type="button"
                onClick={() => handleOpenReceipt(row)}
                className="font-bold text-primary hover:underline focus:outline-none text-left"
                title="Xem biên lai"
              >
                #{row.paymentNumber}
              </button>
            ) : (
              <div className="font-bold text-on-surface-variant">
                #{row.paymentNumber}
              </div>
            )}
            {row.transactionCode && (
              <div className="text-[11px] text-on-surface-variant">
                Mã GD: {row.transactionCode}
              </div>
            )}
          </>
        );
      case "orderNumber":
        return (
          <span className="font-semibold text-on-surface-variant">
            #{row.orderId?.orderNumber || "Không rõ"}
          </span>
        );
      case "time":
        return (
          <div className="whitespace-nowrap">
            <div className="text-body-sm font-medium">
              {dayjs(displayDate).format("HH:mm")}
            </div>
            <div className="text-[11px] text-on-surface-variant">
              {dayjs(displayDate).format("DD/MM/YYYY")}
            </div>
          </div>
        );
      case "paymentMethod":
        return (
          <div className="flex items-center gap-2 text-body-sm whitespace-nowrap">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              {getPaymentMethodIcon(row.paymentMethod)}
            </span>
            <span>{getPaymentMethodLabel(row.paymentMethod)}</span>
          </div>
        );
      case "finalAmount":
        return (
          <div className="font-bold text-on-surface whitespace-nowrap">
            {formatCurrency(row.finalAmount || 0)}
          </div>
        );
      case "paymentStatus":
        return (
          <div className="whitespace-nowrap">
            <StatusBadge
              status={mapStatus(row.paymentStatus)}
              label={mapStatusLabel(row.paymentStatus)}
              size="sm"
            />
          </div>
        );
      default:
        return String(value ?? "—");
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: roleLabel }, { label: "Danh sách thanh toán" }]}
        title="Danh sách thanh toán"
        subtitle="Quản lý và theo dõi lịch sử giao dịch tại quầy."
        action={
          <button
            type="button"
            onClick={refetch}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-bold text-on-primary shadow-sm transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[18px]">
              refresh
            </span>
            Tải lại danh sách
          </button>
        }
      />

      <PaymentStats kpis={kpis} />

      <div className="space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-soft">
        <PaymentToolbar
          filters={filters}
          searchInput={searchInput}
          onSearchInputChange={handleSearchInputChange}
          onClearSearch={handleClearSearch}
          onFilterChange={handleFilterChange}
        />

        <DataTable
          columns={columns}
          rows={payments}
          isLoading={loading}
          emptyTitle="Không tìm thấy giao dịch nào"
          emptyMessage="Vui lòng thay đổi từ khóa hoặc bộ lọc để xem kết quả."
          renderCell={renderCell}
        />

        {!loading && payments.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-outline-variant pt-4 sm:flex-row">
            <span className="text-on-surface-variant text-body-sm">
              Hiển thị {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              trên {pagination.total} giao dịch
            </span>

            <PaginationControl
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default PaymentListPage;
