import StatisticCard from "@/components/data-display/StatisticCard";
import { formatCurrency } from "@/utils/formatters";

/**
 * PaymentStats
 *
 * Renders KPIs cards for the payment list page.
 */
const PaymentStats = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <StatisticCard
        icon="payments"
        label="Tổng doanh thu hôm nay"
        value={formatCurrency(kpis.totalRevenue)}
        variant="primary"
      />
      <StatisticCard
        icon="check_circle"
        label="Giao dịch thành công"
        value={kpis.successCount}
        variant="secondary"
      />
      <StatisticCard
        icon="schedule"
        label="Giao dịch đang chờ"
        value={kpis.pendingCount}
        variant="error"
      />
    </div>
  );
};

export default PaymentStats;
