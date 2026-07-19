import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { getTodayVNDateString } from "../../shared/helpers/date.helper.js";
import { successResponse } from "../../shared/response/responseFormatter.js";
import * as analyticsService from "./analytics.service.js";
import { exportOrderReport as exportOrderReportService } from "./order-report.service.js";

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const data = await analyticsService.getDashboardSummary(req.query);
  return successResponse(res, data, "Dashboard summary fetched successfully");
});

export const getRevenueChart = asyncHandler(async (req, res) => {
  const data = await analyticsService.getRevenueChart(req.query);
  return successResponse(res, data, "Revenue chart fetched successfully");
});

export const getTopFoods = asyncHandler(async (req, res) => {
  const data = await analyticsService.getTopFoods(req.query);
  return successResponse(res, data, "Top foods fetched successfully");
});

export const getSalesTrend = asyncHandler(async (req, res) => {
  const data = await analyticsService.getSalesTrend(req.query);
  return successResponse(res, data, "Sales trend fetched successfully");
});

export const getOrderStatistics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getOrderStatistics(req.query);
  return successResponse(res, data, "Order statistics fetched successfully");
});

export const getTransactionReport = asyncHandler(async (req, res) => {
  const data = await analyticsService.getTransactionReport(req.query);
  return successResponse(res, data, "Transaction report fetched successfully");
});

export const exportRevenueReport = asyncHandler(async (req, res) => {
  const buffer = await analyticsService.exportRevenueReport(req.query);
  const filename = `revenue-report-${getTodayVNDateString()}.xlsx`;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  return res.send(buffer);
});

export const getStaffDashboardSummary = asyncHandler(async (req, res) => {
  const data = await analyticsService.getStaffDashboardSummary(req.query);
  return successResponse(res, data, "Staff dashboard summary fetched successfully");
});

export const exportOrderReport = asyncHandler(async (req, res) => {
  const buffer = await exportOrderReportService(req.query);
  const filename = `order-report-${getTodayVNDateString()}.xlsx`;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  return res.send(buffer);
});
