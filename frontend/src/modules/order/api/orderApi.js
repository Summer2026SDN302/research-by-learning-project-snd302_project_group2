import apiClient from "@/services/apiClient";

const BASE_PATH = "/orders";

const normalizeApiError = (error) => {
  if (error?.response?.data) {
    return formatApiError(error.response.data);
  }

  return {
    code: "NETWORK_ERROR",
    message: "Không thể kết nối server",
    details: [],
  };
};

const formatApiError = (responseData) => {
  const error = responseData?.error ?? {};
  return {
    code: error.code ?? "UNKNOWN_ERROR",
    message: responseData?.message ?? "Đã xảy ra lỗi",
    details: error.details ?? [],
  };
};

const unwrapResponse = (response) => {
  const payload = response.data;
  if (!payload?.success) {
    throw formatApiError(payload);
  }
  return payload.data;
};

/**
 * GET /api/orders — Lấy tất cả đơn hàng (Admin/Manager only)
 * BE route: authorizeRoles(...ORDER_READ_ALL_ROLES)
 */
export const getOrders = async (params = {}) => {
  try {
    const response = await apiClient.get(BASE_PATH, { params });
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

/**
 * GET /api/orders/my-orders — Lấy đơn hàng của chính mình (Staff/Manager)
 * BE route: authorizeRoles(...ORDER_MY_ORDERS_ROLES)
 * BE tự ép staffId = req.userId nên FE không cần gửi staffId
 */
export const getMyOrders = async (params = {}) => {
  try {
    const response = await apiClient.get(`${BASE_PATH}/my-orders`, { params });
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

/**
 * GET /api/orders/:id — Xem chi tiết 1 đơn
 * BE route: authorizeRoles(...ORDER_READ_ROLES) — Admin/Manager/Staff
 * Staff chỉ xem được order của chính mình
 */
export const getOrderById = async (id) => {
  try {
    const response = await apiClient.get(`${BASE_PATH}/${id}`);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

/**
 * POST /api/orders — Tạo đơn hàng mới
 * BE route: authorizeRoles(...ORDER_CREATE_ROLES) — Manager/Staff
 * Payload: { items: [{ foodItemId: string, quantity: number }] }
 * BE tự tính giá, thuế, tổng tiền từ daily menu
 */
export const createOrder = async (body) => {
  try {
    const response = await apiClient.post(BASE_PATH, body);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

/**
 * PATCH /api/orders/:id/status — Cập nhật trạng thái đơn hàng
 * BE route: authorizeRoles(...ORDER_STATUS_MANAGE_ROLES) — Admin/Manager
 * Payload: { orderStatus: "Confirmed" | "Completed" | "Cancelled" | "Returned" }
 * Transition rules: Pending→[Confirmed,Cancelled], Confirmed→[Completed,Returned]
 */
export const updateOrderStatus = async (id, orderStatus) => {
  try {
    const response = await apiClient.patch(`${BASE_PATH}/${id}/status`, { orderStatus });
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

// ============================================================================
// CÁC HÀM DƯỚI ĐÂY CHƯA CÓ ENDPOINT TƯƠNG ỨNG Ở BE (nhánh be-hoang).
// Sẽ được bật lại khi BE bổ sung các route này.
// ============================================================================

// /**
//  * [CHƯA CÓ BE] PATCH /api/orders/:id/items — Cập nhật danh sách món trong đơn
//  * BE chưa có route này. Cần bổ sung ở be-hoang trước khi dùng.
//  */
// export const updateOrderItems = async (id, body) => {
//   try {
//     const response = await apiClient.patch(`${BASE_PATH}/${id}/items`, body);
//     return unwrapResponse(response);
//   } catch (error) {
//     throw normalizeApiError(error);
//   }
// };

// /**
//  * [CHƯA CÓ BE] PATCH /api/orders/:id/recalculate — Tính lại giá đơn hàng
//  * BE chưa có route này. Cần bổ sung ở be-hoang trước khi dùng.
//  */
// export const recalculateOrder = async (id, body) => {
//   try {
//     const response = await apiClient.patch(`${BASE_PATH}/${id}/recalculate`, body);
//     return unwrapResponse(response);
//   } catch (error) {
//     throw normalizeApiError(error);
//   }
// };

// /**
//  * [CHƯA CÓ BE] PATCH /api/orders/:id/cancel — Hủy đơn hàng
//  * BE chưa có route cancel riêng. Hiện tại dùng updateOrderStatus(id, "Cancelled") thay thế.
//  */
// export const cancelOrder = async (id) => {
//   try {
//     const response = await apiClient.patch(`${BASE_PATH}/${id}/cancel`);
//     return unwrapResponse(response);
//   } catch (error) {
//     throw normalizeApiError(error);
//   }
// };
