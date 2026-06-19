import DataTable from "@/components/data-display/DataTable";
import StatusBadge from "@/components/data-display/StatusBadge";
import { formatCurrency } from "../../../../utils/formatters";
import { FOOD_ITEM_COLUMNS } from "../../constants/foodItemConstants";

const FoodItemTable = ({
  items,
  isLoading,
  emptyMessage,
  onViewDetail,
  onEdit,
  onToggleArchive,
  canViewDetail = true,
  canManageActions = false,
}) => {
  const showActions = canViewDetail || canManageActions;

  const columns = showActions
    ? [
        ...FOOD_ITEM_COLUMNS,
        { key: "actions", label: "Thao Tác", sortable: false },
      ]
    : FOOD_ITEM_COLUMNS;

  const rows = items.map((item) => ({
    ...item,
    id: item._id,
  }));

  const renderCell = (key, value, row) => {
    const muted = row.isArchived;

    switch (key) {
      case "name":
        return (
          <span
            className={`font-semibold ${muted ? "text-on-surface-variant" : "text-on-surface"}`}
          >
            {row.name}
          </span>
        );
      case "category":
        return (
          <span className={muted ? "text-on-surface-variant" : ""}>
            {row.categoryName ?? row.category?.name ?? "—"}
          </span>
        );
      case "basePrice":
        return (
          <div className={`${muted ? "text-on-surface-variant" : ""}`}>
            {formatCurrency(row.basePrice)}
          </div>
        );
      case "status":
        return (
          <StatusBadge
            status={row.isArchived ? "inactive" : "active"}
            label={row.isArchived ? "Ngừng bán" : "Đang bán"}
          />
        );
      case "actions":
        return (
          <div className="flex items-center gap-1">
            {canViewDetail && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail(row);
                }}
                className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors flex items-center justify-center"
                title="Xem chi tiết"
              >
                <span className="material-symbols-outlined text-[20px]">
                  visibility
                </span>
              </button>
            )}

            {canManageActions && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(row);
                  }}
                  className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors flex items-center justify-center"
                  title="Sửa"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    edit
                  </span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleArchive(row);
                  }}
                  className="p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center"
                  title={row.isArchived ? "Bật bán lại" : "Ngừng bán"}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {row.isArchived ? "toggle_off" : "toggle_on"}
                  </span>
                </button>
              </>
            )}
          </div>
        );
      default:
        return String(value ?? "—");
    }
  };

  return (
    <DataTable
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      emptyTitle="Chưa có món ăn nào"
      emptyMessage={emptyMessage}
      renderCell={renderCell}
    />
  );
};

export default FoodItemTable;
