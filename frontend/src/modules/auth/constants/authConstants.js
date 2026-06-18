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