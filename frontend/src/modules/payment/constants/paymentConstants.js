export const PAYMENT_METHODS_MAP = {
  Cash: "Tiền mặt",
  Card: "Thẻ ATM/Credit",
  QR: "Chuyển khoản QR",
};

export const BANK_CONFIG = {
  BANK_ID: "MB", // MB Bank
  ACCOUNT_NO: "9704229267151024", // Fake/Demo merchant account
  ACCOUNT_NAME: "STALLBOX CANTEEN",
};

export const PAYMENT_ERROR_MAP = {
  PAYMENT_NOT_FOUND: "Không tìm thấy thông tin giao dịch.",
  ORDER_NOT_FOUND: "Không tìm thấy đơn hàng tương ứng.",
  ORDER_ALREADY_PAID: "Đơn hàng này đã được thanh toán trước đó.",
  PAYMENT_IN_PROGRESS: "Đang có giao dịch thanh toán khác cho đơn hàng này.",
  PAYMENT_TRANSACTION_CODE_EXISTS: "Mã giao dịch đã tồn tại trên hệ thống.",
  INSUFFICIENT_CASH_RECEIVED: "Số tiền khách đưa không đủ để thanh toán.",
  INVALID_PAYMENT_STATUS_TRANSITION: "Trạng thái giao dịch không hợp lệ.",
  INSUFFICIENT_PERMISSIONS: "Bạn không có quyền thực hiện giao dịch này.",
  NETWORK_ERROR: "Lỗi kết nối mạng, vui lòng thử lại.",
};
