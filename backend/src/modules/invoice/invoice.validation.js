import { param } from "express-validator";

export const validateGetInvoiceById = [
  param("id").isMongoId().withMessage("Invalid invoice id"),
];

export const validatePrintInvoice = [
  param("id").isMongoId().withMessage("Invalid invoice id"),
];
