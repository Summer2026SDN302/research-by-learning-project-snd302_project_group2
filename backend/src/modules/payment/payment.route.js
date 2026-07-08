import express from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import {
  PAYMENT_LIST_ROLES,
  PAYMENT_PROCESS_ROLES,
  PAYMENT_READ_ROLES,
} from "./payment.constants.js";
import * as paymentController from "./payment.controller.js";
import {
  validateCheckoutPayment,
  validateGetPaymentById,
  validateGetPayments,
  validatePrintPaymentReceipt,
} from "./payment.validation.js";

const router = express.Router();

router.post("/webhook/payos", paymentController.handlePayOSWebhook);

router.use(authenticate);

router.get(
  "/",
  authorizeRoles(...PAYMENT_LIST_ROLES),
  validateGetPayments,
  validateRequest,
  paymentController.getPayments,
);

router.get(
  "/:id/receipt",
  authorizeRoles(...PAYMENT_READ_ROLES),
  validateGetPaymentById,
  validateRequest,
  paymentController.getPaymentReceipt,
);

router.post(
  "/checkout",
  authorizeRoles(...PAYMENT_PROCESS_ROLES),
  validateCheckoutPayment,
  validateRequest,
  paymentController.checkoutPayment,
);

router.post(
  "/:id/print",
  authorizeRoles(...PAYMENT_READ_ROLES),
  validatePrintPaymentReceipt,
  validateRequest,
  paymentController.printPaymentReceipt,
);

router.post(
  "/:id/confirm",
  authorizeRoles(...PAYMENT_PROCESS_ROLES),
  validateGetPaymentById,
  validateRequest,
  paymentController.confirmPayment,
);

export default router;
