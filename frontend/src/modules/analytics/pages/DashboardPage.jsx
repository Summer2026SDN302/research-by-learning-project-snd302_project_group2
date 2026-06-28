import dayjs from "dayjs";
import "dayjs/locale/vi";

import EmptyState from "../../../components/data-display/EmptyState";
import DashboardKpiGrid from "../components/DashboardKpiGrid";
import OrderStatisticsPanel from "../components/OrderStatisticsPanel";
import RevenueChart from "../components/RevenueChart";
import TopFoodsList from "../components/TopFoodsList";
import useDashboard from "../hooks/useDashboard";
import useRevenueChart from "../hooks/useRevenueChart";

dayjs.locale("vi");

const DashboardPage = () => {
  const { data, loading, error, orderStats, orderStatsLoading, refresh } =
    useDashboard();
  const { labels, values, range, chartLoading, onRangeChange } =
    useRevenueChart();

  if (error && !data) {
    return (
      <EmptyState
        icon="error"
        title="Không thể tải dashboard"
        message={error}
        action={
          <button
            type="button"
            onClick={refresh}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold"
          >
            Thử lại
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">
            Tổng quan hôm nay
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            {dayjs().format("dddd, D MMMM, YYYY")}
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="p-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
          aria-label="Làm mới dữ liệu"
        >
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </header>

      <DashboardKpiGrid kpis={data?.kpis} loading={loading} />

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
        <TopFoodsList items={data?.topFoods ?? []} loading={loading} />
      </div>

      <OrderStatisticsPanel data={orderStats} loading={orderStatsLoading} />
    </div>
  );
};

export default DashboardPage;
