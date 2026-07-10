import express from "express";
import * as aiController from "./ai.controller.js";
import {
  generateInsightValidation,
  generatePricingValidation,
  getInsightValidation,
  applyForecastsValidation,
  applyPricingValidation,
} from "./ai.validation.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { USER_ROLES } from "../user/user.constants.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// POST /api/ai/generate-insight - Manager, Admin can generate AI insight
router.post(
  "/generate-insight",
  authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  generateInsightValidation,
  validateRequest,
  aiController.generateInsight,
);

// GET /api/ai/insight/:targetDate - All authenticated users can view AI insight
router.get(
  "/insight/:targetDate",
  authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  getInsightValidation,
  validateRequest,
  aiController.getInsightByDate,
);

// GET /api/ai/insight/:targetDate/versions - Get list of versions for target date
router.get(
  "/insight/:targetDate/versions",
  authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  getInsightValidation,
  validateRequest,
  aiController.getVersionsByDate,
);

// PUT /api/ai/insight/:insightId/forecasts - Manager, Admin can apply AI forecasts
router.put(
  "/insight/:insightId/forecasts",
  authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  applyForecastsValidation,
  validateRequest,
  aiController.applyForecasts,
);

// POST /api/ai/pricing/recommendations - Manager, Admin can generate dynamic pricing
router.post(
  "/pricing/recommendations",
  authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  generatePricingValidation,
  validateRequest,
  aiController.generatePricing,
);

// PUT /api/ai/pricing/recommendations/:insightId/apply - Manager, Admin can apply dynamic pricing
router.put(
  "/pricing/recommendations/:insightId/apply",
  authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  applyPricingValidation,
  validateRequest,
  aiController.applyPricing,
);

export default router;
