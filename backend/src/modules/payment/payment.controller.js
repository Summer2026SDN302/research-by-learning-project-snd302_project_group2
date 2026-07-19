import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/response/responseFormatter.js";
import paymentService from "./payment.service.js";
import { getIO } from "../../sockets/socket.js";

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
  const io = getIO();
  if (io) {
    io.emit("menu-updated");
  }
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

export const handlePayOSWebhook = asyncHandler(async (req, res) => {
  const data = await paymentService.handlePayOSWebhook(req.body);
  const io = getIO();
  if (io) {
    io.emit("menu-updated");
  }
  return successResponse(res, data, "Webhook processed successfully");
});

export const confirmPayment = asyncHandler(async (req, res) => {
  const data = await paymentService.confirmPayment(
    req.params.id,
    req.body,
    req.userId,
    req.user.role,
  );
  const io = getIO();
  if (io) {
    io.emit("menu-updated");
  }
  return successResponse(res, data, "Payment confirmed successfully");
});

export const getPaymentByOrderId = asyncHandler(async (req, res) => {
  const data = await paymentService.getPaymentByOrderId(
    req.params.orderId,
    req.userId,
    req.user.role,
  );
  return successResponse(res, data, "Payment retrieved successfully");
});
