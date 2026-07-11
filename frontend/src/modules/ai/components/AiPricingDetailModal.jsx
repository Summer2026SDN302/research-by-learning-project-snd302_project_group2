import { formatCurrency } from "../../../utils/formatters";
import AiInsightDetailModal from "./AiInsightDetailModal";
import { AiAuditLog } from "./AiForecastDetailModal";
import AiModalActions from "./AiModalActions";

/**
 * AiPricingDetailModal — Detail modal for a dynamic pricing recommendation item.
 */
const AiPricingDetailModal = ({ item, isAdmin, isMutating, onApply, onReject, onClose }) => (
  <AiInsightDetailModal onClose={onClose}>
    {/* Header */}
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
        <span className="material-symbols-outlined text-[28px]">sell</span>
      </div>
      <div>
        <h3 className="text-headline-sm font-bold text-on-surface">{item.name}</h3>
        <p className="text-body-sm text-on-surface-variant">Chi tiết định giá xả kho linh hoạt</p>
      </div>
    </div>

    {/* Original vs Recommended price */}
    <div className="grid grid-cols-2 gap-4 border-t border-b border-outline-variant/50 py-4">
      <div className="space-y-0.5">
        <span className="text-label-md text-on-surface-variant uppercase">Giá gốc hiện tại</span>
        <p className="text-body-lg font-semibold text-on-surface-variant line-through">
          {formatCurrency(item.originalPrice)}
        </p>
      </div>
      <div className="space-y-0.5">
        <span className="text-label-md text-primary uppercase">Giá đề xuất mới</span>
        <p className="text-headline-sm font-bold text-primary">{formatCurrency(item.recommendedPrice)}</p>
      </div>
    </div>

    {/* Remaining stock + discount */}
    <div className="flex items-center justify-between bg-surface-container rounded-xl p-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-label-md text-on-surface-variant uppercase">Tồn kho hiện tại</span>
        <span className="text-body-md font-bold text-on-surface">{item.currentRemaining} phần</span>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-label-md text-on-surface-variant uppercase">Mức giảm chiết khấu</span>
        <span className="text-label-md font-bold text-secondary bg-secondary-container/20 px-2 py-0.5 rounded">
          Giảm {item.recommendedDiscountPercentage}%
        </span>
      </div>
    </div>

    {/* Rationale */}
    <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/60 flex items-start gap-2.5">
      <span className="material-symbols-outlined text-tertiary mt-0.5">psychology</span>
      <div>
        <h4 className="text-label-md font-bold text-on-surface">Lý do đề xuất điều chỉnh</h4>
        <p className="text-body-sm text-on-surface-variant mt-1">
          {item.reason ||
            "Nhu cầu tiêu thụ thấp trong khung giờ này. Giảm giá để thanh lý hàng tồn kho dư thừa trước giờ đóng quầy."}
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

export default AiPricingDetailModal;
