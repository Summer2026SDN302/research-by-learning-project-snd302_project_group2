import asyncHandler from "../../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../../shared/response/responseFormatter.js";
import foodItemService from "./food_item.service.js";

export const getFoodItems = asyncHandler(async (req, res) => {
  const data = await foodItemService.getFoodItems(req.query, req.user.role);
  return successResponse(res, data, "Food items retrieved successfully");
});

export const getFoodItemById = asyncHandler(async (req, res) => {
  const data = await foodItemService.getFoodItemById(req.params.id);
  return successResponse(res, data, "Food item retrieved successfully");
});

export const createFoodItem = asyncHandler(async (req, res) => {
  const data = await foodItemService.createFoodItem(req.body);
  return successResponse(res, data, "Food item created successfully", 201);
});

export const updateFoodItem = asyncHandler(async (req, res) => {
  const data = await foodItemService.updateFoodItem(req.params.id, req.body);
  return successResponse(res, data, "Food item updated successfully");
});

export const updateFoodItemArchive = asyncHandler(async (req, res) => {
  const data = await foodItemService.updateFoodItemArchive(
    req.params.id,
    req.body.isArchived,
    req.userId,
  );
  return successResponse(
    res,
    data,
    "Food item archive status updated successfully",
  );
});
