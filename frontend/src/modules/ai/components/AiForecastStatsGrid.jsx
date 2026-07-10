import StatisticCard from "../../../components/data-display/StatisticCard";

/**
 * AiForecastStatsGrid
 *
 * KPI cards shown above the forecast content.
 * Styled using the standard StatisticCard to match other screens (e.g. DailyMenuStats).
 */
const AiForecastStatsGrid = ({ totalPredicted, topDish, metrics }) => {
  const confidence = metrics?.confidence;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <StatisticCard
        icon="insights"
        label="Tổng nhu cầu dự đoán"
        value={`${totalPredicted} phần`}
        variant="primary"
      />
      <StatisticCard
        icon="restaurant"
        label={`Top 1: ${topDish?.name || "N/A"}`}
        value={`${topDish?.recommendedQuantity || 0} phần`}
        variant="secondary"
      />
      <StatisticCard
        icon="memory"
        label="Độ tin cậy mô hình"
        value={`${confidence}%`}
        variant="tertiary"
      />
    </div>
  );
};

export default AiForecastStatsGrid;
