import express from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import * as invoiceController from "./invoice.controller.js";
import {
  INVOICE_PRINT_ROLES,
  INVOICE_READ_ROLES,
} from "./invoice.constants.js";
import {
  validateGetInvoiceById,
  validatePrintInvoice,
} from "./invoice.validation.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/:id",
  authorizeRoles(...INVOICE_READ_ROLES),
  validateGetInvoiceById,
  validateRequest,
  invoiceController.getInvoiceById,
);

router.get(
  "/:id/receipt",
  authorizeRoles(...INVOICE_READ_ROLES),
  validateGetInvoiceById,
  validateRequest,
  invoiceController.getInvoiceReceipt,
);

router.post(
  "/:id/print",
  authorizeRoles(...INVOICE_PRINT_ROLES),
  validatePrintInvoice,
  validateRequest,
  invoiceController.printInvoiceReceipt,
);

export default router;
