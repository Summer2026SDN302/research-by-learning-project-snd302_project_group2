import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/response/responseFormatter.js";
import paymentService from "./payment.service.js";

export const getPayments = asyncHandler(async (req, res) => {
  const data = await paymentService.getPayments(req.query);
  return successResponse(res, data, "Payments retrieved successfully");
});

export const getPaymentReceipt = asyncHandler(async (req, res) => {
  const data = await paymentService.getPaymentReceipt(
    req.params.id,
    req.userId,
    req.user.role,
  );

  return successResponse(res, data, "Payment receipt retrieved successfully");
});

export const checkoutPayment = asyncHandler(async (req, res) => {
  const data = await paymentService.checkout(req.body, req.userId, req.user.role);
  return successResponse(res, data, "Checkout completed successfully", 201);
});

export const printPaymentReceipt = asyncHandler(async (req, res) => {
  const data = await paymentService.printPaymentReceipt(
    req.params.id,
    req.userId,
    req.user.role,
  );

  return successResponse(res, data, "Payment receipt prepared successfully");
});
