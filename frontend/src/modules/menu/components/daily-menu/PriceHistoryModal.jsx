import { createPortal } from "react-dom";
import dayjs from "dayjs";
import { PRICE_SOURCE } from "../../constants/daily-menu/dailyMenuConstants";
import { formatVND } from "../../../../utils/formatters";
import DataTable from "../../../../components/data-display/DataTable";
import { HISTORY_COLUMNS } from "../../constants/daily-menu/dailyMenuConstants";
import { useState } from "react";
const formatDate = (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "—");

const sourceLabel = (s) => (s === PRICE_SOURCE.AI ? "AI" : "Thủ công");
const sourceBadge = (s) =>
  s === PRICE_SOURCE.AI
    ? "bg-primary/10 text-primary border-primary/20"
    : "bg-tertiary-container/20 text-tertiary border-tertiary/20";

/**
 * PriceHistoryModal
 *
 * Props:
 *   open      {boolean}
 *   item      {object}   – daily menu item
 *   onClose   {fn}
 *   isAdmin   {boolean}
 */
const PriceHistoryModal = ({ open, item, onClose, isAdmin }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  if (!open || !item) return null;

  const toggleExpand = (id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const history = item.priceHistory ?? [];
  const foodName = item.foodItemId?.name ?? "Món ăn";
  const rows = history.map((entry, idx) => ({
    index: idx + 1,
    changedAt: entry.changedAt,
    oldValue: entry.oldValue,
    newValue: entry.newValue,
    source: entry.source,
    reason: entry.reason,
    changedBy: entry.changedBy,
    _raw: entry,
  }));
  const columns = isAdmin
    ? HISTORY_COLUMNS
    : HISTORY_COLUMNS.filter((c) => c.key !== "changedBy");

  const renderCell = (key, value, row) => {
    switch (key) {
      case "changedAt":
        return formatDate(value);

      case "oldValue":
        return formatVND(value);

      case "newValue": {
        const diff = (row.newValue ?? 0) - (row.oldValue ?? 0);
        const diffColor =
          diff > 0 ? "text-error" : diff < 0 ? "text-secondary" : "";
        const diffSign = diff > 0 ? "+" : "";
        return (
          <span className="font-semibold">
            {formatVND(value)}
            <br />
            <span className={`text-[11px] ${diffColor}`}>
              ({diffSign}
              {formatVND(diff)})
            </span>
          </span>
        );
      }

      case "source":
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sourceBadge(value)}`}
          >
            {value === PRICE_SOURCE.AI && (
              <span className="material-symbols-outlined text-[12px] mr-0.5">
                auto_awesome
              </span>
            )}
            {sourceLabel(value)}
          </span>
        );

      case "reason": {
        const isExpanded = expandedRows.has(row.id);
        const isTruncatable = value && value.length > 20;

        return (
          <div style={{ width: isExpanded ? "160px" : "160px" }}>
            <span
              className={`inline-flex items-start gap-1 w-full ${
                isTruncatable ? "cursor-pointer hover:text-primary" : ""
              }`}
              onClick={() => isTruncatable && toggleExpand(row.id)}
              title={!isExpanded ? value || "" : undefined}
            >
              <span
                className={
                  isExpanded
                    ? "break-words whitespace-pre-wrap"
                    : "block truncate"
                }
                style={{ minWidth: 0 }}
              >
                {value || "—"}
              </span>
              {isTruncatable && (
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant shrink-0 mt-0.5">
                  {isExpanded ? "expand_less" : "expand_more"}
                </span>
              )}
            </span>
          </div>
        );
      }

      case "changedBy": {
        return (
          value?.fullName ||
          value?.username ||
          (typeof value === "string" ? value : null) ||
          "—"
        );
      }

      default:
        return String(value ?? "—");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-elevated p-6 w-full max-w-4xl h-[540px] mx-4 animate-in fade-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <div className="w-12 h-12 bg-tertiary-container/20 text-tertiary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">
              history
            </span>
          </div>
          <div>
            <h3 className="text-headline-sm font-bold text-on-surface">
              Lịch sử thay đổi giá
            </h3>
            <p className="text-body-sm text-on-surface-variant">{foodName}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Current price chip */}
        <div className="flex items-center gap-2 mb-5 shrink-0">
          <span className="text-label-md text-on-surface-variant">
            Giá hiện tại:
          </span>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-body-sm">
            {formatVND(item.currentPrice)}
          </span>
          <span className="text-label-md text-on-surface-variant ml-2">
            Giá gốc:
          </span>
          <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-body-sm">
            {formatVND(item.originalPrice)}
          </span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <DataTable
            columns={columns}
            rows={rows}
            emptyTitle="Chưa có thay đổi giá"
            emptyMessage="Chưa có thay đổi giá nào."
            renderCell={renderCell}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default PriceHistoryModal;
