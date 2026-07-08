const envBankId = import.meta.env.VITE_VIETQR_BANK_ID?.trim();
const envAccountNo = import.meta.env.VITE_VIETQR_ACCOUNT_NO?.trim();
const envAccountName = import.meta.env.VITE_VIETQR_ACCOUNT_NAME?.trim();
const envTemplate = import.meta.env.VITE_VIETQR_TEMPLATE?.trim();

const demoBankConfig = {
  bankId: "MB",
  accountNo: "9704229267151024",
  accountName: "STALLBOX CANTEEN",
  template: "qr_only",
};

export const VIET_QR_CONFIG = {
  bankId: envBankId || demoBankConfig.bankId,
  accountNo: envAccountNo || demoBankConfig.accountNo,
  accountName: envAccountName || demoBankConfig.accountName,
  template: envTemplate || demoBankConfig.template,
  isConfigured: Boolean(envBankId && envAccountNo && envAccountName),
  isUsingDemoConfig: !(envBankId && envAccountNo && envAccountName),
};

export const buildVietQrImageUrl = ({ amount, addInfo }) => {
  const { bankId, accountNo, template } = VIET_QR_CONFIG;

  if (!bankId || !accountNo) {
    return null;
  }

  const params = new URLSearchParams();

  if (amount != null) {
    params.set("amount", String(amount));
  }

  if (addInfo) {
    params.set("addInfo", addInfo);
  }

  return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?${params.toString()}`;
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
    description: "Quét mã VietQR chuyển khoản nhanh",
    icon: "qr_code_2",
    tone: "bg-tertiary/10 text-tertiary",
    defaultProviderName: "VietQR",
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
