import StatisticCard from "../../../../components/data-display/StatisticCard";

const ForecastStatsWidget = ({ insight, totalPredicted }) => {
  const confidenceScore = insight?.metrics?.confidence ?? 0;
  const modelName = insight?.metrics?.modelName || "XGBoost";
  const numForecasts = insight?.forecasts?.length || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* Total Demand Predicted */}
      <StatisticCard
        icon="insights"
        label="Dự kiến lượt suất ăn"
        value={`${totalPredicted} phần`}
        variant="primary"
      />

      {/* Number of AI Insights processed */}
      <StatisticCard
        icon="restaurant"
        label="Đề xuất món được phân tích"
        value={`${numForecasts} món`}
        variant="secondary"
      />

      {/* Confidence Score */}
      <StatisticCard
        icon="memory"
        label={`Độ tin cậy (${modelName})`}
        value={`${confidenceScore}%`}
        variant="tertiary"
      />
    </div>
  );
};

export default ForecastStatsWidget;
