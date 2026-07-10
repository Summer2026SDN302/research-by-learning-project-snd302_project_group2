import { useState } from "react";
import { createPortal } from "react-dom";
import ConfirmDialog from "../../../components/feedback/ConfirmDialog";
import useAiPermissions from "../hooks/useAiPermissions";

/**
 * AiModalActions — Renders approve/reject action buttons shown inside detail modals.
 * Visible for Pending items or when the user is an Admin (override).
 */
const AiModalActions = ({ item, isAdmin, isMutating, onApply, onReject }) => {
  const [confirmAction, setConfirmAction] = useState(null);
  const { canOverrideItem } = useAiPermissions(isAdmin);

  if (!item) return null;
  
  const canOverride = canOverrideItem(item);
  const status = item.status;

  if (!canOverride) return null;

  const handleConfirm = () => {
    if (confirmAction === "apply") onApply();
    if (confirmAction === "reject") onReject();
    setConfirmAction(null);
  };

  const isOverride = status !== "Pending";

  return (
    <>
      <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/40">
        {status !== "Rejected" && (
          <button
            onClick={() => setConfirmAction("reject")}
            disabled={isMutating}
            className="px-4 py-2 rounded-lg font-bold text-label-md border border-error text-error hover:bg-error-container/20 transition-colors disabled:opacity-50"
          >
            Từ chối đề xuất
          </button>
        )}
        {status !== "Applied" && (
          <button
            onClick={() => setConfirmAction("apply")}
            disabled={isMutating}
            className="px-4 py-2 rounded-lg font-bold text-label-md bg-primary text-on-primary hover:bg-primary-container transition-colors disabled:opacity-50"
          >
            Áp dụng đề xuất
          </button>
        )}
      </div>

      {confirmAction &&
        createPortal(
          <ConfirmDialog
            open={!!confirmAction}
            title="Xác nhận"
            description={
              isOverride
                ? "Hành động này sẽ chép đè quyết định trước đó. Bạn có chắc chắn muốn tiếp tục?"
                : confirmAction === "apply"
                  ? "Bạn có chắc chắn muốn áp dụng đề xuất này cho thực đơn ngày?"
                  : "Bạn có chắc chắn muốn từ chối đề xuất này? Trạng thái sẽ được cập nhật."
            }
            confirmLabel={confirmAction === "apply" ? "Áp dụng" : "Từ chối"}
            cancelLabel="Hủy"
            variant={confirmAction === "apply" ? "info" : "danger"}
            onConfirm={handleConfirm}
            onCancel={() => setConfirmAction(null)}
          />,
          document.body,
        )}
    </>
  );
};

export default AiModalActions;
