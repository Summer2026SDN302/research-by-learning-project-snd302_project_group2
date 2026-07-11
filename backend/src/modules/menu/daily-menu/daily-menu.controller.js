import asyncHandler from "../../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../../shared/response/responseFormatter.js";
import * as dailyMenuService from "./daily-menu.service.js";

export const getTodayMenu = asyncHandler(async (req, res) => {
  const data = await dailyMenuService.getTodayMenu(req.user.role, req.query);
  if (!data) {
    return successResponse(res, null, "No daily menu for today");
  }
  return successResponse(res, data, "Daily menu fetched successfully");
});

export const getMenuByDate = asyncHandler(async (req, res) => {
  const { date } = req.params;
  const data = await dailyMenuService.getMenuByDate(date);
  return successResponse(res, data, "Daily menu fetched successfully");
});

export const generateDailyMenu = asyncHandler(async (req, res) => {
  const { date } = req.body;
  const data = await dailyMenuService.generateDailyMenu(date, req.userId);
  return successResponse(res, data, "Daily menu generated successfully", 201);
});

export const publishDailyMenu = asyncHandler(async (req, res) => {
  const { menuId } = req.params;
  const data = await dailyMenuService.publishDailyMenu(menuId);
  return successResponse(res, data, "Daily menu published successfully");
});

export const updateDailyMenuItem = asyncHandler(async (req, res) => {
  const { menuId, itemId } = req.params;
  const data = await dailyMenuService.updateDailyMenuItem(
    menuId,
    itemId,
    req.body,
    req.userId,
  );
  return successResponse(res, data, "Daily menu item updated successfully");
});

export const applyAiQuantity = asyncHandler(async (req, res) => {
  const { menuId, itemId } = req.params;
  const { recommendedQuantity } = req.body;
  const data = await dailyMenuService.applyAiQuantity(
    menuId,
    itemId,
    recommendedQuantity,
    req.userId,
  );
  return successResponse(
    res,
    data,
    "AI recommended quantity applied successfully",
  );
});

export const applyAiPrice = asyncHandler(async (req, res) => {
  const { menuId, itemId } = req.params;
  const { recommendedPrice, recommendationId } = req.body;
  const data = await dailyMenuService.applyAiPrice(
    menuId,
    itemId,
    recommendedPrice,
    recommendationId,
    req.userId,
  );
  return successResponse(
    res,
    data,
    "AI recommended price applied successfully",
  );
});

export const addFoodItemToDailyMenu = asyncHandler(async (req, res) => {
  const { menuId } = req.params;
  const { foodItemId } = req.body;
  const data = await dailyMenuService.addFoodItemToDailyMenu(
    menuId,
    foodItemId,
    req.userId,
  );
  return successResponse(
    res,
    data,
    "Food item added to daily menu successfully",
    201,
  );
});

export const removeFoodItemFromDailyMenu = asyncHandler(async (req, res) => {
  const { menuId, itemId } = req.params;
  const data = await dailyMenuService.removeFoodItemFromDailyMenu(
    menuId,
    itemId,
  );
  return successResponse(
    res,
    data,
    "Food item removed from daily menu successfully",
  );
});
