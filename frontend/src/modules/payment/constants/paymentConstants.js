export const PAYMENT_METHOD = {
  CASH: "Cash",
  QR: "QR",
};

export const PAYMENT_STATUS = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};
export const PAYMENT_METHOD_OPTIONS = [
  {
    value: "Cash",
    label: "Tiền mặt",
    description: "Thanh toán trực tiếp bằng tiền mặt",
    icon: "payments",
    tone: "bg-primary/10 text-primary",
    defaultProviderName: "",
  },
  {
    value: "QR",
    label: "QR Pay",
    description: "Thanh toán QR qua cổng PayOS",
    icon: "qr_code_2",
    tone: "bg-tertiary/10 text-tertiary",
    defaultProviderName: "PayOS",
  },
];

export const DEFAULT_PAYMENT_METHOD = PAYMENT_METHOD_OPTIONS[0].value;

const paymentMethodMetaMap = Object.fromEntries(
  PAYMENT_METHOD_OPTIONS.map((method) => [method.value, method]),
);

export const PAYMENT_METHODS_MAP = Object.fromEntries(
  PAYMENT_METHOD_OPTIONS.map((method) => [method.value, method.label]),
);

export const getPaymentMethodMeta = (method) =>
  paymentMethodMetaMap[method] ?? null;

export const getPaymentMethodLabel = (method) =>
  getPaymentMethodMeta(method)?.label ?? method;

export const getPaymentMethodIcon = (method) =>
  getPaymentMethodMeta(method)?.icon ?? "monetization_on";

export const getDefaultPaymentProviderName = (method) =>
  getPaymentMethodMeta(method)?.defaultProviderName ?? "";

export const PAYMENT_ERROR_MAP = {
  PAYMENT_NOT_FOUND: "Không tìm thấy thông tin giao dịch.",
  ORDER_NOT_FOUND: "Không tìm thấy đơn hàng tương ứng.",
  ORDER_ALREADY_PAID: "Đơn hàng này đã được thanh toán trước đó.",
  ORDER_NOT_PAYABLE: "Đơn hàng này không hợp lệ để thanh toán.",
  PAYMENT_IN_PROGRESS: "Đang có giao dịch thanh toán khác cho đơn hàng này.",
  PAYMENT_TRANSACTION_CODE_EXISTS: "Mã giao dịch đã tồn tại trên hệ thống.",
  DUPLICATE_FIELD: "Mã giao dịch đã tồn tại trên hệ thống.",
  INSUFFICIENT_CASH_RECEIVED: "Số tiền khách đưa không đủ để thanh toán.",
  INVALID_PAYMENT_STATUS_TRANSITION: "Trạng thái giao dịch không hợp lệ.",
  INSUFFICIENT_PERMISSIONS: "Bạn không có quyền thực hiện giao dịch này.",
  INSUFFICIENT_QUANTITY: "Một hoặc nhiều món trong đơn không còn đủ số lượng. Vui lòng cập nhật đơn hàng.",
  DAILY_MENU_NOT_FOUND: "Không tìm thấy thực đơn cho ngày đặt đơn. Vui lòng liên hệ quản lý.",
  NETWORK_ERROR: "Lỗi kết nối mạng, vui lòng thử lại.",
};

export const PAYMENT_RECEIPT_ERROR_MAP = {
  PAYMENT_NOT_FOUND: "Không tìm thấy biên lai thanh toán.",
  PAYMENT_RECEIPT_NOT_AVAILABLE: "Biên lai chỉ khả dụng cho giao dịch đã hoàn tất.",
  INSUFFICIENT_PERMISSIONS: "Bạn không có quyền xem biên lai này.",
  FORBIDDEN: "Bạn không có quyền truy cập biên lai này.",
  NETWORK_ERROR: "Lỗi kết nối mạng, vui lòng thử lại.",
};

export const PAYMENT_LIST_ERROR_MAP = {
  INSUFFICIENT_PERMISSIONS: "Bạn không có quyền xem danh sách thanh toán.",
  FORBIDDEN: "Truy cập bị từ chối.",
  NETWORK_ERROR: "Lỗi kết nối mạng, vui lòng thử lại.",
};


export const STATUS_FILTERS = [
  { value: "", label: "Tất cả" },
  { value: "Paid", label: "Thành công" },
  { value: "Pending", label: "Đang chờ" },
  { value: "Failed", label: "Thất bại" },
  { value: "Refunded", label: "Hoàn tiền" },
];

export const PAYMENT_STATUS_MAP = {
  Paid: {
    status: "paid",
    label: "Thành công",
  },
  Pending: {
    status: "pending",
    label: "Đang chờ",
  },
  Failed: {
    status: "cancelled",
    label: "Thất bại",
  },
  Refunded: {
    status: "archived",
    label: "Hoàn tiền",
  },
};

export const mapStatus = (status) =>
  PAYMENT_STATUS_MAP[status]?.status ?? "pending";

export const mapStatusLabel = (status) =>
  PAYMENT_STATUS_MAP[status]?.label ?? status;

export const KEYPAD_BUTTONS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "C",
  "0",
  ".000",
];

