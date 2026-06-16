const CODE_MESSAGE_MAP = {
  INVALID_CREDENTIALS: "Tên đăng nhập hoặc mật khẩu chưa đúng.",
  ACCOUNT_DISABLED: "Tài khoản này đang bị tạm khóa. Vui lòng liên hệ quản trị viên.",
  USER_NOT_FOUND: "Không tìm thấy tài khoản phù hợp.",
  REFRESH_TOKEN_REQUIRED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  INVALID_REFRESH_TOKEN: "Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.",
  REFRESH_TOKEN_REVOKED: "Phiên đăng nhập đã bị thu hồi. Vui lòng đăng nhập lại.",
  INVALID_OR_EXPIRED_RESET_TOKEN:
    "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng gửi yêu cầu mới.",
  INVALID_OR_EXPIRED_RESET_OTP:
    "Mã OTP không đúng hoặc đã hết hạn. Vui lòng kiểm tra lại hoặc gửi mã mới.",
  RESET_OTP_ATTEMPTS_EXCEEDED:
    "Mã OTP đã nhập sai quá nhiều lần. Vui lòng gửi lại mã mới.",
  SAME_PASSWORD_NOT_ALLOWED: "Mật khẩu mới cần khác mật khẩu hiện tại.",
  VALIDATION_ERROR: "Thông tin nhập chưa hợp lệ. Vui lòng kiểm tra lại.",
  SERVER_CONFIGURATION_ERROR:
    "Máy chủ chưa được cấu hình đầy đủ. Vui lòng báo quản trị viên kiểm tra.",
  EMAIL_CONFIGURATION_ERROR:
    "Máy chủ chưa cấu hình gửi email. Vui lòng báo quản trị viên kiểm tra.",
};

const MESSAGE_TRANSLATION_MAP = [
  [/invalid credentials/i, "Tên đăng nhập hoặc mật khẩu chưa đúng."],
  [
    /account is disabled|account disabled|user account is disabled/i,
    "Tài khoản này đang bị tạm khóa. Vui lòng liên hệ quản trị viên.",
  ],
  [/user not found/i, "Không tìm thấy tài khoản phù hợp."],
  [
    /invalid or expired reset token/i,
    "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng gửi yêu cầu mới.",
  ],
  [
    /invalid or expired otp|invalid or expired reset otp/i,
    "Mã OTP không đúng hoặc đã hết hạn. Vui lòng kiểm tra lại hoặc gửi mã mới.",
  ],
  [
    /otp.*too many|too many times|attempts exceeded/i,
    "Mã OTP đã nhập sai quá nhiều lần. Vui lòng gửi lại mã mới.",
  ],
  [/new password must be different/i, "Mật khẩu mới cần khác mật khẩu hiện tại."],
  [/password reset successfully/i, "Đặt lại mật khẩu thành công."],
  [/refresh token/i, "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."],
  [/network error/i, "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng rồi thử lại."],
  [/timeout/i, "Kết nối quá lâu. Vui lòng thử lại sau."],
  [
    /server configuration/i,
    "Máy chủ chưa được cấu hình đầy đủ. Vui lòng báo quản trị viên kiểm tra.",
  ],
  [
    /missing .*environment variables?/i,
    "Máy chủ thiếu cấu hình cần thiết. Vui lòng báo quản trị viên kiểm tra.",
  ],
];

const translateMessage = (message) => {
  if (!message) return "";

  const matched = MESSAGE_TRANSLATION_MAP.find(([pattern]) =>
    pattern.test(message),
  );

  return matched ? matched[1] : message;
};

export const getApiErrorMessage = (
  error,
  fallback = "Có lỗi xảy ra. Vui lòng thử lại sau.",
) => {
  if (!error?.response) {
    return error?.message
      ? translateMessage(error.message)
      : "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng rồi thử lại.";
  }

  const status = error.response.status;
  const errorCode = error.response.data?.error?.code;
  const serverMessage = error.response.data?.message;

  if (errorCode && CODE_MESSAGE_MAP[errorCode]) {
    return CODE_MESSAGE_MAP[errorCode];
  }

  if (serverMessage) {
    return translateMessage(serverMessage);
  }

  if (status === 400) return "Thông tin nhập chưa hợp lệ. Vui lòng kiểm tra lại.";
  if (status === 401) return "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.";
  if (status === 403) return "Bạn không có quyền thực hiện thao tác này.";
  if (status === 404) return "Không tìm thấy dữ liệu yêu cầu.";
  if (status >= 500) return "Máy chủ đang gặp lỗi. Vui lòng thử lại sau.";

  return fallback;
};