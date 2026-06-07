import AppError from "../../../shared/exceptions/AppError.js";
import categoryService from "./category.service.js";
import { sendError, sendSuccess } from "./category.dto.js";

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export const getCategories = asyncHandler(async (req, res) => {
  const data = await categoryService.getCategories(req.query);

  sendSuccess(res, 200, "Categories retrieved successfully", data);
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const data = await categoryService.getCategoryById(req.params.id);

  sendSuccess(res, 200, "Category retrieved successfully", data);
});

export const createCategory = asyncHandler(async (req, res) => {
  const data = await categoryService.createCategory(req.body);

  sendSuccess(res, 201, "Category created successfully", data);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const data = await categoryService.updateCategory(req.params.id, req.body);

  sendSuccess(res, 200, "Category updated successfully", data);
});

export const updateCategoryStatus = asyncHandler(async (req, res) => {
  const data = await categoryService.updateCategoryStatus(
    req.params.id,
    req.body.isActive,
  );

  sendSuccess(res, 200, "Category status updated successfully", data);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const userId = req.user?.id ?? req.user?._id ?? null;
  const data = await categoryService.deleteCategory(req.params.id, userId);

  sendSuccess(res, 200, "Category deleted successfully", data);
});

export const categoryErrorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return sendError(
      res,
      err.statusCode,
      err.message,
      err.code,
      err.details,
    );
  }

  next(err);
};
