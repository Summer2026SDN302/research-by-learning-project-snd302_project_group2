import React from "react";
import { createPortal } from "react-dom";
// [CHƯA CÓ BE] useNavigate — sẽ cần khi BE có module Invoice
// import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Datepicker from "react-tailwindcss-datepicker";
import { useOwnOrderHistory } from "../hooks/useOwnOrderHistory";
import ConfirmDialog from "@/components/feedback/ConfirmDialog";
import PaginationControl from "@/components/navigation/PaginationControl";
import OrderDetailModal from "../components/OrderDetailModal";
import PageHeader from "@/components/layout/PageHeader";
import StatisticCard from "@/components/data-display/StatisticCard";
import StatusBadge from "@/components/data-display/StatusBadge";
import FilterBar from "@/components/search/FilterBar";
import DataTable from "@/components/data-display/DataTable";
import SearchBar from "@/components/search/SearchBar";

import {
  ORDER_STATUS_OPTIONS,
  OWN_ORDER_TABLE_COLUMNS,
  ORDER_STATUS_MAP,
} from "../constants/orderConstants";

const OwnOrderHistoryPage = () => {
  // [CHƯA CÓ BE] useNavigate
  // const navigate = useNavigate();
  const {
    orders,
    rows,
    searchQuery,
    setSearchQuery,
    loading,
    kpis,
    filters,
    pagination,
    executeCancelOrder,
    handlePageChange,
    handleFilterChange,
    refetch,
  } = useOwnOrderHistory();

  const [cancelOrderId, setCancelOrderId] = React.useState(null);
  const [detailOrderId, setDetailOrderId] = React.useState(null);
  const [isCanceling, setIsCanceling] = React.useState(false);

  const datepickerRef = React.useRef(null);
  const [popoverDir, setPopoverDir] = React.useState("down");

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

  const getStatusBadge = (status) => {
    const config = ORDER_STATUS_MAP[status];
    if (config) {
      return <StatusBadge status={config.statusKey} label={config.label} />;
    }
    return <StatusBadge status="pending" label={status} />;
  };

  // [CHƯA CÓ BE] getPaymentStatusBadge — BE chưa có field paymentStatus trong Order model
  // const getPaymentStatusBadge = (status) => { ... };

  const getOrderItemsSummary = (items) => {
    if (!items || items.length === 0) return "Không có món";
    return items.map((i) => `${i.quantity}x ${i.name}`).join(", ");
  };

  const renderCell = (key, value, order) => {
    switch (key) {
      case "orderNumber":
        return <span className="font-bold text-primary">#{value}</span>;
      case "createdAt":
        return dayjs(value).format("HH:mm - DD/MM/YYYY");
      case "items":
        return (
          <div
            className="max-w-xs truncate"
            title={getOrderItemsSummary(value)}
          >
            {getOrderItemsSummary(value)}
          </div>
        );
      case "totalAmount":
        return (
          <span className="font-bold">
            {(value || 0).toLocaleString("vi-VN")}₫
          </span>
        );
      case "orderStatus":
        return getStatusBadge(value);
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDetailOrderId(order.id)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
              title="Xem chi tiết đơn hàng"
            >
              <span className="material-symbols-outlined text-[20px]">
                visibility
              </span>
            </button>
            {order.orderStatus === "Pending" && (
              <button
                onClick={() => setCancelOrderId(order.id)}
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
        breadcrumbs={[
          { label: "Bán hàng POS" },
          { label: "Lịch sử đơn của tôi" },
        ]}
        title="Lịch sử đơn của tôi"
        subtitle="Quản lý và theo dõi hiệu suất bán hàng cá nhân hôm nay."
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatisticCard
          icon="receipt_long"
          label="Đơn hàng hôm nay"
          value={`${kpis.todayOrdersCount} đơn`}
          variant="primary"
        />
        <StatisticCard
          icon="payments"
          label="Doanh thu cá nhân"
          value={`${kpis.personalRevenue.toLocaleString("vi-VN")}₫`}
          variant="secondary"
        />
        <StatisticCard
          icon="pending_actions"
          label="Đơn đang chờ"
          value={`${kpis.pendingOrdersCount} đơn`}
          variant="tertiary"
        />
      </div>

      {/* Toolbar + Table card */}
      <div className="space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-soft">
        {/* Toolbar: Search + Date + Filters */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1 max-w-2xl">
            {/* Search Bar */}
            <div className="w-full sm:max-w-[240px]">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Tìm mã đơn hàng..."
              />
            </div>

            {/* Khoảng thời gian (Date Picker) */}
            <div
              ref={datepickerRef}
              onClick={handleDatepickerInteraction}
              onFocusCapture={handleDatepickerInteraction}
              className="w-full sm:max-w-[200px] relative z-20"
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
              onReset={() =>
                handleFilterChange({
                  orderStatus: "",
                  fromDate: "",
                  toDate: "",
                })
              }
            />

            {/* Action Buttons */}
            <button
              onClick={refetch}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-primary text-primary rounded-lg hover:bg-primary-container transition-all font-label-md text-sm font-semibold"
              title="Tải lại dữ liệu"
            >
              <span className="material-symbols-outlined text-[18px]">
                refresh
              </span>
              Tải lại
            </button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={OWN_ORDER_TABLE_COLUMNS}
          rows={rows}
          isLoading={loading}
          emptyTitle="Không tìm thấy đơn hàng nào"
          emptyMessage="Hãy thử đổi bộ lọc hoặc từ khóa tìm kiếm khác."
          renderCell={renderCell}
        />

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

      {/* Order Detail Modal */}
      <OrderDetailModal
        open={!!detailOrderId}
        onClose={() => setDetailOrderId(null)}
        orderId={detailOrderId}
      />
    </section>
  );
};

export default OwnOrderHistoryPage;
