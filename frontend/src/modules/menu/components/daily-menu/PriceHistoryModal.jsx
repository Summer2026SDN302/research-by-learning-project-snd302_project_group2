import { createPortal } from 'react-dom';
import dayjs from 'dayjs';
import { PRICE_SOURCE } from '../../constants/daily-menu/dailyMenuConstants';
import { formatVND } from '../../../../utils/formatters';
const formatDate = (d) => (d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '—');

const sourceLabel = (s) => (s === PRICE_SOURCE.AI ? 'AI' : 'Thủ công');
const sourceBadge = (s) =>
  s === PRICE_SOURCE.AI
    ? 'bg-primary/10 text-primary border-primary/20'
    : 'bg-tertiary-container/20 text-tertiary border-tertiary/20';

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
  if (!open || !item) return null;

  const history = item.priceHistory ?? [];
  const foodName = item.foodItemId?.name ?? 'Món ăn';

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-elevated p-6 w-full max-w-2xl mx-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-tertiary-container/20 text-tertiary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">history</span>
          </div>
          <div>
            <h3 className="text-headline-sm font-bold text-on-surface">Lịch sử thay đổi giá</h3>
            <p className="text-body-sm text-on-surface-variant">{foodName}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Current price chip */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-label-md text-on-surface-variant">Giá hiện tại:</span>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-body-sm">
            {formatVND(item.currentPrice)}
          </span>
          <span className="text-label-md text-on-surface-variant ml-2">Giá gốc:</span>
          <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-body-sm">
            {formatVND(item.originalPrice)}
          </span>
        </div>

        {/* Table */}
        {history.length === 0 ? (
          <div className="text-center py-10">
            <span className="material-symbols-outlined text-[48px] text-outline/50 mb-3 block">
              price_check
            </span>
            <p className="text-body-sm text-on-surface-variant">Chưa có thay đổi giá nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-outline-variant">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container border-b border-outline-variant">
                <tr>
                  <th className="px-4 py-3 text-label-md text-on-surface-variant">#</th>
                  <th className="px-4 py-3 text-label-md text-on-surface-variant">Thời gian</th>
                  <th className="px-4 py-3 text-label-md text-on-surface-variant">Giá cũ</th>
                  <th className="px-4 py-3 text-label-md text-on-surface-variant">Giá mới</th>
                  <th className="px-4 py-3 text-label-md text-on-surface-variant">Nguồn</th>
                  <th className="px-4 py-3 text-label-md text-on-surface-variant">Lý do</th>
                  {isAdmin && (
                    <th className="px-4 py-3 text-label-md text-on-surface-variant">Người thay đổi</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map((entry, idx) => {
                  const diff = (entry.newValue ?? 0) - (entry.oldValue ?? 0);
                  const diffColor = diff > 0 ? 'text-error' : diff < 0 ? 'text-secondary' : '';
                  const diffSign = diff > 0 ? '+' : '';

                  return (
                    <tr
                      key={idx}
                      className="border-b border-outline-variant/50 hover:bg-surface-container/40 transition-colors"
                    >
                      <td className="px-4 py-3 text-body-sm text-on-surface-variant">
                        {history.length - idx}
                      </td>
                      <td className="px-4 py-3 text-body-sm text-on-surface">
                        {formatDate(entry.changedAt)}
                      </td>
                      <td className="px-4 py-3 text-body-sm text-on-surface">
                        {formatVND(entry.oldValue)}
                      </td>
                      <td className="px-4 py-3 text-body-sm font-semibold text-on-surface">
                        {formatVND(entry.newValue)}
                        <span className={`ml-1.5 text-[11px] ${diffColor}`}>
                          ({diffSign}{formatVND(diff)})
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sourceBadge(entry.source)}`}
                        >
                          {entry.source === PRICE_SOURCE.AI && (
                            <span className="material-symbols-outlined text-[12px] mr-0.5">
                              auto_awesome
                            </span>
                          )}
                          {sourceLabel(entry.source)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-body-sm text-on-surface-variant max-w-[160px] truncate">
                        {entry.reason || '—'}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-body-sm text-on-surface-variant">
                          {entry.changedBy?.fullName || entry.changedBy?.username || entry.changedBy || '—'}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default PriceHistoryModal;
