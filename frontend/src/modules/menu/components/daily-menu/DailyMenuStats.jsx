import StatisticCard from "../../../../components/data-display/StatisticCard";

/**
 * DailyMenuStats
 *
 * Props:
 *   stats  {object} – { total, available, unavailable }
 */
const DailyMenuStats = ({ stats = {} }) => {
  const { total = 0, available = 0, unavailable = 0 } = stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <StatisticCard
        icon="restaurant_menu"
        label="Tổng món"
        value={total}
        variant="primary"
      />
      <StatisticCard
        icon="check_circle"
        label="Sẵn sàng"
        value={available}
        variant="secondary"
      />
      <StatisticCard
        icon="cancel"
        label="Ngừng"
        value={unavailable}
        variant="error"
      />
    </div>
  );
};

export default DailyMenuStats;
