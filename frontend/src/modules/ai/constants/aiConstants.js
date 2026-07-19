// ── API Error Messages ───────────────────────────────────────────────────────
export const AI_ERROR_MAP = {
  AI_INVALID_OUTPUT: "Dữ liệu nhận từ mô hình AI không hợp lệ.",
  AI_NO_FORECAST_DATA:
    "Không có lịch sử bán hàng phù hợp trong 90 ngày qua để AI thực hiện dự báo.",
  AI_PREDICTION_FAILED: "Lỗi thực thi quy trình dự báo của mô hình AI.",
  INSIGHT_NOT_FOUND:
    "Không tìm thấy dữ liệu phân tích/dự báo AI cho ngày được chọn.",
  DAILY_MENU_NOT_FOUND:
    "Thực đơn ngày chưa được tạo. Vui lòng tạo thực đơn ngày trước khi thực hiện dự báo.",
  DAILY_MENU_NOT_CONFIGURED:
    "Thực đơn ngày cho ngày đã chọn chưa được cấu hình hoặc chưa công bố.",
  OVERRIDE_FORBIDDEN:
    "Đề xuất đã được quyết định. Chỉ Admin mới có quyền ghi đè.",
  OVERRIDE_FORBIDDEN_SELF:
    "Bạn không thể tự ghi đè quyết định do chính mình đã thực hiện.",
  OVERRIDE_FORBIDDEN_NOT_MANAGER:
    "Bạn chỉ có thể ghi đè quyết định được thực hiện bởi Quản lý (Manager).",
  ITEM_REMOVED:
    "Không thể áp dụng đề xuất; món ăn này không còn trên thực đơn ngày.",
  INVALID_QUANTITY: "Số lượng đề xuất không hợp lệ (nhỏ hơn số lượng đã bán).",
  USER_NOT_FOUND: "Không tìm thấy người dùng thực hiện thao tác.",
  ITEM_SOLD_OUT: "Không thể áp dụng đề xuất; món ăn này đã được bán hết.",
};

// ── Shared AI Insight Status Map ─────────────────────────────────────────────
export const AI_STATUS_MAP = {
  Pending: { status: "pending", label: "Chờ xử lý" },
  Applied: { status: "completed", label: "Đã áp dụng" },
  Rejected: { status: "cancelled", label: "Đã từ chối" },
};

// ── Table Column Definitions ─────────────────────────────────────────────────
export const FORECAST_COLUMNS = [
  { key: "name", label: "Món ăn" },
  { key: "recommendedQuantity", label: "Lượng đề xuất", align: "right" },
  { key: "status", label: "Trạng thái", align: "center" },
];

export const PRICING_COLUMNS = [
  { key: "name", label: "Món ăn" },
  { key: "recommendedPrice", label: "Giá đề xuất", align: "right" },
  { key: "status", label: "Trạng thái", align: "center" },
];
