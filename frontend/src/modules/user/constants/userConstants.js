export const USER_ROLES = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  STAFF: "Staff",
};

export const USER_ROLE_OPTIONS = [
  { value: USER_ROLES.ADMIN, label: "Admin" },
  { value: USER_ROLES.MANAGER, label: "Manager" },
  { value: USER_ROLES.STAFF, label: "Staff" },
];

export const USER_STATUS_OPTIONS = [
  { value: "", label: "Trạng thái: Tất cả" },
  { value: "true", label: "Đang hoạt động" },
  { value: "false", label: "Tạm khóa" },
];

export const USER_ROLE_FILTER_OPTIONS = [
  { value: "", label: "Vai trò: Tất cả" },
  ...USER_ROLE_OPTIONS,
];

export const DEFAULT_USER_FORM = {
  username: "",
  password: "",
  fullName: "",
  email: "",
  phone: "",
  role: USER_ROLES.STAFF,
};

export const DEFAULT_RESET_PASSWORD_FORM = {
  newPassword: "",
  confirmPassword: "",
};

export const PROFILE_FORM_FIELDS = {
  fullName: "fullName",
  email: "email",
  phone: "phone",
};

export const USER_ERROR_MAP = {
  // Codes
  USERNAME_ALREADY_EXISTS: "Tên đăng nhập đã tồn tại.",
  EMAIL_ALREADY_EXISTS: "Email đã tồn tại.",
  PHONE_ALREADY_EXISTS: "Số điện thoại đã tồn tại.",
  USER_NOT_FOUND: "Không tìm thấy người dùng.",
  USER_INACTIVE: "Tài khoản đã bị vô hiệu hóa.",
  INVALID_ROLE: "Vai trò không hợp lệ.",
  INVALID_STATUS: "Trạng thái không hợp lệ.",
  CANNOT_DELETE_SELF: "Bạn không thể xóa chính tài khoản của mình.",
  CANNOT_DISABLE_SELF: "Bạn không thể vô hiệu hóa chính tài khoản của mình.",
  ADMIN_CANNOT_DISABLE_SELF: "Bạn không thể vô hiệu hóa chính tài khoản của mình.",
  USER_ALREADY_DISABLED: "Tài khoản này đã bị vô hiệu hóa từ trước.",
  SELF_PASSWORD_RESET_NOT_ALLOWED: "Bạn không thể đặt lại mật khẩu cho chính mình bằng tính năng này.",
  CANNOT_CHANGE_OWN_ROLE: "Bạn không thể thay đổi vai trò của chính mình.",
  PERMISSION_DENIED: "Bạn không có quyền thực hiện thao tác này.",
  VALIDATION_ERROR: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",

  // Fallback English messages
  "Username already exists": "Tên đăng nhập đã tồn tại.",
  "Email already exists": "Email đã tồn tại.",
  "Phone already exists": "Số điện thoại đã tồn tại.",
  "User not found": "Không tìm thấy người dùng.",
  "User is inactive": "Tài khoản đã bị vô hiệu hóa.",
  "Invalid role": "Vai trò không hợp lệ.",
  "Invalid status": "Trạng thái không hợp lệ.",
  "Cannot delete self": "Bạn không thể xóa chính tài khoản của mình.",
  "Cannot disable self": "Bạn không thể vô hiệu hóa chính tài khoản của mình.",
  "Admin cannot disable their own account": "Bạn không thể vô hiệu hóa chính tài khoản của mình.",
  "User is already disabled": "Tài khoản này đã bị vô hiệu hóa từ trước.",
  "Use change password endpoint to update your own password": "Vui lòng sử dụng chức năng đổi mật khẩu cá nhân.",
  "Cannot change own role": "Bạn không thể thay đổi vai trò của chính mình.",
  "Permission denied": "Bạn không có quyền thực hiện thao tác này.",
  "Validation error": "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
  "Current password is incorrect": "Mật khẩu hiện tại không chính xác.",
  "New password must be different from current password": "Mật khẩu mới phải khác mật khẩu hiện tại.",
};
