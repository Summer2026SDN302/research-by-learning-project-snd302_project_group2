export const BACKEND_ROLES = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  STAFF: "Staff",
};

export const NAV_ROLE_BY_BACKEND_ROLE = {
  [BACKEND_ROLES.ADMIN]: "admin",
  [BACKEND_ROLES.MANAGER]: "manager",
  [BACKEND_ROLES.STAFF]: "staff",
};

export const ROLE_HOME_PATH = {
  [BACKEND_ROLES.ADMIN]: "/admin/dashboard",
  [BACKEND_ROLES.MANAGER]: "/manager/dashboard",
  [BACKEND_ROLES.STAFF]: "/staff/dashboard",
};

export const getRoleHomePath = (role) => {
  return ROLE_HOME_PATH[role] || "/login";
};

export const getNavRole = (role) => {
  return NAV_ROLE_BY_BACKEND_ROLE[role] || "staff";
};

export const AUTH_ERROR_MAP = {
  // Codes
  SESSION_EXPIRED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  TOKEN_EXPIRED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  UNAUTHORIZED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  INVALID_TOKEN: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
  INVALID_CREDENTIALS: "Tên đăng nhập hoặc mật khẩu không đúng.",
  USER_NOT_FOUND: "Tên đăng nhập hoặc mật khẩu không đúng.",
  WRONG_PASSWORD: "Tên đăng nhập hoặc mật khẩu không đúng.",
  ACCOUNT_INACTIVE: "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.",
  ACCOUNT_LOCKED: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.",
  ACCOUNT_DISABLED: "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.",
  VALIDATION_ERROR: "Thông tin đăng nhập không hợp lệ.",
  ACCESS_TOKEN_EXPIRED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  REFRESH_TOKEN_REQUIRED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  INVALID_REFRESH_TOKEN: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
  REFRESH_TOKEN_REVOKED: "Phiên đăng nhập đã bị thu hồi. Vui lòng đăng nhập lại.",

  // Fallback English messages
  "Session expired": "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  "Token expired": "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  "Unauthorized": "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  "Invalid token": "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
  "Invalid credentials": "Tên đăng nhập hoặc mật khẩu không đúng.",
  "User not found": "Tên đăng nhập hoặc mật khẩu không đúng.",
  "Wrong password": "Tên đăng nhập hoặc mật khẩu không đúng.",
  "Account is inactive": "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.",
  "Account is locked": "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.",
  "Account is disabled": "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.",
  "User account is disabled": "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.",
  "Validation error": "Thông tin đăng nhập không hợp lệ.",
  "Network Error": "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng rồi thử lại.",
};