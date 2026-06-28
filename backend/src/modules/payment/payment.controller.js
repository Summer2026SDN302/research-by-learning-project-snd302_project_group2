import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/response/responseFormatter.js";
import paymentService from "./payment.service.js";

export const getPayments = asyncHandler(async (req, res) => {
  const data = await paymentService.getPayments(req.query);
  return successResponse(res, data, "Payments retrieved successfully");
});

export const getPaymentById = asyncHandler(async (req, res) => {
  const data = await paymentService.getPaymentById(
    req.params.id,
    req.userId,
    req.user.role,
  );

  return successResponse(res, data, "Payment retrieved successfully");
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
  const data = await paymentService.checkout(req.body, req.userId);
  return successResponse(res, data, "Checkout completed successfully", 201);
});

export const initiatePayment = asyncHandler(async (req, res) => {
  const data = await paymentService.initiatePayment(
    req.body,
    req.userId,
    req.user.role,
  );

  return successResponse(res, data, "Payment initiated successfully", 201);
});

export const confirmPayment = asyncHandler(async (req, res) => {
  const data = await paymentService.confirmPayment(
    req.params.id,
    req.body,
    req.userId,
    req.user.role,
  );

  return successResponse(res, data, "Payment confirmed successfully");
});

export const failPayment = asyncHandler(async (req, res) => {
  const data = await paymentService.failPayment(
    req.params.id,
    req.body,
    req.userId,
    req.user.role,
  );

  return successResponse(res, data, "Payment marked as failed");
});

export const printPaymentReceipt = asyncHandler(async (req, res) => {
  const data = await paymentService.printPaymentReceipt(
    req.params.id,
    req.userId,
    req.user.role,
  );

  return successResponse(res, data, "Payment receipt prepared successfully");
});
