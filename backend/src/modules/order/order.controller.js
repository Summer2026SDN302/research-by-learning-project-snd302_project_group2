import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/response/responseFormatter.js";
import orderService from "./order.service.js";

export const getOrders = asyncHandler(async (req, res) => {
  // Fix: Tách riêng getOrders (All Orders) và getMyOrders (My Orders).
  // API này được dùng cho Admin/Manager để lấy toàn bộ đơn hàng trong hệ thống.
  // Nếu họ muốn filter theo staff cụ thể, họ sẽ tự pass staffId vào query.
  const data = await orderService.getOrders(req.query);
  return successResponse(res, data, "Orders retrieved successfully");
});

export const getMyOrders = asyncHandler(async (req, res) => {
  // Ép buộc staffId trong query phải là ID của user đang đăng nhập.
  // Đảm bảo Manager và Staff chỉ thấy đơn hàng của chính họ ở route này.
  const data = await orderService.getOrders({
    ...req.query,
    staffId: req.userId,
  });
  return successResponse(res, data, "My orders retrieved successfully");
});

export const getOrderById = asyncHandler(async (req, res) => {
  const data = await orderService.getOrderById(req.params.id, req.userId, req.user.role);
  return successResponse(res, data, "Order retrieved successfully");
});

export const createOrder = asyncHandler(async (req, res) => {
  const data = await orderService.createOrder(req.body, req.userId);
  return successResponse(res, data, "Order created successfully", 201);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  // Fix #4: bỏ role — kiểm soát role đã được xử lý ở middleware authorize()
  const data = await orderService.updateOrderStatus(
    req.params.id,
    req.body.orderStatus,
  );
  return successResponse(res, data, "Order status updated successfully");
});
