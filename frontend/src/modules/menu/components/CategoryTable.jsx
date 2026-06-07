import DataTable from "../../../components/common/DataTable";
import StatusBadge from "../../../components/common/StatusBadge";

const formatShortId = (id) => {
  if (!id) return "—";
  const str = String(id);
  return str.slice(-6).toUpperCase();
};

const COLUMNS = [
  { key: "id", label: "ID", sortable: false },
  { key: "name", label: "Tên danh mục", sortable: true },
  { key: "icon", label: "Biểu tượng", sortable: false },
  { key: "foodItemCount", label: "Số lượng món", sortable: true },
  { key: "isActive", label: "Trạng thái", sortable: false },
  { key: "actions", label: "Thao tác", sortable: false },
];

const CategoryTable = ({
  categories,
  isLoading,
  emptyMessage,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const rows = categories.map((cat) => ({
    ...cat,
    id: cat._id,
  }));

  const renderCell = (key, value, row) => {
    switch (key) {
      case "id":
        return (
          <span className="text-on-surface-variant font-mono text-body-sm">
            {formatShortId(row._id)}
          </span>
        );
      case "name":
        return <span className="font-semibold text-on-surface">{row.name}</span>;
      case "icon":
        return (
          <div className="flex justify-center">
            <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">
              {row.icon ?? "restaurant_menu"}
            </span>
          </div>
        );
      case "foodItemCount":
        return <span>{row.foodItemCount ?? 0} món</span>;
      case "isActive":
        return (
          <StatusBadge status={row.isActive ? "active" : "inactive"} />
        );
      case "actions":
        return (
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row);
              }}
              className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
              title="Chỉnh sửa"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row);
              }}
              className="p-2 rounded-full text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
              title="Xóa"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus(row);
              }}
              className="p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
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
      columns={COLUMNS}
      rows={rows}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      renderCell={renderCell}
    />
  );
};

export default CategoryTable;

export const CategoryPagination = ({ pagination, onPageChange }) => {
  const { page, limit, total, totalPages } = pagination;
  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="mt-4 px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-3 text-body-sm">
      <span className="text-on-surface-variant">
        Hiển thị {from}-{to} trên {total} danh mục
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Trang trước
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Trang sau
        </button>
      </div>
    </div>
  );
};
