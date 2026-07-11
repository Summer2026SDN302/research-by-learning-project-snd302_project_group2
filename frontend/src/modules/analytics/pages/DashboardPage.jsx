import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import "dayjs/locale/vi";

import EmptyState from "../../../components/data-display/EmptyState";
import PaginationControl from "../../../components/navigation/PaginationControl";
import DashboardKpiGrid from "../components/DashboardKpiGrid";
import OrderStatisticsPanel from "../components/OrderStatisticsPanel";
import RevenueChart from "../components/RevenueChart";
import TopFoodsList from "../components/TopFoodsList";
import RecentTransactionsList from "../components/RecentTransactionsList";
import ReportFilterBar from "../components/ReportFilterBar";
import ExportReportButton from "../components/ExportReportButton";
import SalesTrendPanel from "../components/SalesTrendPanel";
import useDashboard from "../hooks/useDashboard";
import useRevenueChart from "../hooks/useRevenueChart";
import useRevenueReport from "../hooks/useRevenueReport";
import {
  fetchTopFoodsReport,
  selectTopFoodsReportItems,
  selectTopFoodsReportLoading,
  selectDashboardFilters,
  setDashboardFilters,
} from "../redux/analyticsSlice";
import { getDateRangeFromPreset } from "../utils/dateRange";

