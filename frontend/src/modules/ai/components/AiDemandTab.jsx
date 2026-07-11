import { useMemo } from "react";
import ForecastStatsWidget from "./forecast/ForecastStatsWidget";
import TopItemsChart from "./forecast/TopItemsChart";
import CategoryPieChart from "./forecast/CategoryPieChart";
import Spinner from "../../../components/feedback/Spinner";
import EmptyState from "../../../components/data-display/EmptyState";
import AiVersionSelector from "./AiVersionSelector";

const AiDemandTab = ({
  insight,
  isLoading,
  isMutating,
  selectedDate,
  versions = [],
  onVersionChange,
  onDateChange,
  onGenerate,
}) => {
  const totalPredicted = useMemo(() => {
    if (!insight?.forecasts) return 0;
    return insight.forecasts.reduce((sum, f) => sum + f.predictedDemand, 0);
  }, [insight]);

  return (
    <div className="space-y-6">
      {/* Control bar (Synced with other tabs) */}
      <AiVersionSelector
        label="Ngày áp dụng dự đoán"
        buttonLabel="Khởi tạo Dự đoán AI"
        selectedDate={selectedDate}
        versions={versions}
        insightVersion={insight?.version}
        isLoading={isLoading}
        isMutating={isMutating}
        onDateChange={onDateChange}
        onVersionChange={onVersionChange}
        onGenerate={onGenerate}
      />

      {isLoading &&
      (!insight || !insight.forecasts || insight.forecasts.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Spinner size="lg" />
          <p className="text-body-md text-on-surface-variant font-semibold">
            Đang chạy mô hình dự báo XGBoost...
          </p>
        </div>
      ) : !insight || !insight.forecasts || insight.forecasts.length === 0 ? (
        <EmptyState
          icon="auto_awesome"
          title="Chưa có dữ liệu dự báo nhu cầu"
          message="Vui lòng chọn ngày áp dụng và nhấn nút 'Khởi tạo Dự đoán AI' để chạy mô hình máy học dự đoán."
        />
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Text Insight Overview */}
          <div className="bg-primary-container/10 border-l-4 border-primary p-4 rounded-r-xl">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-primary">
                auto_awesome
              </span>
              <div>
                <h4 className="font-label-md text-primary font-bold uppercase tracking-wider mb-1">
                  AI Insight
                </h4>
                <p className="text-body-md text-on-surface-variant italic">
                  "Dự báo lượng khách ổn định. Các món thuộc danh mục Cơm trưa
                  và Bún/Phở sẽ chiếm tỉ trọng cao."
                </p>
              </div>
            </div>
          </div>

          {/* KPI Widget */}
          <ForecastStatsWidget
            insight={insight}
            totalPredicted={totalPredicted}
          />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopItemsChart forecasts={insight.forecasts} />
            <CategoryPieChart forecasts={insight.forecasts} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AiDemandTab;
