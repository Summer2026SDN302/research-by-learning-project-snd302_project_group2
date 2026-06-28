import { body, param, query } from "express-validator";
import {
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from "./payment.constants.js";

const optionalString = (fieldName) =>
  body(fieldName).custom((value) => {
    if (value == null || value === "") {
      return true;
    }

    if (typeof value !== "string") {
      throw new Error(`${fieldName} must be a string`);
    }

    return true;
  });

const validateOptionalNote = (value) => {
  if (value == null || value === "") {
    return true;
  }

  if (typeof value !== "string") {
    throw new Error("note must be a string");
  }

  return true;
};

export const validateCheckoutPayment = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Checkout must have at least one item"),
  body("items.*.foodItemId")
    .isMongoId()
    .withMessage("Invalid food item id"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  body("items.*.note")
    .optional()
    .custom(validateOptionalNote)
    .withMessage("Item note must be a string"),
  body("notes")
    .optional()
    .custom(validateOptionalNote)
    .withMessage("Checkout notes must be a string"),
  body("paymentMethod")
    .isIn(Object.values(PAYMENT_METHOD))
    .withMessage("Invalid payment method"),
  body("amountReceived")
    .isFloat({ min: 0 })
    .withMessage("amountReceived must be a non-negative number"),
  optionalString("transactionCode"),
];

export const validateInitiatePayment = [
  body("orderId").isMongoId().withMessage("Invalid order id"),
  body("paymentMethod")
    .isIn(Object.values(PAYMENT_METHOD))
    .withMessage("Invalid payment method"),
  body("amountReceived")
    .isFloat({ min: 0 })
    .withMessage("amountReceived must be a non-negative number"),
  optionalString("transactionCode"),
];

export const validateConfirmPayment = [
  param("id").isMongoId().withMessage("Invalid payment id"),
  body("amountReceived")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("amountReceived must be a non-negative number"),
  optionalString("transactionCode"),
];

export const validateFailPayment = [
  param("id").isMongoId().withMessage("Invalid payment id"),
  body("failureReason")
    .optional()
    .isString()
    .withMessage("failureReason must be a string"),
];

export const validateGetPaymentById = [
  param("id").isMongoId().withMessage("Invalid payment id"),
];

export const validateGetPayments = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  query("paymentStatus")
    .optional()
    .isIn(Object.values(PAYMENT_STATUS))
    .withMessage("Invalid payment status"),
  query("paymentMethod")
    .optional()
    .isIn(Object.values(PAYMENT_METHOD))
    .withMessage("Invalid payment method"),
  query("search")
    .optional()
    .isString()
    .withMessage("search must be a string"),
];

export const validatePrintPaymentReceipt = [
  param("id").isMongoId().withMessage("Invalid payment id"),
];