dayjs.locale("vi");

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { data, loading, error, orderStats, orderStatsLoading, refresh } =
    useDashboard();
  const { labels, values, range, chartLoading, onRangeChange } =
    useRevenueChart();

  // Integrated Revenue Report state and actions
  const {
    items: reportItems,
    pagination,
    filters,
    loading: reportLoading,
    exportLoading,
    searchInput,
    setSearchInput,
    setStatusFilter,
    setPaymentMethod,
    setDatePreset,
    setPage,
    handleExport,
  } = useRevenueReport();

  // Top Foods dynamic sort state
  const [topFoodsSortBy, setTopFoodsSortBy] = useState("quantity");
  const topFoodsItems = useSelector(selectTopFoodsReportItems);
  const topFoodsLoading = useSelector(selectTopFoodsReportLoading);

  const dashboardFilters = useSelector(selectDashboardFilters);
  const [customFrom, setCustomFrom] = useState(dashboardFilters.from);
  const [customTo, setCustomTo] = useState(dashboardFilters.to);
  const [prevFilters, setPrevFilters] = useState({
    from: dashboardFilters.from,
    to: dashboardFilters.to,
  });

  if (
    dashboardFilters.from !== prevFilters.from ||
    dashboardFilters.to !== prevFilters.to
  ) {
    setPrevFilters({
      from: dashboardFilters.from,
      to: dashboardFilters.to,
    });
    setCustomFrom(dashboardFilters.from);
    setCustomTo(dashboardFilters.to);
  }

  useEffect(() => {
    dispatch(
      fetchTopFoodsReport({
        sortBy: topFoodsSortBy,
        limit: 5,
        from: dashboardFilters.from,
        to: dashboardFilters.to,
      }),
    );
  }, [dispatch, topFoodsSortBy, dashboardFilters.from, dashboardFilters.to]);

  const handleRefreshAll = () => {
    refresh();
    dispatch(
      fetchTopFoodsReport({
        sortBy: topFoodsSortBy,
        limit: 5,
        from: dashboardFilters.from,
        to: dashboardFilters.to,
      }),
    );
  };

  const handlePresetChange = (preset) => {
    if (preset === "custom") {
      dispatch(setDashboardFilters({ preset }));
    } else {
      const rangeVal = getDateRangeFromPreset(preset);
      dispatch(setDashboardFilters({ preset, ...rangeVal }));
    }
  };

  const handleCustomFilterSubmit = (e) => {
    e.preventDefault();
    dispatch(setDashboardFilters({ from: customFrom, to: customTo }));
  };

  if (error && !data) {
    return (
      <EmptyState
        icon="error"
        title="Không thể tải dashboard"
        message={error}
        action={
          <button
            type="button"
            onClick={handleRefreshAll}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold"
          >
            Thử lại
          </button>
        }
      />
    );
  }

  const isToday = dashboardFilters.preset === "today";
  const displayKpis = isToday
    ? data?.kpis
    : {
        todayRevenue: orderStats?.totals?.totalRevenue ?? 0,
        revenueChangePercent: null,
        todayOrderCount: orderStats?.totals?.orderCount ?? 0,
        orderCountDelta: null,
        averageOrderValue: orderStats?.totals?.orderCount
          ? Math.round(
              orderStats.totals.totalRevenue / orderStats.totals.orderCount,
            )
          : 0,
        averageOrderValueChangePercent: null,
      };

  const getRangeLabel = () => {
    if (dashboardFilters.preset === "today") return "hôm nay";
    if (dashboardFilters.preset === "7d") return "7 ngày qua";
    if (dashboardFilters.preset === "month") return "tháng này";
    return `${dayjs(dashboardFilters.from).format("DD/MM/YYYY")} - ${dayjs(dashboardFilters.to).format("DD/MM/YYYY")}`;
  };
  const rangeLabel = getRangeLabel();

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">
            Tổng quan báo cáo
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            {dayjs().format("dddd, D MMMM, YYYY")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefreshAll}
          className="p-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center"
          aria-label="Làm mới dữ liệu"
        >
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </header>

      {/* Date Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
        <div className="flex items-center gap-2">
          <span className="text-body-sm text-on-surface-variant font-medium">
            Khoảng thời gian:
          </span>
          <select
            value={dashboardFilters.preset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="bg-surface border border-outline-variant text-on-surface text-body-sm rounded-lg p-2 focus:ring-primary focus:border-primary"
          >
            <option value="today">Hôm nay</option>
            <option value="7d">7 ngày qua</option>
            <option value="month">Tháng này</option>
            <option value="custom">Tùy chỉnh</option>
          </select>
        </div>

        {dashboardFilters.preset === "custom" && (
          <form
            onSubmit={handleCustomFilterSubmit}
            className="flex flex-wrap items-center gap-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-body-sm text-on-surface-variant">Từ:</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="bg-surface border border-outline-variant text-on-surface text-body-sm rounded-lg p-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-body-sm text-on-surface-variant">Đến:</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="bg-surface border border-outline-variant text-on-surface text-body-sm rounded-lg p-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-on-primary px-4 py-2 rounded-lg text-body-sm font-semibold hover:bg-primary-hover transition-colors"
            >
              Lọc
            </button>
          </form>
        )}
      </div>

      {/* KPI Cards Grid */}
      <DashboardKpiGrid
        kpis={displayKpis}
        loading={loading}
        rangeLabel={rangeLabel}
      />

      {/* Main Charts & Top Foods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart
            labels={labels}
            values={values}
            loading={loading || chartLoading}
            range={range}
            onRangeChange={onRangeChange}
          />
        </div>
        <TopFoodsList
          items={topFoodsItems}
          loading={topFoodsLoading}
          sortBy={topFoodsSortBy}
          onSortByChange={setTopFoodsSortBy}
        />
      </div>

      <OrderStatisticsPanel data={orderStats} loading={orderStatsLoading} />

      <SalesTrendPanel />
      {/* Integrated Revenue Transactions Report Feed */}
      <div className="bg-surface rounded-xl border border-outline-variant shadow-soft overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-headline-sm font-bold text-on-surface">
              Báo cáo doanh thu & Lịch sử giao dịch
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Theo dõi, tìm kiếm và xuất dữ liệu báo cáo giao dịch tại quầy.
            </p>
          </div>
          <ExportReportButton onClick={handleExport} loading={exportLoading} />
        </div>

        <ReportFilterBar
          filters={filters}
          searchInput={searchInput}
          onStatusChange={setStatusFilter}
          onPaymentMethodChange={setPaymentMethod}
          onDatePresetChange={setDatePreset}
          onSearchChange={setSearchInput}
        />

        <RecentTransactionsList
          items={reportItems}
          loading={reportLoading}
          title="Kết quả lọc giao dịch"
        />

        {pagination.totalPages > 1 && (
          <div className="flex justify-end pt-4 border-t border-outline-variant">
            <PaginationControl
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
