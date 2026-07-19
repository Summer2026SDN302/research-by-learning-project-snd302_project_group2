import React from "react";
import { useLocation } from "react-router-dom";
// [CHƯA CÓ BE] useNavigate — sẽ cần khi BE có module Invoice
// import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
// [CHƯA CÓ BE] useAppToast — tạm không cần vì bỏ logic receipt
// import useAppToast from "@/hooks/useAppToast";
import { formatCurrency } from "@/utils/formatters";
import Datepicker from "react-tailwindcss-datepicker";
import { useOrderList } from "../hooks/useOrderList";
import OrderDetailModal from "../components/OrderDetailModal";
import PaginationControl from "@/components/navigation/PaginationControl";
import ConfirmDialog from "@/components/feedback/ConfirmDialog";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/data-display/StatusBadge";
import FilterBar from "@/components/search/FilterBar";
import DataTable from "@/components/data-display/DataTable";
import SearchBar from "@/components/search/SearchBar";
import toast from "react-hot-toast";
import { exportOrderReport } from "../../analytics/api/analyticsApi";
import { downloadBlob } from "../../analytics/utils/downloadBlob";
import ExportOrderModal from "../components/ExportOrderModal";

import {
  ORDER_STATUS_OPTIONS,
  ORDER_TABLE_COLUMNS,
  ORDER_STATUS_MAP,
} from "../constants/orderConstants";

const getOrderStatusBadge = (status) => {
  const config = ORDER_STATUS_MAP[status];
  if (config) {
    return <StatusBadge status={config.statusKey} label={config.label} />;
  }
  return <StatusBadge status="pending" label={status} />;
};

