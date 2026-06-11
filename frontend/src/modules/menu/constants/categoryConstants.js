/** Icon hợp lệ — đồng bộ với BE ALLOWED_ICONS */
export const CATEGORY_ICONS = [
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
  "local_dining",
  "local_bar",
  "restaurant",
  "breakfast_dining",
  "lunch_dining",
  "outdoor_grill",
  "cake",
];

/** [tên danh mục, icon] — loại món (hướng 2) */
export const CATEGORY_PRESETS = [
  ["Cơm", "rice_bowl"],
  ["Phở – Bún – Mì", "ramen_dining"],
  ["Canh", "soup_kitchen"],
  ["Món kèm", "eco"],
  ["Bánh mì, xôi & cháo", "bakery_dining"],
  ["Đồ uống", "local_cafe"],
  ["Cà phê & Trà sữa", "coffee"],
  ["Chè & Tráng miệng", "icecream"],
  ["Ăn vặt", "cookie"],
  ["Suất combo", "set_meal"],
  ["Khác", "restaurant_menu"],
];

export const DEFAULT_CATEGORY_ICON = "rice_bowl";

export const DEFAULT_PAGE_SIZE = 10;

export const CATEGORY_ERROR_MESSAGES = {
  VALIDATION_ERROR: "Dữ liệu không hợp lệ",
  CATEGORY_NOT_FOUND: "Không tìm thấy danh mục",
  CATEGORY_NAME_EXISTS: "Tên danh mục đã tồn tại",
  CATEGORY_HAS_FOOD_ITEMS:
    "Không thể xóa danh mục đang có món ăn. Vui lòng chuyển hoặc xóa các món trước.",
};
