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
import { USER_ROLES } from "../../user/user.constants.js";
import scheduledMenuRepository from "../scheduled_menu/scheduled_menu.repository.js";
import * as dailyMenuRepository from "../daily-menu/daily-menu.repository.js";

const foodItemNotFoundError = () =>
  new AppError("Food item not found", 404, "FOODITEM_NOT_FOUND");

const categoryNotFoundError = () =>
  new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");

const assertUniqueName = async (name, excludeId = null) => {
  const existing = await foodItemRepository.findByNameIgnoreCase(
    name,
    excludeId,
  );

  if (existing) {
    throw new AppError(
      "Food item name already exists",
      409,
      "FOODITEM_NAME_EXISTS",
    );
  }
};

const buildFoodItemPayload = (body) => ({
  categoryId: body.categoryId,
  name: body.name.trim(),
  description: body.description?.trim() || null,
  basePrice: Number(body.basePrice),
  cost: Number(body.cost),
  isArchived: false,
  deletedAt: null,
  deletedBy: null,
});

const getFoodItemOrThrow = async (id) => {
  const foodItem = await foodItemRepository.findByIdWithCategory(id);

  if (!foodItem) {
    throw foodItemNotFoundError();
  }

  return foodItem;
};

const toPlainFoodItem = (foodItem) =>
  foodItem?.toObject ? foodItem.toObject() : foodItem;

const toFoodItemResponseFromDocument = (foodItem, categoryName) => {
  const plainFoodItem = toPlainFoodItem(foodItem);

  return toFoodItemResponse({
    ...plainFoodItem,
    categoryName: categoryName ?? plainFoodItem.categoryName,
  });
};

const mutateFoodItem = async (id, { patch, categoryName }) => {
  const foodItem = await foodItemRepository.patchById(id, patch);

  if (!foodItem) {
    throw foodItemNotFoundError();
  }

  return toFoodItemResponseFromDocument(foodItem, categoryName);
};

const getCategoryOrThrow = async (categoryId) => {
  const category = await categoryRepository.findById(categoryId);

  if (!category) {
    throw categoryNotFoundError();
  }

  if (!category.isActive || category.deletedAt) {
    throw new AppError("Category is inactive", 400, "CATEGORY_INACTIVE");
  }

  return category;
};

const foodItemService = {
  async getFoodItems(query, role) {
    const { page, limit } = parsePagination(query);

    const isArchived =
      role === USER_ROLES.STAFF ? false : parseBooleanQuery(query.isArchived);

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
    await assertUniqueName(body.name);

    const category = await getCategoryOrThrow(body.categoryId);

    const foodItem = await foodItemRepository.create(
      buildFoodItemPayload(body),
    );

    return toFoodItemResponseFromDocument(foodItem, category.name);
  },

  async updateFoodItem(id, body) {
    if (body.name !== undefined) {
      await assertUniqueName(body.name, id);
    }

    let categoryName;

    if (body.categoryId !== undefined) {
      const category = await getCategoryOrThrow(body.categoryId);
      categoryName = category.name;
    }

    const patch = {};

    if (body.categoryId !== undefined) {
      patch.categoryId = body.categoryId;
    }

    if (body.name !== undefined) {
      patch.name = body.name.trim();
    }

    if (body.description !== undefined) {
      patch.description = body.description?.trim() || null;
    }

    if (body.basePrice !== undefined) {
      patch.basePrice = Number(body.basePrice);
    }

    if (body.cost !== undefined) {
      patch.cost = Number(body.cost);
    }

    if (categoryName === undefined) {
      const foodItem = await getFoodItemOrThrow(id);
      categoryName = foodItem.categoryName;
    }

    return mutateFoodItem(id, { patch, categoryName });
  },

  async updateFoodItemArchive(id, isArchived, userId) {
  const foodItem = await getFoodItemOrThrow(id);

  const patch = {
    isArchived,
    deletedAt: isArchived ? new Date() : null,
    deletedBy: isArchived ? userId ?? null : null,
  };

  if (isArchived) {
    const today = new Date().toISOString().slice(0, 10);

    await Promise.all([
      scheduledMenuRepository.removeFoodItemFromAllSchedules(id),
      dailyMenuRepository.setFoodItemUnavailableFromDate(id, today),
    ]);
  }

  return mutateFoodItem(id, {
    patch,
    categoryName: foodItem.categoryName,
  });
}
};

export default foodItemService;