const OrderListPage = () => {
  // [CHƯA CÓ BE] useNavigate — sẽ cần khi BE có module Invoice
  // const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const roleLabel = isAdmin ? "Admin" : "Manager";
  // [CHƯA CÓ BE] toast — tạm không cần
  // const { toast } = useAppToast();
  const {
    orders,
    rows,
    searchQuery,
    setSearchQuery,
    loading,
    filters,
    pagination,
    executeCancelOrder,
    handlePageChange,
    handleFilterChange,
    clearFilters,
    refetch,
  } = useOrderList();

  const [detailOrderId, setDetailOrderId] = React.useState(null);
  const [cancelOrderId, setCancelOrderId] = React.useState(null);
  const [isCanceling, setIsCanceling] = React.useState(false);
  const datepickerRef = React.useRef(null);
  const [popoverDir, setPopoverDir] = React.useState("down");
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);

  const handleExportOrder = async (type) => {
    try {
      const from = filters.fromDate || "";
      const to = filters.toDate || "";
      const buffer = await exportOrderReport({
        status: type,
        from,
        to,
      });
      const filename = `order-report-${dayjs().format("YYYY-MM-DD")}.xlsx`;
      downloadBlob(buffer, filename);
      toast.success("Xuất báo cáo đơn hàng thành công");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi khi xuất báo cáo");
    }
  };

  const handleDatepickerInteraction = () => {
    if (datepickerRef.current) {
      const rect = datepickerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 350) {
        setPopoverDir("up");
      } else {
        setPopoverDir("down");
      }
    }
  };

  const confirmCancel = async () => {
    setIsCanceling(true);
    await executeCancelOrder(cancelOrderId);
    setIsCanceling(false);
    setCancelOrderId(null);
  };

  const dateValue = React.useMemo(
    () => ({
      startDate: filters.fromDate || null,
      endDate: filters.toDate || null,
    }),
    [filters.fromDate, filters.toDate],
  );

  const renderCell = (key, value, row) => {
    switch (key) {
      case "orderNumber":
        return <span className="font-bold text-primary">#{value}</span>;
      case "createdAt":
        return (
          <div>
            <div className="font-body-md text-md text-on-surface">
              {dayjs(value).format("HH:mm")}
            </div>
            <div className="font-body-sm text-sm text-on-surface-variant">
              {dayjs(value).format("DD/MM/YYYY")}
            </div>
          </div>
        );
      case "staffName":
        return <span className="font-medium text-on-surface">{value}</span>;
      case "totalAmount":
        return (
          <span className="font-bold text-on-surface">
            {formatCurrency(value)}
          </span>
        );
      case "orderStatus":
        return getOrderStatusBadge(value);
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDetailOrderId(row.id)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
              title="Xem chi tiết đơn hàng"
            >
              <span className="material-symbols-outlined text-[20px]">
                visibility
              </span>
            </button>
            {row.orderStatus === "Pending" && (
              <button
                onClick={() => setCancelOrderId(row.id)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-error/10 transition-colors text-error"
                title="Huỷ đơn hàng"
              >
                <span className="material-symbols-outlined text-[20px]">
                  cancel
                </span>
              </button>
            )}
          </div>
        );
      default:
        return String(value ?? "—");
    }
  };

  return (
    <section className="space-y-6">
      {/* Title */}
      <PageHeader
        breadcrumbs={[{ label: roleLabel }, { label: "Lịch sử đơn hàng" }]}
        title={isAdmin ? "Quản lý đơn hàng" : "Danh sách đơn hàng"}
        subtitle={
          isAdmin
            ? "Quản lý, theo dõi và xử lý các giao dịch trong hệ thống."
            : "Xem danh sách các giao dịch đơn hàng trong hệ thống."
        }
        action={
          <button
            onClick={refetch}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-primary text-primary rounded-lg hover:bg-primary-container transition-all font-label-md text-sm font-semibold h-[38px]"
            title="Tải lại dữ liệu"
          >
            <span className="material-symbols-outlined text-[18px]">
              refresh
            </span>
            Tải lại
          </button>
        }
      />

      {/* Toolbar + Table card */}
      <div className="space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-soft flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Toolbar: Search + Date + Filters */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1 max-w-2xl">
            {/* Search Bar */}
            <div className="w-full sm:max-w-[240px]">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Tìm mã đơn, người tạo..."
              />
            </div>

            {/* Khoảng thời gian (Date Picker) */}
            <div
              ref={datepickerRef}
              onClick={handleDatepickerInteraction}
              onFocusCapture={handleDatepickerInteraction}
              className="w-full sm:max-w-[250px] relative z-20"
            >
              <Datepicker
                popoverDirection={popoverDir}
                value={dateValue}
                onChange={(newValue) => {
                  let from = newValue?.startDate || "";
                  let to = newValue?.endDate || "";
                  if (typeof from === "string" && from.includes("/")) {
                    const [d, m, y] = from.split("/");
                    from = `${y}-${m}-${d}`;
                  } else if (from) {
                    from = dayjs(from).format("YYYY-MM-DD");
                  }

                  if (typeof to === "string" && to.includes("/")) {
                    const [d, m, y] = to.split("/");
                    to = `${y}-${m}-${d}`;
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
                inputClassName="w-full text-sm bg-white border border-outline-variant rounded-full px-4 py-2 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
                displayFormat="DD/MM/YYYY"
                placeholder="Chọn ngày"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <FilterBar
              filters={[
                {
                  key: "orderStatus",
                  label: "Trạng thái",
                  options: ORDER_STATUS_OPTIONS,
                },
              ]}
              values={{
                orderStatus: filters.orderStatus,
                fromDate: filters.fromDate,
                toDate: filters.toDate,
              }}
              onChange={(key, value) => handleFilterChange({ [key]: value })}
              onReset={clearFilters}
            />

            {/* Action Buttons */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-all font-label-md text-sm font-semibold h-[38px]"
              title="Xuất báo cáo Excel"
            >
              <span className="material-symbols-outlined text-[18px]">
                download
              </span>
              Xuất báo cáo
            </button>
          </div>
        </div>

        {/* Data Table wrapped for alignment */}
        <div className="flex-1 min-h-0 overflow-y-auto [&_th:nth-child(4)]:text-right [&_td:nth-child(4)]:text-right [&_th:nth-child(4)_span]:justify-end [&_th:nth-child(4)_span]:w-full">
          <DataTable
            columns={ORDER_TABLE_COLUMNS}
            rows={rows}
            isLoading={loading}
            emptyTitle="Không tìm thấy đơn hàng nào"
            emptyMessage="Hãy thử đổi bộ lọc hoặc từ khóa tìm kiếm khác."
            renderCell={renderCell}
          />
        </div>

        {/* Pagination Footer */}
        {!loading && orders.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant pt-5">
            <div className="text-body-sm text-on-surface-variant">
              Hiển thị{" "}
              <span className="font-semibold text-on-surface">
                {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              trong{" "}
              <span className="font-semibold text-on-surface">
                {pagination.total}
              </span>{" "}
              đơn hàng
            </div>
            <PaginationControl
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <ExportOrderModal
        open={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportOrder}
      />

      {/* Order Detail Modal */}
      {createPortal(
        <OrderDetailModal
          open={!!detailOrderId}
          onClose={() => setDetailOrderId(null)}
          orderId={detailOrderId}
        />,
        document.body,
      )}

      {/* Cancel Order Confirm Dialog */}
      {createPortal(
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
        />,
        document.body,
      )}
    </section>
  );
};

export default OrderListPage;
