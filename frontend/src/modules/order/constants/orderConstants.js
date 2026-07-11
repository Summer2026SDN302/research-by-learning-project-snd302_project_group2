export const ORDER_STATUS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};
export const ORDER_ERROR_MAP = {
  ORDER_NUMBER_CONFLICT: "Không thể tạo mã đơn hàng duy nhất sau nhiều lần thử. Vui lòng thử lại.",
  ORDER_NOT_FOUND: "Không tìm thấy đơn hàng.",
  ORDER_NOT_PENDING: "Chỉ có thể cập nhật món ăn cho đơn hàng đang ở trạng thái Chờ (Pending).",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  DUPLICATE_ITEM: "Có món ăn bị trùng trong giỏ hàng.",
  DAILY_MENU_NOT_FOUND: "Thực đơn hôm nay chưa được thiết lập hoặc chưa được cấu hình.",
  ITEM_NOT_IN_MENU: "Món ăn chọn không nằm trong thực đơn hôm nay.",
  ITEM_UNAVAILABLE: "Món ăn hiện tại không khả dụng hoặc đã ngừng phục vụ.",
  INSUFFICIENT_QUANTITY: "Số lượng món ăn còn lại không đủ để đáp ứng.",
  INVALID_STATUS_TRANSITION: "Trạng thái đơn hàng chuyển đổi không hợp lệ.",
};

export const ORDER_STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "Pending", label: "Đang chờ" },
  { value: "Completed", label: "Hoàn thành" },
  { value: "Cancelled", label: "Đã hủy" },
  { value: "Returned", label: "Đã trả lại" },
];

export const ORDER_TABLE_COLUMNS = [
  { key: "orderNumber", label: "Mã Đơn" },
  { key: "createdAt", label: "Thời Gian", sortable: true },
  { key: "staffName", label: "Người Tạo" },
  { key: "totalAmount", label: "Tổng Tiền", align: "right" },
  { key: "orderStatus", label: "Trạng Thái" },
  { key: "actions", label: "Thao Tác" },
];

export const OWN_ORDER_TABLE_COLUMNS = [
  { key: "orderNumber", label: "Mã Đơn" },
  { key: "createdAt", label: "Thời Gian" },
  { key: "totalAmount", label: "Tổng Tiền" },
  { key: "orderStatus", label: "Trạng Thái Đơn" },
  { key: "actions", label: "Hành động" },
];

export const ORDER_DETAIL_TABLE_COLUMNS = [
  { key: "name", label: "Tên món" },
  { key: "quantity", label: "SL" },
  { key: "unitPrice", label: "Đơn giá" },
  { key: "lineTotal", label: "Thành tiền" },
];

export const ORDER_STATUS_MAP = {
  Pending: { statusKey: "pending", label: "Đang chờ" },
  Completed: { statusKey: "completed", label: "Hoàn thành" },
  Cancelled: { statusKey: "cancelled", label: "Đã hủy" },
  Returned: { statusKey: "returned", label: "Đã trả lại" },
};

