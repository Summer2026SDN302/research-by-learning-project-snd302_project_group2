import { USER_ROLES } from "../../user/user.constants.js";

export const CATEGORY_ALLOWED_ROLES = [USER_ROLES.ADMIN, USER_ROLES.MANAGER];

/** Đồng bộ với frontend/src/modules/menu/constants/categoryConstants.js */
export const ALLOWED_ICONS = [
  "rice_bowl",
  "ramen_dining",
  "soup_kitchen",
  "eco",
  "bakery_dining",
  "local_cafe",
  "coffee",
  "icecream",
  "cookie",
  "set_meal",
  "restaurant_menu",
  // legacy — danh mục đã tạo trước khi đổi icon
  "local_dining",
  "local_bar",
  "restaurant",
  "breakfast_dining",
  "lunch_dining",
  "outdoor_grill",
  "cake",
];
