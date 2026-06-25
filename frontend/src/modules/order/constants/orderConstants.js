export const TAX_PERCENT = 0.08;

export const PAYMENT_METHOD = {
  CARD: "card",
  CASH: "cash",
};

export const ORDER_STATUS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

export const ORDER_ERROR_MAP = {
  DAILY_MENU_NOT_FOUND: "Thực đơn hôm nay chưa được tạo.",
  ITEM_NOT_IN_MENU: "Món ăn không có trong thực đơn hôm nay.",
  ITEM_UNAVAILABLE: "Món ăn đã hết.",
  INSUFFICIENT_QUANTITY: "Số lượng không đủ.",
  DUPLICATE_ITEM: "Món ăn bị trùng trong đơn hàng.",
  ORDER_NOT_FOUND: "Không tìm thấy đơn hàng.",
};

export const MENU_ITEM_STATUS = {
  AVAILABLE: "Available",
  UNAVAILABLE: "Unavailable",
};
