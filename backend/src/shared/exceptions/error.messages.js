export const ERROR_MESSAGES = {
  APP_ERROR: "An error occurred",
  VALIDATION_ERROR: "Validation failed",
  AUTHENTICATION_REQUIRED: "Authentication required",
  INSUFFICIENT_PERMISSIONS: "You do not have permission to perform this action",
  INVALID_ACCESS_TOKEN: "Invalid access token",
  ACCESS_TOKEN_EXPIRED: "Access token expired",
  INVALID_CREDENTIALS: "Invalid credentials",
  ACCOUNT_DISABLED: "User account is disabled",
  USER_NOT_FOUND: "User not found",
  REFRESH_TOKEN_REQUIRED: "Refresh token is required",
  INVALID_REFRESH_TOKEN: "Invalid or expired refresh token",
  REFRESH_TOKEN_REVOKED: "Refresh token has been revoked",
  SERVER_CONFIGURATION_ERROR: "Server configuration error",
  USERNAME_EXISTS: "Username already exists",
  EMAIL_EXISTS: "Email already exists",
  CURRENT_PASSWORD_INCORRECT: "Current password is incorrect",
  PASSWORD_MUST_DIFFER: "New password must be different from current password",
  ADMIN_CANNOT_DISABLE_SELF: "Admin cannot disable their own account",
  USER_ALREADY_DISABLED: "User is already disabled",
  SELF_PASSWORD_RESET_NOT_ALLOWED: "Use change password endpoint to update your own password",
  CATEGORY_NOT_FOUND: "Category not found",
  CATEGORY_NAME_EXISTS: "Category name already exists",
  CATEGORY_HAS_FOOD_ITEMS: "Cannot delete category with active food items",
  FOODITEM_NOT_FOUND: "Food item not found",
  FOODITEM_IN_USE: "Cannot delete food item that is referenced in menus or orders",
};

export const resolveErrorMessage = (code, details = []) => {
  if (code === "VALIDATION_ERROR" && details.length > 0) {
    return details.map((item) => item.message).join("; ");
  }

  return ERROR_MESSAGES[code] || code;
};
