import { createPortal } from "react-dom";
import { formatCurrency } from "../../../../utils/formatters";
import StatusBadge from "@/components/data-display/StatusBadge";

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const formatDeletedBy = (item) => {
  if (!item) return "—";

  if (item.deletedByName) return item.deletedByName;

  if (item.deletedByEmail) return item.deletedByEmail;

  if (typeof item.deletedBy === "object") {
    return (
      item.deletedBy.fullName ??
      item.deletedBy.username ??
      item.deletedBy.email ??
      item.deletedBy._id ??
      "—"
    );
  }

  return item.deletedBy ?? "—";
};

const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-1 sm:gap-4 py-3 border-b border-outline-variant/50 last:border-b-0">
    <p className="text-label-md font-semibold text-on-surface-variant">
      {label}
    </p>
    <p className="text-body-sm text-on-surface break-words">{value ?? "—"}</p>
  </div>
);

const FoodItemDetailDialog = ({ open, item, onClose }) => {
  if (!open || !item) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-on-surface/30 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl max-h-[80vh] rounded-3xl border border-outline-variant/60 bg-surface-container-lowest shadow-elevated overflow-hidden flex flex-col">
        <div className="px-6 sm:px-8 py-6 border-b border-outline-variant/60 bg-gradient-to-r from-surface-container-lowest to-surface-container-low/50 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">
                restaurant
              </span>
            </div>

            <div>
              <p className="text-label-md text-on-surface-variant font-semibold">
                Chi tiết món ăn
              </p>
              <h3 className="text-headline-sm font-bold text-on-surface mt-1">
                {item.name}
              </h3>
              <div className="mt-2">
                <StatusBadge
                  status={item.isArchived ? "inactive" : "active"}
                  label={item.isArchived ? "Ngừng bán" : "Đang bán"}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors shrink-0 flex items-center justify-center"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 sm:px-8 sm:pb-8 overflow-y-auto flex-1">
          <div className="rounded-xl border border-outline-variant/60 bg-surface overflow-hidden">
            <div className="p-4 sm:p-5">
              <DetailRow label="Tên món" value={item.name} />
              <DetailRow
                label="Danh mục"
                value={item.categoryName ?? item.category?.name}
              />
              <DetailRow
                label="Giá bán"
                value={formatCurrency(item.basePrice)}
              />
              <DetailRow label="Giá vốn" value={formatCurrency(item.cost)} />
              <DetailRow
                label="Trạng thái"
                value={item.isArchived ? "Ngừng bán" : "Đang bán"}
              />
              <DetailRow
                label="Mô tả"
                value={item.description || "Chưa có mô tả"}
              />
              <DetailRow
                label="Ngày tạo"
                value={formatDateTime(item.createdAt)}
              />
              <DetailRow
                label="Cập nhật lần cuối"
                value={formatDateTime(item.updatedAt)}
              />
              <DetailRow
                label="Ngày ngừng bán"
                value={
                  item.isArchived
                    ? formatDateTime(item.deletedAt)
                    : "Chưa ngừng bán"
                }
              />
              <DetailRow
                label="Người ngừng bán"
                value={item.isArchived ? formatDeletedBy(item) : "—"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FoodItemDetailDialog;
