import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/response/responseFormatter.js";
import orderService from "./order.service.js";

export const getOrders = asyncHandler(async (req, res) => {
  const data = await orderService.getOrders(req.query);
  return successResponse(res, data, "Orders retrieved successfully");
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const data = await orderService.getOrders({
    ...req.query,
    staffId: req.userId,
  });
  return successResponse(res, data, "My orders retrieved successfully");
});

export const getOrderById = asyncHandler(async (req, res) => {
  const data = await orderService.getOrderById(
    req.params.id,
    req.userId,
    req.user.role,
  );
  return successResponse(res, data, "Order retrieved successfully");
});

export const createOrder = asyncHandler(async (req, res) => {
  const data = await orderService.createOrder(req.body, req.userId);
  return successResponse(res, data, "Order created successfully", 201);
});

export const updateOrderItems = asyncHandler(async (req, res) => {
  const data = await orderService.updateOrderItems(
    req.params.id,
    req.body,
    req.userId,
    req.user.role,
  );
  return successResponse(res, data, "Order updated successfully");
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const data = await orderService.updateOrderStatus(
    req.params.id,
    req.body.orderStatus,
  );
  return successResponse(res, data, "Order status updated successfully");
});
