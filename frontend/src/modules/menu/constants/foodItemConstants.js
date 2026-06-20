export const DEFAULT_FOOD_ITEM_PAGE_SIZE = 10;

export const FOOD_ITEM_ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  FOODITEM_NOT_FOUND: 'Không tìm thấy món ăn',
  FOODITEM_NAME_EXISTS: 'Tên món ăn đã tồn tại',
  FOODITEM_IN_USE: 'Không thể ngừng bán món đang được sử dụng',
  CATEGORY_NOT_FOUND: 'Danh mục không tồn tại',
};

export const FOOD_ITEM_COLUMNS = [
  { key: "name", label: "Tên Món", sortable: true },
  { key: "category", label: "Danh Mục", sortable: false },
  { key: "basePrice", label: "Giá Bán", sortable: true },
  { key: "status", label: "Trạng Thái", sortable: false },
];