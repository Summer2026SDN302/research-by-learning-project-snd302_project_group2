// ── API Error Messages ───────────────────────────────────────────────────────
export const DAILY_MENU_ERROR_MAP = {
  DAILY_MENU_NOT_FOUND: "Không tìm thấy thực đơn ngày.",
  DAILY_MENU_ALREADY_EXISTS: "Thực đơn cho ngày này đã tồn tại.",
  SCHEDULED_MENU_NOT_FOUND:
    "Không tìm thấy lịch thực đơn cho ngày này. Vui lòng tạo lịch thực đơn trước.",
  SCHEDULED_MENU_EMPTY:
    "Lịch thực đơn cho ngày này không chứa món ăn nào hoạt động. Vui lòng thêm món ăn vào lịch thực đơn trước.",
  CATEGORY_NOT_FOUND: "Không tìm thấy danh mục.",
  FOOD_ITEM_NOT_FOUND: "Không tìm thấy món ăn.",
  FOOD_ITEM_NAME_EXISTS: "Tên món ăn đã tồn tại.",
  DAILY_MENU_ALREADY_PUBLISHED: "Thực đơn cho ngày đã chọn đã được công bố.",
};

// ── Status ──────────────────────────────────────────────────────────────────
export const DAILY_MENU_ITEM_STATUS = {
  AVAILABLE: "Available",
  UNAVAILABLE: "Unavailable",
};

export const DAILY_MENU_ITEM_STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: DAILY_MENU_ITEM_STATUS.AVAILABLE, label: "Sẵn sàng" },
  { value: DAILY_MENU_ITEM_STATUS.UNAVAILABLE, label: "Ngừng" },
];

// ── Price Source ─────────────────────────────────────────────────────────────
export const PRICE_SOURCE = {
  AI: "AI",
  MANUAL: "MANUAL",
};

// ── Pagination ───────────────────────────────────────────────────────────────
export const DAILY_MENU_PAGE_SIZE = 10;

// ── Table Columns ────────────────────────────────────────────────────────────
export const DAILY_MENU_TABLE_COLUMNS = [
  { key: "name", label: "Tên món", sortable: true },
  { key: "category", label: "Danh mục", sortable: true },
  { key: "originalPrice", label: "Giá gốc", sortable: true },
  { key: "currentPrice", label: "Giá hiện tại", sortable: true },
  { key: "preparedQuantity", label: "SL chuẩn bị", sortable: true },
  { key: "soldQuantity", label: "Đã bán", sortable: false },
  { key: "remainingQuantity", label: "Còn lại", sortable: false },
  { key: "status", label: "Trạng thái", sortable: false },
  { key: "actions", label: "", sortable: false },
];

export const HISTORY_COLUMNS = [
  { key: "changedAt", label: "Thời gian" },
  { key: "oldValue", label: "Giá cũ" },
  { key: "newValue", label: "Giá mới" },
  { key: "source", label: "Nguồn" },
  { key: "reason", label: "Lý do" },
  { key: "changedBy", label: "Người thay đổi" },
];
