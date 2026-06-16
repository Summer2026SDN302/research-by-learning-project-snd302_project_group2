import DataTable from '../../../../components/data-display/DataTable';
import StatusBadge from '../../../../components/data-display/StatusBadge';
import PaginationControl from '../../../../components/navigation/PaginationControl';
import { DAILY_MENU_TABLE_COLUMNS } from '../../constants/daily-menu/dailyMenuConstants';
import { formatVND } from '../../../../utils/formatters';

/**
 * DailyMenuTable
 *
 * Props:
 *   items       {Array}    – paginated items
 *   isLoading   {boolean}
 *   onEdit      {fn}       – (item) => void
 *   onViewHistory {fn}     – (item) => void
 *   onRemove    {fn}       – (item) => void
 *   currentPage {number}
 *   totalPages  {number}
 *   onPageChange {fn}
 */
const DailyMenuTable = ({
  items = [],
  isLoading,
  onEdit,
  onViewHistory,
  onRemove,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Map items to rows with flat keys for DataTable
  const rows = items.map((item) => ({
    id: item.foodItemId?._id,
    name: item.foodItemId?.name ?? '—',
    category: item.foodItemId?.categoryName ?? item.foodItemId?.categoryId?.name ?? '—',
    originalPrice: item.originalPrice,
    currentPrice: item.currentPrice,
    preparedQuantity: item.preparedQuantity,
    soldQuantity: item.soldQuantity,
    remainingQuantity: item.remainingQuantity,
    status: item.status,
    _raw: item, // keep raw for handlers
  }));

  const statusMap = {
    Available:   'active',
    Unavailable: 'inactive',
  };

  const renderCell = (key, value, row) => {
    switch (key) {
      case 'originalPrice':
      case 'currentPrice':
        return <span className="font-medium">{formatVND(value)}</span>;

      case 'preparedQuantity':
        return (
          <span className={value === 0 ? 'text-outline italic' : 'font-semibold'}>
            {value === 0 ? 'Chưa cài' : value}
          </span>
        );

      case 'status':
        return (
          <StatusBadge
            status={statusMap[value] ?? 'pending'}
            label={value === 'Available' ? 'Còn phục vụ' : 'Hết / Ngừng'}
            size="sm"
          />
        );

      case 'actions':
        return (
          <div className="flex items-center gap-1">
            {/* Edit */}
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(row._raw); }}
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
              title="Chỉnh sửa"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
            {/* Price history */}
            <button
              onClick={(e) => { e.stopPropagation(); onViewHistory?.(row._raw); }}
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-tertiary/10 hover:text-tertiary transition-colors"
              title="Lịch sử giá"
            >
              <span className="material-symbols-outlined text-[20px]">history</span>
            </button>
            {/* Remove */}
            <button
              onClick={(e) => { e.stopPropagation(); onRemove?.(row._raw); }}
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors"
              title="Xóa khỏi thực đơn"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        );

      default:
        return String(value ?? '—');
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default DailyMenuTable;
