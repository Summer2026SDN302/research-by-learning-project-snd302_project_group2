import DataTable from "../../../../components/data-display/DataTable";
import StatusBadge from "../../../../components/data-display/StatusBadge";
import PaginationControl from "../../../../components/navigation/PaginationControl";
import { DAILY_MENU_TABLE_COLUMNS } from "../../constants/daily-menu/dailyMenuConstants";
import { formatCurrency } from "../../../../utils/formatters";
import RowActionsMenu from "./RowActionsMenu";

/**
 * DailyMenuTable
 *
 * Props:
 *   items         {Array}    – paginated items
 *   isLoading     {boolean}
 *   onEdit        {fn}       – (item) => void
 *   onViewHistory {fn}       – (item) => void
 *   onRemove      {fn}       – (item) => void
 *   currentPage   {number}
 *   totalPages    {number}
 *   totalItems    {number}
 *   onPageChange  {fn}
 */
const DailyMenuTable = ({
  items = [],
  isLoading,
  onEdit,
  onViewHistory,
  onRemove,
  currentPage,
  totalPages,
  totalItems = 0,
  onPageChange,
  isToday = true,
}) => {
  // Map items to rows with flat keys for DataTable
  const rows = items.map((item) => ({
    id: item.foodItemId?._id,
    name: item.foodItemId?.name ?? "—",
    category: item.foodItemId?.categoryId?.name ?? "—",
    originalPrice: item.originalPrice,
    currentPrice: item.currentPrice,
    preparedQuantity: item.preparedQuantity,
    soldQuantity: item.soldQuantity,
    remainingQuantity: item.remainingQuantity,
    status: item.status,
    _raw: item, // keep raw for handlers
  }));

  const statusMap = {
    Available: "active",
    Unavailable: "inactive",
  };

  const renderCell = (key, value, row) => {
    switch (key) {
      case "originalPrice":
      case "currentPrice":
        return <span className="font-medium">{formatCurrency(value)}</span>;

      case "preparedQuantity":
        return (
          <span
            className={value === 0 ? "text-outline italic" : "font-semibold"}
          >
            {value === 0 ? "Chưa cài" : value}
          </span>
        );

      case "status":
        return (
          <StatusBadge
            status={statusMap[value] ?? "pending"}
            label={value === "Available" ? "Sẵn sàng" : "Ngừng"}
            size="sm"
          />
        );

      case "actions":
        return (
          <RowActionsMenu
            row={row}
            onEdit={onEdit}
            onViewHistory={onViewHistory}
            onRemove={onRemove}
            isToday={isToday}
          />
        );

      default:
        return String(value ?? "—");
    }
  };

  return (
    <div className="space-y-4">
      <DataTable
        columns={DAILY_MENU_TABLE_COLUMNS}
        rows={rows}
        isLoading={isLoading}
        emptyTitle="Chưa có dữ liệu"
        emptyMessage="Thực đơn ngày này chưa có món ăn."
        renderCell={renderCell}
      />

      {/* Pagination row */}
      <div className="flex flex-col gap-4 border-t border-outline-variant pt-5 md:flex-row md:items-center md:justify-between">
        <p className="text-body-sm text-on-surface-variant">
          Hiển thị trang {currentPage} / {totalPages || 1} — Tổng {totalItems}{" "}
          món ăn
        </p>
        <PaginationControl
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default DailyMenuTable;
