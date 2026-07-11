import StatisticCard from "../../../components/data-display/StatisticCard";
import DashboardSkeleton from "./DashboardSkeleton";
import { formatCurrency } from "@/utils/formatters";
import { formatOrderDelta, formatPercent } from "../utils/formatPercent";

const DashboardKpiGrid = ({ kpis, loading, rangeLabel }) => {
  if (loading && !kpis) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <DashboardSkeleton />
        <DashboardSkeleton />
        <DashboardSkeleton />
      </div>
    );
  }

  const data = kpis ?? {
    todayRevenue: 0,
    revenueChangePercent: null,
    todayOrderCount: 0,
    orderCountDelta: 0,
    averageOrderValue: 0,
    averageOrderValueChangePercent: null,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      <StatisticCard
        icon="payments"
        label={rangeLabel ? `Doanh thu (${rangeLabel})` : "Doanh thu hôm nay"}
        value={formatCurrency(data.todayRevenue)}
        change={formatPercent(data.revenueChangePercent)}
        variant="primary"
      />
      <StatisticCard
        icon="receipt_long"
        label={rangeLabel ? `Số lượng đơn hàng (${rangeLabel})` : "Số lượng đơn hàng"}
        value={data.todayOrderCount}
        change={formatOrderDelta(data.orderCountDelta)}
        changeSuffix=""
        variant="secondary"
      />
      <StatisticCard
        icon="local_dining"
        label="Giá trị đơn trung bình"
        value={formatCurrency(data.averageOrderValue)}
        change={formatPercent(data.averageOrderValueChangePercent)}
        variant="tertiary"
      />
    </div>
  );
};

export default DashboardKpiGrid;
