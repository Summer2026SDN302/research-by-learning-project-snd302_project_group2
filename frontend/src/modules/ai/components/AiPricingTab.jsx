import EmptyState from "../../../components/data-display/EmptyState";
import StatusBadge from "../../../components/data-display/StatusBadge";
import Spinner from "../../../components/feedback/Spinner";
import { formatCurrency } from "../../../utils/formatters";
import AiVersionSelector from "./AiVersionSelector";
import AiInsightTable from "./AiInsightTable";
import AiPricingDetailModal from "./AiPricingDetailModal";
import AiDecisionStats from "./AiDecisionStats";
import StatisticCard from "../../../components/data-display/StatisticCard";

import { PRICING_COLUMNS } from "../constants/aiConstants";
import useAiPricing from "../hooks/useAiPricing";

/**
 * AiPricingStatsGrid — Three bento-style stat cards shown above the pricing table.
 */
const AiPricingStatsGrid = ({ count, metrics }) => {
  const confidence = metrics?.confidence || 94;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <StatisticCard
        icon="trending_up"
        label="Dự kiến tăng doanh thu"
        value="+12.4%"
        variant="secondary"
      />
      <StatisticCard
        icon="sell"
        label="Số lượng đề xuất"
        value={String(count).padStart(2, "0")}
        variant="primary"
      />
      <StatisticCard
        icon="memory"
        label="Độ tin cậy mô hình AI"
        value={`${confidence}%`}
        variant="tertiary"
      />
    </div>
  );
};

/**
 * AiPricingTab — Tab displaying AI dynamic pricing (clearance) recommendations.
 * Handles single-item apply/reject, apply-all, and per-item detail modals.
 */
const AiPricingTab = ({
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
    pricingRecommendations,
    decisionStats,
    selectedItem,
    setSelectedItem,
    handleApplySingle,
    handleRejectSingle,
    handleApplyAll,
  } = useAiPricing();

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <AiVersionSelector
        label="Ngày áp dụng định giá"
        buttonLabel="Tạo Đề xuất Giá"
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
      {isLoading && pricingRecommendations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Spinner size="lg" />
          <p className="text-body-md text-on-surface-variant font-semibold">
            Đang tính toán mức độ tồn kho và tối ưu giá bán...
          </p>
        </div>
      ) : pricingRecommendations.length === 0 ? (
        <EmptyState
          icon="auto_awesome"
          title="Chưa có đề xuất điều chỉnh giá"
          message="Vui lòng nhấn nút 'Tạo Đề xuất Giá' để hệ thống quét mức tồn kho thực tế, kết hợp thời gian đóng quầy nhằm đưa ra giá bán thanh lý tối ưu giảm lãng phí."
        />
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Bento stats grid */}
          <AiPricingStatsGrid
            count={pricingRecommendations.length}
            metrics={insight.metrics}
          />

          {/* Bottom Row - Split layout: Table left, decision progress right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
              {/* Simplified table */}
              <AiInsightTable
                rows={pricingRecommendations}
                columns={PRICING_COLUMNS}
                isAdmin={isAdmin}
                isMutating={isMutating}
                hasAnyPending={pricingRecommendations.some(
                  (p) => p.status === "Pending",
                )}
                applyAllLabel="Áp dụng tất cả"
                onApplyAll={handleApplyAll}
                onView={(row) => setSelectedItem(row)}
                onApply={handleApplySingle}
                onReject={handleRejectSingle}
                renderCells={(row, badgeConfig) => (
                  <>
                    <td className="py-3.5 px-2 font-semibold text-body-md text-on-surface">
                      {row.name}
                    </td>
                    <td className="py-3.5 px-2 text-right font-bold">
                      <div className="flex flex-col items-end">
                        <span className="text-primary">
                          {formatCurrency(row.recommendedPrice)}
                        </span>
                        <span className="text-[10px] font-bold text-secondary bg-secondary-container/20 px-1 py-0.2 rounded w-max mt-0.5">
                          Giảm {row.recommendedDiscountPercentage}%
                        </span>
                      </div>
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
                              {row.appliedBy?.fullName || row.rejectedBy?.fullName}
                            </span>
                          )}
                      </div>
                    </td>
                  </>
                )}
              />
            </div>

            {/* Decision Analysis Progress Sidebar */}
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
            pricingRecommendations.find(
              (p) => p.foodItemId === selectedItem.foodItemId,
            ) || selectedItem;
          return (
            <AiPricingDetailModal
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

export default AiPricingTab;
