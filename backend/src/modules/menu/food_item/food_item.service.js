import mongoose from "mongoose";

import AppError from "../../../shared/exceptions/AppError.js";
import { buildPaginationMeta } from "../../../shared/helpers/pagination.helper.js";
import {
  parseBooleanQuery,
  parsePagination,
  parseSearchQuery,
} from "../../../shared/helpers/query.helper.js";
import categoryRepository from "../category/category.repository.js";
import foodItemRepository from "./food_item.repository.js";
import { toFoodItemResponse } from "./food_item.dto.js";

const buildFoodItemPayload = (body) => ({
  categoryId: body.categoryId,
  name: body.name.trim(),
  description: body.description?.trim() || null,
  basePrice: Number(body.basePrice),
  cost: Number(body.cost),
  isArchived: body.isArchived ?? false,
});

const assertCategoryExists = async (categoryId) => {
  const category = await categoryRepository.findById(categoryId);

  if (!category) {
    throw new AppError(
      "Category not found",
      404,
      "CATEGORY_NOT_FOUND",
    );
  }
};

const getFoodItemOrThrow = async (id) => {
  const foodItem = await foodItemRepository.findByIdWithCategory(
    new mongoose.Types.ObjectId(id),
  );

  if (!foodItem) {
    throw new AppError(
      "Food item not found",
      404,
      "FOODITEM_NOT_FOUND",
    );
  }

  return foodItem;
};

const foodItemService = {
  async getFoodItems(query) {
    const { page, limit } = parsePagination(query);
    const isArchived = parseBooleanQuery(query.isArchived, "Invalid archive status");
    const search = parseSearchQuery(query.search);
    const categoryId = query.categoryId?.trim() || undefined;

    const { items, total } = await foodItemRepository.findAll({
      search,
      page,
      limit,
      categoryId,
      isArchived,
    });

    return {
      items: items.map(toFoodItemResponse),
      pagination: buildPaginationMeta({ page, limit, total }),
    };
  },

  async getFoodItemById(id) {
    const foodItem = await getFoodItemOrThrow(id);
    return toFoodItemResponse(foodItem);
  },

  async createFoodItem(body) {
    await assertCategoryExists(body.categoryId);

    const foodItem = await foodItemRepository.create(buildFoodItemPayload(body));
    const createdFoodItem = await foodItemRepository.findByIdWithCategory(foodItem._id);

    return toFoodItemResponse(createdFoodItem);
  },

  async updateFoodItem(id, body) {
    await assertCategoryExists(body.categoryId);

    const foodItem = await foodItemRepository.updateById(id, buildFoodItemPayload(body));

    if (!foodItem) {
      throw new AppError(
        "Food item not found",
        404,
        "FOODITEM_NOT_FOUND",
      );
    }

    const updatedFoodItem = await foodItemRepository.findByIdWithCategory(
      new mongoose.Types.ObjectId(id),
    );

    return toFoodItemResponse(updatedFoodItem);
  },

  async updateFoodItemArchive(id, isArchived) {
    const foodItem = await foodItemRepository.updateArchiveById(id, isArchived);

    if (!foodItem) {
      throw new AppError(
        "Food item not found",
        404,
        "FOODITEM_NOT_FOUND",
      );
    }

    const updatedFoodItem = await foodItemRepository.findByIdWithCategory(
      new mongoose.Types.ObjectId(id),
    );

    return toFoodItemResponse(updatedFoodItem);
  },

  async deleteFoodItem(id, userId) {
    await getFoodItemOrThrow(id);

    const inUse = await foodItemRepository.isReferencedInMenusOrOrders(id);

    if (inUse) {
      throw new AppError(
        "Cannot delete food item that is referenced in menus or orders",
        409,
        "FOODITEM_IN_USE",
      );
    }

    const foodItem = await foodItemRepository.softDeleteById(id, userId ?? null);

    if (!foodItem) {
      throw new AppError(
        "Food item not found",
        404,
        "FOODITEM_NOT_FOUND",
      );
    }

    return toFoodItemResponse({
      ...foodItem.toObject(),
      categoryName: null,
    });
  },
};

export default foodItemService;
