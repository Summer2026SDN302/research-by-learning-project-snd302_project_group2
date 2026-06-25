import apiClient from "../../../services/apiClient";

/** POST /orders — Tạo đơn hàng mới */
export const createOrder = (payload) =>
  apiClient.post("/orders", payload).then((r) => r.data.data);

/** GET /orders/my-orders — Lấy đơn hàng của mình */
export const getMyOrders = (params) =>
  apiClient.get("/orders/my-orders", { params }).then((r) => r.data);

/** GET /orders/:id — Lấy chi tiết đơn hàng */
export const getOrderById = (id) =>
  apiClient.get(`/orders/${id}`).then((r) => r.data.data);
