import { body, param, query } from "express-validator";
import { ORDER_STATUS } from "./order.constants.js";

export const validateCreateOrder = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Order must have at least one item"),
  body("items.*.foodItemId")
    .isMongoId()
    .withMessage("Invalid food item id"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
];

export const validateUpdateStatus = [
  param("id").isMongoId().withMessage("Invalid order id"),
  body("orderStatus")
    .isIn(Object.values(ORDER_STATUS))
    .withMessage("Invalid order status"),
];

export const validateGetOrders = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  query("orderStatus")
    .optional()
    .isIn(Object.values(ORDER_STATUS))
    .withMessage("Invalid status filter"),
  query("date")
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Date must be in YYYY-MM-DD format"),
  query("fromDate")
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("fromDate must be in YYYY-MM-DD format"),
  query("toDate")
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("toDate must be in YYYY-MM-DD format"),
];

export const validateGetOrderById = [
  param("id").isMongoId().withMessage("Invalid order id"),
];
