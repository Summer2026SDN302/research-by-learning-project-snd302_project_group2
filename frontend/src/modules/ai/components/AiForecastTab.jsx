import EmptyState from "../../../components/data-display/EmptyState";
import StatusBadge from "../../../components/data-display/StatusBadge";
import Spinner from "../../../components/feedback/Spinner";
import AiVersionSelector from "./AiVersionSelector";
import AiForecastStatsGrid from "./AiForecastStatsGrid";
import AiInsightTable from "./AiInsightTable";
import AiForecastDetailModal from "./AiForecastDetailModal";

import AiDecisionStats from "./AiDecisionStats";

import { FORECAST_COLUMNS } from "../constants/aiConstants";
import useAiForecast from "../hooks/useAiForecast";

/**
 * AiForecastTab — Tab displaying AI demand forecasting results.
 * Handles single-item apply/reject, apply-all, and per-item detail modals.
 */
const AiForecastTab = ({
  insight,
  isLoading,
  isMutating,
  selectedDate,
  versions = [],
  isAdmin = false,
  onVersionChange,
  onDateChange,
  onGenerate,
}) => {
  const {
    forecasts,
    totalPredicted,
    totalRecommended,
    topDish,
    decisionStats,
    selectedItem,
    setSelectedItem,
    handleApplySingle,
    handleRejectSingle,
    handleApplyAll,
  } = useAiForecast();

  return (
    <div className="space-y-6">
      {/* Control bar */}
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

      {/* Content */}
      {isLoading && forecasts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Spinner size="lg" />
          <p className="text-body-md text-on-surface-variant font-semibold">
            Đang chạy mô hình dự báo XGBoost...
          </p>
        </div>
      ) : forecasts.length === 0 ? (
        <EmptyState
          icon="auto_awesome"
          title="Chưa có dữ liệu dự báo nhu cầu"
          message="Vui lòng chọn ngày áp dụng và nhấn nút 'Khởi tạo Dự đoán AI' để chạy mô hình máy học dự đoán số lượng món ăn cần chuẩn bị."
        />
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Bento summary stats grid (Top Row) */}
          <AiForecastStatsGrid
            selectedDate={selectedDate}
            totalPredicted={totalPredicted}
            totalRecommended={totalRecommended}
            topDish={topDish}
            modelCount={forecasts.length}
            metrics={insight?.metrics}
          />

          {/* Bottom Row - Split layout: Table left, decision progress right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Table */}
            <div className="lg:col-span-2">
              <AiInsightTable
                rows={forecasts}
                columns={FORECAST_COLUMNS}
                isAdmin={isAdmin}
                isMutating={isMutating}
                hasAnyPending={forecasts.some((f) => f.status === "Pending")}
                onApplyAll={handleApplyAll}
                onView={(row) => setSelectedItem(row)}
                onApply={handleApplySingle}
                onReject={handleRejectSingle}
                renderCells={(row, badgeConfig) => (
                  <>
                    <td className="py-3.5 px-2 font-semibold text-body-md text-on-surface">
                      {row.name}
                    </td>
                    <td className="py-3.5 px-2 text-right font-bold text-primary">
                      {row.recommendedQuantity} phần
                    </td>
                    <td className="py-3.5 px-2 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <StatusBadge
                          status={badgeConfig.status}
                          label={badgeConfig.label}
                        />
                        {row.status !== "Pending" &&
                          (row.appliedBy || row.rejectedBy) && (
                            <span className="text-[10px] text-on-surface-variant">
                              bởi{" "}
                              {row.appliedBy?.fullName ||
                                row.rejectedBy?.fullName}
                            </span>
                          )}
                      </div>
                    </td>
                  </>
                )}
              />
            </div>

            {/* Sidebar analytics */}
            <div className="lg:col-span-1">
              <AiDecisionStats
                decisionStats={decisionStats}
                selectedDate={selectedDate}
              />
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedItem &&
        (() => {
          const liveItem =
            forecasts.find((f) => f.foodItemId === selectedItem.foodItemId) ||
            selectedItem;
          return (
            <AiForecastDetailModal
              item={liveItem}
              isAdmin={isAdmin}
              isMutating={isMutating}
              onApply={handleApplySingle}
              onReject={handleRejectSingle}
              onClose={() => setSelectedItem(null)}
            />
          );
        })()}
    </div>
  );
};

export default AiForecastTab;
