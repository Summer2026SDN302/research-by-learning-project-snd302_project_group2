import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/response/responseFormatter.js";
import invoiceService from "./invoice.service.js";

export const getInvoiceById = asyncHandler(async (req, res) => {
  const data = await invoiceService.getInvoiceById(
    req.params.id,
    req.userId,
    req.user.role,
  );

  return successResponse(res, data, "Invoice retrieved successfully");
});

export const getInvoiceReceipt = asyncHandler(async (req, res) => {
  const data = await invoiceService.getInvoiceReceipt(
    req.params.id,
    req.userId,
    req.user.role,
  );

  return successResponse(res, data, "Invoice receipt retrieved successfully");
});

export const printInvoiceReceipt = asyncHandler(async (req, res) => {
  const data = await invoiceService.printInvoiceReceipt(
    req.params.id,
    req.userId,
    req.user.role,
  );

  return successResponse(res, data, "Invoice print audit updated successfully");
});
