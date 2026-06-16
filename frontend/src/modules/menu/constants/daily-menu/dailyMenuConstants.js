// ── API Error Messages ───────────────────────────────────────────────────────
export const DAILY_MENU_ERROR_MAP = {
  DAILY_MENU_NOT_FOUND: 'Không tìm thấy thực đơn ngày.',
  DAILY_MENU_ALREADY_EXISTS: 'Thực đơn cho ngày này đã tồn tại.',
  SCHEDULED_MENU_NOT_FOUND: 'Không tìm thấy lịch thực đơn cho ngày này. Vui lòng tạo lịch thực đơn trước.',
  SCHEDULED_MENU_EMPTY: 'Lịch thực đơn cho ngày này không chứa món ăn nào hoạt động. Vui lòng thêm món ăn vào lịch thực đơn trước.',
  CATEGORY_NOT_FOUND: 'Không tìm thấy danh mục.',
  FOOD_ITEM_NOT_FOUND: 'Không tìm thấy món ăn.',
  FOOD_ITEM_NAME_EXISTS: 'Tên món ăn đã tồn tại.',
};

// ── Status ──────────────────────────────────────────────────────────────────
export const DAILY_MENU_ITEM_STATUS = {
  AVAILABLE: 'Available',
  UNAVAILABLE: 'Unavailable',
};

export const DAILY_MENU_ITEM_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: DAILY_MENU_ITEM_STATUS.AVAILABLE, label: 'Còn phục vụ' },
  { value: DAILY_MENU_ITEM_STATUS.UNAVAILABLE, label: 'Hết / Ngừng' },
];

// ── Price Source ─────────────────────────────────────────────────────────────
export const PRICE_SOURCE = {
  AI: 'AI',
  MANUAL: 'MANUAL',
};

// ── Pagination ───────────────────────────────────────────────────────────────
export const DAILY_MENU_PAGE_SIZE = 10;

// ── Table Columns ────────────────────────────────────────────────────────────
export const DAILY_MENU_TABLE_COLUMNS = [
  { key: 'name',             label: 'Tên món',        sortable: true  },
  { key: 'category',         label: 'Danh mục',       sortable: true  },
  { key: 'originalPrice',    label: 'Giá gốc',        sortable: true  },
  { key: 'currentPrice',     label: 'Giá hôm nay',    sortable: true  },
  { key: 'preparedQuantity', label: 'SL chuẩn bị',    sortable: true  },
  { key: 'soldQuantity',     label: 'Đã bán',          sortable: false },
  { key: 'remainingQuantity',label: 'Còn lại',         sortable: false },
  { key: 'status',           label: 'Trạng thái',     sortable: false },
  { key: 'actions',          label: '',               sortable: false },
];
