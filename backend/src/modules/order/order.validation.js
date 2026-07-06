import { body, param, query } from "express-validator";
import { ORDER_STATUS } from "./order.constants.js";

/** Helper: kiem tra chuoi YYYY-MM-DD co phai ngay thuc su hop le khong */
const isRealDate = (value) => {
  const [year, month, day] = value.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
};

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

  // trim() de tranh loi do khoang trang thua
  query("orderStatus")
    .optional()
    .trim()
    .isIn(Object.values(ORDER_STATUS))
    .withMessage("Invalid status filter"),

  // validate staffId la MongoId hop le (Admin/Manager filter theo staff)
  query("staffId")
    .optional()
    .isMongoId()
    .withMessage("staffId must be a valid MongoId"),

  query("date")
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Date must be in YYYY-MM-DD format")
    .custom((value) => {
      if (!isRealDate(value)) throw new Error("Date is not a valid calendar date");
      return true;
    }),
  query("fromDate")
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("fromDate must be in YYYY-MM-DD format")
    .custom((value) => {
      if (!isRealDate(value)) throw new Error("fromDate is not a valid calendar date");
      return true;
    }),
  query("toDate")
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("toDate must be in YYYY-MM-DD format")
    .custom((value) => {
      if (!isRealDate(value)) throw new Error("toDate is not a valid calendar date");
      return true;
    }),

  // Custom validator: neu date ton tai thi fromDate / toDate phai absent
  query("date").custom((value, { req }) => {
    if (value && (req.query.fromDate || req.query.toDate)) {
      throw new Error(
        "Cannot use 'date' together with 'fromDate'/'toDate'. Use either exact date or date range, not both",
      );
    }
    return true;
  }),
];

export const validateGetOrderById = [
  param("id").isMongoId().withMessage("Invalid order id"),
];
