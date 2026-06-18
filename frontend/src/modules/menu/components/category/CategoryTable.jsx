import DataTable from "@/components/data-display/DataTable";
import StatusBadge from "@/components/data-display/StatusBadge";
import { BASE_COLUMNS } from "../../constants/categoryConstants";

const CategoryTable = ({
  categories,
  isLoading,
  emptyTitle,
  emptyMessage,
  onEdit,
  onToggleStatus,
  canManageActions = false,
}) => {
  const columns = canManageActions
    ? [...BASE_COLUMNS, { key: "actions", label: "Thao tác", sortable: false }]
    : BASE_COLUMNS;

  const rows = categories.map((cat) => ({
    ...cat,
    id: cat._id,
  }));

  const renderCell = (key, value, row) => {
    switch (key) {
      case "name":
        return (
          <span className="font-semibold text-on-surface">{row.name}</span>
        );

      case "icon":
        return (
          <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">
            {row.icon ?? "restaurant_menu"}
          </span>
        );

      case "foodItemCount":
        return <span>{row.foodItemCount ?? 0} món</span>;

      case "isActive":
        return (
          <StatusBadge
            status={row.isActive ? "active" : "inactive"}
            label={row.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
          />
        );

      case "actions":
        return (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row);
              }}
              className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors flex items-center justify-center"
              title="Chỉnh sửa"
            >
              <span className="material-symbols-outlined text-[20px]">
                edit
              </span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus(row);
              }}
              className="p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center"
              title={row.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
            >
              <span className="material-symbols-outlined text-[20px]">
                {row.isActive ? "block" : "check_circle"}
              </span>
            </button>
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
      emptyTitle={emptyTitle}
      emptyMessage={emptyMessage}
      renderCell={renderCell}
    />
  );
};

export default CategoryTable;
