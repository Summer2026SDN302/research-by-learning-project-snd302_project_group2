import { formatCurrency, formatShortId } from '../utils/foodItemUtils';

const SaleStatusBadge = ({ isArchived }) =>
  isArchived ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-variant text-on-surface-variant text-[10px] font-bold">
      Ngừng bán
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
      Đang bán
    </span>
  );

const FoodItemTable = ({
  items,
  isLoading,
  emptyMessage,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  onToggleArchive,
}) => (
  <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden relative">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-fixed-dim opacity-50" />

    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant">
            {['ID', 'Tên Món', 'Danh Mục', 'Giá Cơ Bản', 'Giá Vốn', 'Trạng Thái', 'Thao Tác'].map(
              (label, index) => (
                <th
                  key={label}
                  className={`py-3 px-4 text-label-md font-semibold text-on-surface-variant ${
                    index >= 3 && index <= 4 ? 'text-right' : ''
                  } ${index === 5 ? 'text-center' : ''} ${index === 6 ? 'text-right' : ''}`}
                >
                  {label}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="text-body-sm text-on-surface">
          {isLoading ? (
            <tr>
              <td colSpan={7} className="py-20 text-center">
                <span className="material-symbols-outlined animate-spin text-primary text-[36px]">
                  progress_activity
                </span>
                <p className="mt-3 text-on-surface-variant">Đang tải dữ liệu...</p>
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-20 text-center">
                <span className="material-symbols-outlined text-[40px] text-outline">inbox</span>
                <p className="mt-2 text-on-surface-variant">{emptyMessage}</p>
              </td>
            </tr>
          ) : (
            items.map((row) => {
              const muted = row.isArchived;
              return (
                <tr
                  key={row._id}
                  className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors group"
                >
                  <td className={`py-3 px-4 font-mono text-[11px] ${muted ? 'text-on-surface-variant' : 'text-on-surface-variant'}`}>
                    {formatShortId(row._id)}
                  </td>
                  <td className={`py-3 px-4 font-semibold ${muted ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                    {row.name}
                  </td>
                  <td className={`py-3 px-4 ${muted ? 'text-on-surface-variant' : ''}`}>
                    {row.categoryName ?? row.category?.name ?? '—'}
                  </td>
                  <td className={`py-3 px-4 text-right ${muted ? 'text-on-surface-variant' : ''}`}>
                    {formatCurrency(row.basePrice)}
                  </td>
                  <td className={`py-3 px-4 text-right ${muted ? 'text-on-surface-variant' : ''}`}>
                    {formatCurrency(row.cost)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <SaleStatusBadge isArchived={row.isArchived} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleArchive(row);
                        }}
                        className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                        title={row.isArchived ? 'Bật bán lại' : 'Ngừng bán'}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {row.isArchived ? 'toggle_off' : 'toggle_on'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(row);
                        }}
                        className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                        title="Sửa"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(row);
                        }}
                        className="p-1 text-on-surface-variant hover:text-error transition-colors"
                        title="Xóa"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>

    {pagination && onPageChange && (
      <FoodItemPagination pagination={pagination} onPageChange={onPageChange} />
    )}
  </div>
);

export default FoodItemTable;

const getPageNumbers = (page, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result = [];

  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('...');
    result.push(p);
  });

  return result;
};

export const FoodItemPagination = ({ pagination, onPageChange }) => {
  const { page, limit, total, totalPages } = pagination;
  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="border-t border-outline-variant p-4 bg-surface flex flex-col sm:flex-row items-center justify-between gap-3">
      <span className="text-body-sm text-on-surface-variant">
        Hiển thị {from}-{to} trên tổng số {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
        {pageNumbers.map((item, index) =>
          item === '...' ? (
            <span key={`ellipsis-${index}`} className="px-1 text-on-surface-variant">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`w-8 h-8 flex items-center justify-center rounded-md text-label-md font-semibold transition-colors ${
                item === page
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
};
