import StatisticCard from '../../../../components/data-display/StatisticCard';
import { formatVND } from '../../../../utils/formatters';

/**
 * DailyMenuStats
 *
 * Props:
 *   stats  {object} – { total, available, unavailable, totalSold, totalRevenue }
 */
const DailyMenuStats = ({ stats = {} }) => {
  const { total = 0, available = 0, unavailable = 0, totalSold = 0, totalRevenue = 0 } = stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatisticCard
        icon="restaurant_menu"
        label="Tổng món"
        value={total}
        variant="primary"
      />
      <StatisticCard
        icon="check_circle"
        label="Còn phục vụ"
        value={available}
        variant="secondary"
      />
      <StatisticCard
        icon="shopping_cart"
        label="Đã bán"
        value={totalSold}
        variant="tertiary"
      />
      <StatisticCard
        icon="payments"
        label="Doanh thu tạm tính"
        value={formatVND(totalRevenue)}
        variant="primary"
      />
    </div>
  );
};

export default DailyMenuStats;
