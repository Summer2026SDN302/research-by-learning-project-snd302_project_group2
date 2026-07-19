import { useState } from "react";
import { createPortal } from "react-dom";
import ConfirmDialog from "../../../components/feedback/ConfirmDialog";
import { AI_STATUS_MAP } from "../constants/aiConstants";

import useAiPermissions from "../hooks/useAiPermissions";

/**
 * AiInsightTableRowActions — Inline action buttons (view / apply / reject) for a table row.
 */
const AiInsightTableRowActions = ({
  isMutating,
  onView,
  onApply,
  onReject,
  canOverride,
}) => (
  <div className="flex items-center justify-center gap-1">
    <button
      onClick={onView}
      className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors flex items-center justify-center"
      title="Xem chi tiết"
    >
      <span className="material-symbols-outlined text-[20px]">visibility</span>
    </button>
    {canOverride && (
      <>
        <button
          onClick={onApply}
          disabled={isMutating}
          className="p-1.5 text-secondary hover:bg-secondary-container/20 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
          title="Áp dụng"
        >
          <span className="material-symbols-outlined text-[20px]">check</span>
        </button>
        <button
          onClick={onReject}
          disabled={isMutating}
          className="p-1.5 text-error hover:bg-error-container/20 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
          title="Từ chối"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </>
    )}
  </div>
);

/**
 * AiInsightTable — Generic slim table for AI insight rows.
 * Accepts custom column headers and a render function for each row's cells.
 */
const AiInsightTable = ({
  rows,
  columns,
  isAdmin,
  isMutating,
  hasAnyPending,
  applyAllLabel = "Áp dụng tất cả",
  onApplyAll,
  onView,
  onApply,
  onReject,
  renderCells,
}) => {
  const [confirmAction, setConfirmAction] = useState(null);
  const { canOverrideItem } = useAiPermissions(isAdmin);

  const handleConfirm = () => {
    if (confirmAction?.type === "applyAll") onApplyAll();
    if (confirmAction?.type === "apply") onApply(confirmAction.id);
    if (confirmAction?.type === "reject") onReject(confirmAction.id);
    setConfirmAction(null);
  };

  return (
    <>
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-headline-sm font-bold text-on-surface">
            Đề xuất cần xem xét
          </h3>
          {hasAnyPending && (
            <button
              onClick={() => setConfirmAction({ type: "applyAll" })}
              disabled={isMutating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-label-md font-bold hover:bg-primary-container transition-colors disabled:opacity-50"
            >
              {applyAllLabel}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/60 text-label-md text-on-surface-variant uppercase font-bold">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`py-3 px-2 ${col.align ? `text-${col.align}` : ""}`}
                  >
                    {col.label}
                  </th>
                ))}
                <th className="py-3 px-2 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const badgeConfig = AI_STATUS_MAP[row.status] || {
                  status: "pending",
                  label: row.status,
                };
                const canOverride = canOverrideItem(row);

                return (
                  <tr
                    key={row.foodItemId}
                    className="border-b border-outline-variant/40 hover:bg-surface-container-low/30 transition-colors"
                  >
                    {renderCells(row, badgeConfig)}
                    <td className="py-3.5 px-2 text-center">
                      <AiInsightTableRowActions
                        status={row.status}
                        isMutating={isMutating}
                        canOverride={canOverride}
                        onView={() => onView(row)}
                        onApply={() =>
                          setConfirmAction({
                            type: "apply",
                            id: row.foodItemId,
                            currentStatus: row.status,
                          })
                        }
                        onReject={() =>
                          setConfirmAction({
                            type: "reject",
                            id: row.foodItemId,
                            currentStatus: row.status,
                          })
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {confirmAction &&
        createPortal(
          <ConfirmDialog
            open={!!confirmAction}
            title="Xác nhận"
            description={
              confirmAction?.type === "applyAll"
                ? "Bạn có chắc chắn muốn áp dụng tất cả các đề xuất này không?"
                : confirmAction?.currentStatus &&
                    confirmAction.currentStatus !== "Pending"
                  ? "Hành động này sẽ chép đè quyết định trước đó. Bạn có chắc chắn muốn tiếp tục?"
                  : confirmAction?.type === "apply"
                    ? "Bạn có chắc chắn muốn áp dụng đề xuất này không?"
                    : "Bạn có chắc chắn muốn từ chối đề xuất này không?"
            }
            confirmLabel={
              confirmAction?.type === "applyAll"
                ? "Áp dụng tất cả"
                : confirmAction?.type === "apply"
                  ? "Áp dụng"
                  : "Từ chối"
            }
            cancelLabel="Hủy"
            variant={confirmAction.type === "reject" ? "danger" : "info"}
            onConfirm={handleConfirm}
            onCancel={() => setConfirmAction(null)}
          />,
          document.body,
        )}
    </>
  );
};

export { AiInsightTableRowActions };
export default AiInsightTable;
