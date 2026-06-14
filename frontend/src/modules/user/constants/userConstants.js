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
