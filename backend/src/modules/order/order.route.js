import express from "express";

import * as orderController from "./order.controller.js";
import {
  validateCreateOrder,
  validateGetOrderById,
  validateGetOrders,
  validateUpdateStatus,
  validateUpdateItems,
} from "./order.validation.js";
import {
  ORDER_CREATE_ROLES,
  ORDER_READ_ROLES,
  ORDER_READ_ALL_ROLES,
  ORDER_MY_ORDERS_ROLES,
  ORDER_STATUS_MANAGE_ROLES,
} from "./order.constants.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";

const router = express.Router();

// Apply authentication to all order routes
router.use(authenticate);

// GET /api/orders/my-orders – Staff/Manager xem order của chính mình
router.get(
  "/my-orders",
  authorizeRoles(...ORDER_MY_ORDERS_ROLES),
  validateGetOrders,
  validateRequest,
  orderController.getMyOrders,
);

// GET /api/orders – Manager/Admin xem tất cả order
router.get(
  "/",
  authorizeRoles(...ORDER_READ_ALL_ROLES),
  validateGetOrders,
  validateRequest,
  orderController.getOrders,
);

// GET /api/orders/:id
router.get(
  "/:id",
  authorizeRoles(...ORDER_READ_ROLES),
  validateGetOrderById,
  validateRequest,
  orderController.getOrderById,
);

// POST /api/orders – Staff/Manager create order
router.post(
  "/",
  authorizeRoles(...ORDER_CREATE_ROLES),
  validateCreateOrder,
  validateRequest,
  orderController.createOrder,
);

// PATCH /api/orders/:id/status – Manager/Admin manage status
router.patch(
  "/:id/status",
  authorizeRoles(...ORDER_STATUS_MANAGE_ROLES),
  validateUpdateStatus,
  validateRequest,
  orderController.updateOrderStatus,
);

// PATCH /api/orders/:id/cancel – Hủy đơn hàng (Staff chỉ hủy đơn của mình)
router.patch(
  "/:id/cancel",
  authorizeRoles(...ORDER_STATUS_MANAGE_ROLES),
  validateGetOrderById,
  validateRequest,
  orderController.cancelOrder,
);

// PATCH /api/orders/:id/items – Cập nhật danh sách món (chỉ đơn Pending)
router.patch(
  "/:id/items",
  authorizeRoles(...ORDER_CREATE_ROLES),
  validateUpdateItems,
  validateRequest,
  orderController.updateOrderItems,
);

export default router;
