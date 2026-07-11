import express from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { USER_ROLES } from "../user/user.constants.js";
import * as analyticsController from "./analytics.controller.js";
import {
  dashboardSummaryValidation,
  exportReportValidation,
  orderStatisticsValidation,
  revenueChartValidation,
  salesTrendValidation,
  topFoodsValidation,
  transactionReportValidation,
} from "./analytics.validation.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/staff/summary",
  authorizeRoles(USER_ROLES.STAFF, USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  analyticsController.getStaffDashboardSummary,
);

router.use(authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN));

router.get(
  "/dashboard/summary",
  dashboardSummaryValidation,
  validateRequest,
  analyticsController.getDashboardSummary,
);

router.get(
  "/revenue/chart",
  revenueChartValidation,
  validateRequest,
  analyticsController.getRevenueChart,
);

router.get(
  "/foods/top",
  topFoodsValidation,
  validateRequest,
  analyticsController.getTopFoods,
);

router.get(
  "/sales/trend",
  salesTrendValidation,
  validateRequest,
  analyticsController.getSalesTrend,
);

router.get(
  "/orders/statistics",
  orderStatisticsValidation,
  validateRequest,
  analyticsController.getOrderStatistics,
);

router.get(
  "/reports/transactions",
  transactionReportValidation,
  validateRequest,
  analyticsController.getTransactionReport,
);

router.get(
  "/reports/revenue/export",
  exportReportValidation,
  validateRequest,
  analyticsController.exportRevenueReport,
);

export default router;
