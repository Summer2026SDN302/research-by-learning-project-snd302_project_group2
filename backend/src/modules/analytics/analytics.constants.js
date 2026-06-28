export const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export const TIMEZONE = "Asia/Ho_Chi_Minh";

export const CHART_RANGE = {
  SEVEN_DAYS: "7d",
  THIRTY_DAYS: "30d",
  MONTH: "month",
};

export const CHART_RANGE_VALUES = Object.values(CHART_RANGE);

export const TREND_PERIOD = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
};

export const TREND_PERIOD_VALUES = Object.values(TREND_PERIOD);

export const TOP_FOODS_SORT = {
  QUANTITY: "quantity",
  REVENUE: "revenue",
};

export const TOP_FOODS_SORT_VALUES = Object.values(TOP_FOODS_SORT);

export const PAYMENT_STATUS = {
  PAID: "Paid",
  PENDING: "Pending",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUS);

export const PAYMENT_METHOD_VALUES = ["Cash", "Momo", "VNPay"];

export const ORDER_STATUS = {
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

export const EXPORT_MAX_ROWS = 10_000;
export const DEFAULT_TOP_FOODS_LIMIT = 5;
export const MAX_TOP_FOODS_LIMIT = 50;
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

export const WEEKDAY_LABELS_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export const REVENUE_SOURCE = {
  PAYMENT: "payment",
  ORDER: "order",
};
