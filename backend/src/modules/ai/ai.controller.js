import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/response/responseFormatter.js";
import * as aiService from "./ai.service.js";
import { toAiInsightResponse } from "./ai.dto.js";

/**
 * POST /api/ai/generate-insight
 * Body: { "targetDate": "2026-06-25" }
 */
export const generateInsight = asyncHandler(async (req, res) => {
  const { targetDate } = req.body;
  const savedInsight = await aiService.generateDailyInsight(targetDate);
  return successResponse(
    res,
    toAiInsightResponse(savedInsight),
    "AI Insight generated and saved successfully.",
    201
  );
});

/**
 * GET /api/ai/insight/:targetDate
 */
export const getInsightByDate = asyncHandler(async (req, res) => {
  const { targetDate } = req.params;
  const { version } = req.query;
  const insight = await aiService.getInsightByDate(targetDate, version);
  return successResponse(
    res,
    toAiInsightResponse(insight),
    "AI Insight fetched successfully."
  );
});

/**
 * GET /api/ai/insight/:targetDate/versions
 */
export const getVersionsByDate = asyncHandler(async (req, res) => {
  const { targetDate } = req.params;
  const versions = await aiService.getVersionsByDate(targetDate);
  return successResponse(
    res,
    versions,
    "AI Insight versions fetched successfully."
  );
});

/**
 * PUT /api/ai/insight/:insightId/forecasts
 * Body: { "updates": [ { "foodItemId": "...", "status": "Applied" } ] }
 */
export const applyForecasts = asyncHandler(async (req, res) => {
  const { insightId } = req.params;
  const { updates } = req.body;
  const updatedInsight = await aiService.applyForecasts(insightId, updates, req.userId);
  return successResponse(
    res,
    toAiInsightResponse(updatedInsight),
    "AI Forecasts applied successfully."
  );
});

/**
 * POST /api/ai/pricing/recommendations
 * Body: { "targetDate": "2026-06-25" }
 */
export const generatePricing = asyncHandler(async (req, res) => {
  const { targetDate } = req.body;
  const updatedInsight = await aiService.generateDynamicPricingRecommendations(targetDate);
  return successResponse(
    res,
    toAiInsightResponse(updatedInsight),
    "Dynamic pricing recommendations generated successfully.",
    201
  );
});

/**
 * PUT /api/ai/pricing/recommendations/:insightId/apply
 * Body: { "updates": [ { "foodItemId": "...", "status": "Applied" } ] }
 */
export const applyPricing = asyncHandler(async (req, res) => {
  const { insightId } = req.params;
  const { updates } = req.body;
  const updatedInsight = await aiService.applyPricingRecommendations(insightId, updates, req.userId);
  return successResponse(
    res,
    toAiInsightResponse(updatedInsight),
    "Pricing recommendations applied successfully."
  );
});
