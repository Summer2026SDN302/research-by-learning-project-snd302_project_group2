import mongoose from "mongoose";

import AppError from "../../../shared/exceptions/AppError.js";
import categoryRepository from "./category.repository.js";
import { toCategoryResponse } from "./category.dto.js";

const parseBooleanQuery = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (value === true || value === "true") {
    return true;
  }

  if (value === false || value === "false") {
    return false;
  }

  throw new AppError(
    "Invalid status",
    400,
    "VALIDATION_ERROR",
  );
};

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));

  return { page, limit };
};

const assertUniqueName = async (name, excludeId = null) => {
  const existing = await categoryRepository.findByNameIgnoreCase(name, excludeId);

  if (existing) {
    throw new AppError(
      "Category name already exists",
      409,
      "CATEGORY_NAME_EXISTS",
    );
  }
};

const getCategoryOrThrow = async (id, withFoodItemCount = false) => {
  const category = withFoodItemCount
    ? await categoryRepository.findByIdWithFoodItemCount(
        new mongoose.Types.ObjectId(id),
      )
    : await categoryRepository.findById(id);

  if (!category) {
    throw new AppError(
      "Category not found",
      404,
      "CATEGORY_NOT_FOUND",
    );
  }

  return category;
};

const categoryService = {
  async getCategories(query) {
    const { page, limit } = parsePagination(query);
    const isActive = parseBooleanQuery(query.isActive);
    const search = query.search?.trim() || undefined;

    const { items, total } = await categoryRepository.findAllWithFoodItemCount({
      search,
      page,
      limit,
      isActive,
    });

    return {
      items: items.map(toCategoryResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 0,
      },
    };
  },

  async getCategoryById(id) {
    const category = await getCategoryOrThrow(id, true);
    return toCategoryResponse(category);
  },

  async createCategory(body) {
    await assertUniqueName(body.name);

    const category = await categoryRepository.create({
      name: body.name.trim(),
      description: body.description?.trim() || null,
      icon: body.icon || "restaurant_menu",
      isActive: body.isActive ?? true,
    });

    return toCategoryResponse({ ...category.toObject(), foodItemCount: 0 });
  },

  async updateCategory(id, body) {
    await assertUniqueName(body.name, id);

    const category = await categoryRepository.updateById(id, {
      name: body.name.trim(),
      description: body.description?.trim() || null,
      icon: body.icon || "restaurant_menu",
      isActive: body.isActive ?? true,
    });

    if (!category) {
      throw new AppError(
        "Category not found",
        404,
        "CATEGORY_NOT_FOUND",
      );
    }

    const updatedCategory = await categoryRepository.findByIdWithFoodItemCount(
      new mongoose.Types.ObjectId(id),
    );

    return toCategoryResponse(updatedCategory);
  },

  async updateCategoryStatus(id, isActive) {
    const category = await categoryRepository.updateStatusById(id, isActive);

    if (!category) {
      throw new AppError(
        "Category not found",
        404,
        "CATEGORY_NOT_FOUND",
      );
    }

    const updatedCategory = await categoryRepository.findByIdWithFoodItemCount(
      new mongoose.Types.ObjectId(id),
    );

    return toCategoryResponse(updatedCategory);
  },

  async deleteCategory(id, userId) {
    await getCategoryOrThrow(id);

    const foodItemCount = await categoryRepository.countActiveFoodItems(id);

    if (foodItemCount > 0) {
      throw new AppError(
        "Cannot delete category with active food items",
        409,
        "CATEGORY_HAS_FOOD_ITEMS",
      );
    }

    const category = await categoryRepository.softDeleteById(id, userId ?? null);

    if (!category) {
      throw new AppError(
        "Category not found",
        404,
        "CATEGORY_NOT_FOUND",
      );
    }

    return toCategoryResponse({ ...category.toObject(), foodItemCount: 0 });
  },
};

export default categoryService;
