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
  validateConfirmPayment,
  validateFailPayment,
  validateGetPaymentById,
  validateGetPayments,
  validateInitiatePayment,
  validatePrintPaymentReceipt,
} from "./payment.validation.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  authorizeRoles(...PAYMENT_LIST_ROLES),
  validateGetPayments,
  validateRequest,
  paymentController.getPayments,
);

router.get(
  "/:id",
  authorizeRoles(...PAYMENT_READ_ROLES),
  validateGetPaymentById,
  validateRequest,
  paymentController.getPaymentById,
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
  "/",
  authorizeRoles(...PAYMENT_PROCESS_ROLES),
  validateInitiatePayment,
  validateRequest,
  paymentController.initiatePayment,
);

router.patch(
  "/:id/confirm",
  authorizeRoles(...PAYMENT_PROCESS_ROLES),
  validateConfirmPayment,
  validateRequest,
  paymentController.confirmPayment,
);

router.patch(
  "/:id/fail",
  authorizeRoles(...PAYMENT_PROCESS_ROLES),
  validateFailPayment,
  validateRequest,
  paymentController.failPayment,
);

router.post(
  "/:id/print",
  authorizeRoles(...PAYMENT_READ_ROLES),
  validatePrintPaymentReceipt,
  validateRequest,
  paymentController.printPaymentReceipt,
);

export default router;
