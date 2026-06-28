import express from "express";

import * as orderController from "./order.controller.js";
import {
  validateCreateOrder,
  validateGetOrderById,
  validateGetOrders,
  validateUpdateOrderItems,
  validateUpdateStatus,
} from "./order.validation.js";
import {
  ORDER_CREATE_ROLES,
  ORDER_EDIT_ROLES,
  ORDER_READ_ROLES,
  ORDER_READ_ALL_ROLES,
  ORDER_MY_ORDERS_ROLES,
  ORDER_STATUS_MANAGE_ROLES,
} from "./order.constants.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/my-orders",
  authorizeRoles(...ORDER_MY_ORDERS_ROLES),
  validateGetOrders,
  validateRequest,
  orderController.getMyOrders,
);

router.get(
  "/",
  authorizeRoles(...ORDER_READ_ALL_ROLES),
  validateGetOrders,
  validateRequest,
  orderController.getOrders,
);

router.get(
  "/:id",
  authorizeRoles(...ORDER_READ_ROLES),
  validateGetOrderById,
  validateRequest,
  orderController.getOrderById,
);

router.post(
  "/",
  authorizeRoles(...ORDER_CREATE_ROLES),
  validateCreateOrder,
  validateRequest,
  orderController.createOrder,
);

router.patch(
  "/:id/items",
  authorizeRoles(...ORDER_EDIT_ROLES),
  validateUpdateOrderItems,
  validateRequest,
  orderController.updateOrderItems,
);

router.patch(
  "/:id/status",
  authorizeRoles(...ORDER_STATUS_MANAGE_ROLES),
  validateUpdateStatus,
  validateRequest,
  orderController.updateOrderStatus,
);

export default router;
