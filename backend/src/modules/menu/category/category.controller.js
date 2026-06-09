import asyncHandler from "../../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../../shared/response/responseFormatter.js";
import categoryService from "./category.service.js";

export const getCategories = asyncHandler(async (req, res) => {
  const data = await categoryService.getCategories(req.query);
  return successResponse(res, data, "Categories retrieved successfully");
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const data = await categoryService.getCategoryById(req.params.id);
  return successResponse(res, data, "Category retrieved successfully");
});

export const createCategory = asyncHandler(async (req, res) => {
  const data = await categoryService.createCategory(req.body);
  return successResponse(res, data, "Category created successfully", 201);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const data = await categoryService.updateCategory(req.params.id, req.body);
  return successResponse(res, data, "Category updated successfully");
});

export const updateCategoryStatus = asyncHandler(async (req, res) => {
  const data = await categoryService.updateCategoryStatus(
    req.params.id,
    req.body.isActive,
  );
  return successResponse(res, data, "Category status updated successfully");
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const data = await categoryService.deleteCategory(req.params.id, req.userId);
  return successResponse(res, data, "Category deleted successfully");
});
