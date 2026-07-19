import dayjs from "dayjs";
import AiInsightDetailModal from "./AiInsightDetailModal";

/**
 * AiAuditLog — Renders the approval/rejection history section inside detail modals.
 * Used by both AiForecastDetailModal and AiPricingDetailModal.
 */
export const AiAuditLog = ({ status, appliedBy, appliedAt, rejectedBy, rejectedAt }) => (
  <div className="space-y-2 border-t border-outline-variant/40 pt-4">
    <h4 className="text-label-md font-bold text-on-surface uppercase">Nhật ký phê duyệt</h4>
    <div className="text-body-sm space-y-1">
      {status === "Applied" && (
        <div className="flex items-center gap-1 text-secondary">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>
            Đã áp dụng bởi{" "}
            <strong>{appliedBy?.fullName || "Hệ thống"}</strong>{" "}
            ({appliedBy?.role || "Staff"}) lúc{" "}
            {dayjs(appliedAt).format("HH:mm - DD/MM/YYYY")}
          </span>
        </div>
      )}
      {status === "Rejected" && (
        <div className="flex items-center gap-1 text-error">
          <span className="material-symbols-outlined text-[16px]">cancel</span>
          <span>
            Đã từ chối bởi{" "}
            <strong>{rejectedBy?.fullName || "Hệ thống"}</strong>{" "}
            ({rejectedBy?.role || "Staff"}) lúc{" "}
            {dayjs(rejectedAt).format("HH:mm - DD/MM/YYYY")}
          </span>
        </div>
      )}
      {status === "Pending" && (
        <div className="flex items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">schedule</span>
          <span>Đang chờ duyệt quyết định</span>
        </div>
      )}
    </div>
  </div>
);

import AiModalActions from "./AiModalActions";

/**
 * AiForecastDetailModal — Detail modal for a forecast recommendation item.
 */
const AiForecastDetailModal = ({ item, isAdmin, isMutating, onApply, onReject, onClose }) => {
  const diff = item.recommendedQuantity - item.predictedDemand;
  const isHigher = diff >= 0;

  return (
    <AiInsightDetailModal onClose={onClose}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-[28px]">restaurant</span>
        </div>
        <div>
          <h3 className="text-headline-sm font-bold text-on-surface">{item.name}</h3>
          <p className="text-body-sm text-on-surface-variant">Chi tiết đề xuất chuẩn bị thực đơn</p>
        </div>
      </div>

      {/* Demand vs Recommended */}
      <div className="grid grid-cols-2 gap-4 border-t border-b border-outline-variant/50 py-4">
        <div className="space-y-0.5">
          <span className="text-label-md text-on-surface-variant uppercase">Nhu cầu dự báo</span>
          <p className="text-headline-sm font-bold text-on-surface">{item.predictedDemand} phần</p>
        </div>
        <div className="space-y-0.5">
          <span className="text-label-md text-primary uppercase">Đề xuất chuẩn bị</span>
          <p className="text-headline-sm font-bold text-primary">{item.recommendedQuantity} phần</p>
        </div>
      </div>

      {/* Difference badge */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-0.5 px-2.5 py-1 rounded font-bold text-label-md ${
            isHigher ? "bg-secondary-container/30 text-secondary" : "bg-error-container/30 text-error"
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {isHigher ? "arrow_upward" : "arrow_downward"}
          </span>
          {isHigher ? `+${diff}` : `${diff}`} phần (AI)
        </span>
        <span className="text-body-sm text-on-surface-variant">so với dự báo gốc</span>
      </div>

      {/* Rationale */}
      <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/60 flex items-start gap-2.5">
        <span className="material-symbols-outlined text-primary">psychology</span>
        <div>
          <h4 className="text-label-md font-bold text-on-surface">Lý do điều chỉnh từ AI</h4>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {isHigher
              ? `Dự báo nhu cầu tăng. Điều chỉnh thêm +${diff} phần để đáp ứng lượng khách có xu hướng tăng đột biến vào khung giờ này.`
              : `Tối ưu hóa hao hụt. Điều chỉnh giảm ${Math.abs(diff)} phần nhằm hạn chế rủi ro tồn kho do sức mua dự kiến thấp hơn trung bình.`}
          </p>
        </div>
      </div>

      <AiAuditLog
        status={item.status}
        appliedBy={item.appliedBy}
        appliedAt={item.appliedAt}
        rejectedBy={item.rejectedBy}
        rejectedAt={item.rejectedAt}
      />

      <AiModalActions
        item={item}
        isAdmin={isAdmin}
        isMutating={isMutating}
        onApply={() => onApply(item.foodItemId)}
        onReject={() => onReject(item.foodItemId)}
      />
    </AiInsightDetailModal>
  );
};

export default AiForecastDetailModal;
