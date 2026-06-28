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
    label: "Tien mat",
    description: "Thanh toan truc tiep bang tien mat",
    icon: "payments",
    tone: "bg-primary/10 text-primary",
    defaultProviderName: "",
  },
  {
    value: "Card",
    label: "The ATM/Credit",
    description: "Visa, Mastercard, Napas noi dia",
    icon: "credit_card",
    tone: "bg-secondary/10 text-secondary",
    defaultProviderName: "Napas",
  },
  {
    value: "QR",
    label: "Chuyen khoan QR",
    description: "Quet ma VietQR chuyen khoan nhanh",
    icon: "qr_code_2",
    tone: "bg-tertiary/10 text-tertiary",
    defaultProviderName: "VietQR",
  },
];

export const DEFAULT_PAYMENT_METHOD = PAYMENT_METHOD_OPTIONS[0].value;

export const CARD_PROVIDER_OPTIONS = [
  { value: "Napas", label: "Napas Noi Dia" },
  { value: "Visa", label: "Visa Card" },
  { value: "Mastercard", label: "Mastercard" },
  { value: "JCB", label: "JCB Card" },
];

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
  PAYMENT_NOT_FOUND: "Khong tim thay thong tin giao dich.",
  ORDER_NOT_FOUND: "Khong tim thay don hang tuong ung.",
  ORDER_ALREADY_PAID: "Don hang nay da duoc thanh toan truoc do.",
  ORDER_NOT_PAYABLE: "Don hang nay khong hop le de thanh toan.",
  PAYMENT_IN_PROGRESS: "Dang co giao dich thanh toan khac cho don hang nay.",
  PAYMENT_TRANSACTION_CODE_EXISTS: "Ma giao dich da ton tai tren he thong.",
  DUPLICATE_FIELD: "Ma giao dich da ton tai tren he thong.",
  INSUFFICIENT_CASH_RECEIVED: "So tien khach dua khong du de thanh toan.",
  INVALID_PAYMENT_STATUS_TRANSITION: "Trang thai giao dich khong hop le.",
  INSUFFICIENT_PERMISSIONS: "Ban khong co quyen thuc hien giao dich nay.",
  NETWORK_ERROR: "Loi ket noi mang, vui long thu lai.",
};
