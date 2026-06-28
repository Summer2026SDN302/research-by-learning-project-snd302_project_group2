export const CHART_RANGE = {
  SEVEN_DAYS: { value: "7d", label: "7 Ngày Qua" },
  MONTH: { value: "month", label: "Tháng Này" },
};

export const REPORT_STATUS_FILTERS = [
  { value: "", label: "Tất cả" },
  { value: "Paid", label: "Thành công" },
  { value: "Pending", label: "Chờ xử lý" },
  { value: "Failed", label: "Thất bại" },
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "Cash", label: "Tiền mặt" },
  { value: "Momo", label: "Momo" },
  { value: "VNPay", label: "VNPay" },
];

export const PAYMENT_METHOD_LABELS = {
  Cash: "Tiền mặt",
  Momo: "Momo",
  VNPay: "VNPay",
};

export const PAYMENT_STATUS_LABELS = {
  Paid: "Thành công",
  Pending: "Chờ xử lý",
  Failed: "Thất bại",
  Refunded: "Hoàn tiền",
};

export const PAYMENT_STATUS_BADGE = {
  Paid: "paid",
  Pending: "pending",
  Failed: "cancelled",
  Refunded: "cancelled",
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
