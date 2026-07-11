import {
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from "../../payment/constants/paymentConstants";

export const CHART_RANGE = {
  SEVEN_DAYS: { value: "7d", label: "7 Ngày Qua" },
  THIRTY_DAYS: { value: "30d", label: "30 Ngày Qua" },
  MONTH: { value: "month", label: "Tháng Này" },
};

export const REPORT_STATUS_FILTERS = [
  { value: "", label: "Tất cả" },
  { value: PAYMENT_STATUS.PAID, label: "Thành công" },
  { value: PAYMENT_STATUS.PENDING, label: "Chờ xử lý" },
  { value: PAYMENT_STATUS.FAILED, label: "Thất bại" },
  { value: PAYMENT_STATUS.REFUNDED, label: "Hoàn tiền" },
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: PAYMENT_METHOD.CASH, label: "Tiền mặt" },
  { value: PAYMENT_METHOD.QR, label: "Chuyển khoản QR" },
];

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHOD.CASH]: "Tiền mặt",
  [PAYMENT_METHOD.QR]: "Chuyển khoản QR",
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PAID]: "Thành công",
  [PAYMENT_STATUS.PENDING]: "Chờ xử lý",
  [PAYMENT_STATUS.FAILED]: "Thất bại",
  [PAYMENT_STATUS.REFUNDED]: "Hoàn tiền",
};

export const PAYMENT_STATUS_BADGE = {
  [PAYMENT_STATUS.PAID]: "paid",
  [PAYMENT_STATUS.PENDING]: "pending",
  [PAYMENT_STATUS.FAILED]: "cancelled",
  [PAYMENT_STATUS.REFUNDED]: "cancelled",
};

export const DATE_PRESETS = {
  TODAY: "today",
  LAST_7_DAYS: "7d",
  THIS_MONTH: "month",
};

export const DATE_PRESET_OPTIONS = [
  { value: DATE_PRESETS.TODAY, label: "Hôm nay" },
  { value: DATE_PRESETS.LAST_7_DAYS, label: "7 ngày qua" },
  { value: DATE_PRESETS.THIS_MONTH, label: "Tháng này" },
];

export const DASHBOARD_POLL_INTERVAL_MS = 60_000;
export const REPORT_PAGE_SIZE = 20;
export const SEARCH_DEBOUNCE_MS = 300;

export const ANALYTICS_ERROR_MAP = {
  VALIDATION_ERROR: "Khoảng thời gian không hợp lệ. Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.",
  EXPORT_TOO_LARGE: "Dữ liệu xuất báo cáo quá lớn, vui lòng lọc giới hạn lại.",
};

