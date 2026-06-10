import mongoose from "mongoose";

import AppError from "../../../shared/exceptions/AppError.js";
import { buildPaginationMeta } from "../../../shared/helpers/pagination.helper.js";
import {
  parseBooleanQuery,
  parsePagination,
  parseSearchQuery,
} from "../../../shared/helpers/query.helper.js";
import categoryRepository from "./category.repository.js";
import { toCategoryResponse } from "./category.dto.js";

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
    const search = parseSearchQuery(query.search);

    const { items, total } = await categoryRepository.findAllWithFoodItemCount({
      search,
      page,
      limit,
      isActive,
    });

    return {
      items: items.map(toCategoryResponse),
      pagination: buildPaginationMeta({ page, limit, total }),
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
