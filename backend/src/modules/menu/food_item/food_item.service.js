import AppError from "../../../shared/exceptions/AppError.js";
import { buildPaginationMeta } from "../../../shared/helpers/pagination.helper.js";
import {
  parseBooleanQuery,
  parsePagination,
  parseSearchQuery,
} from "../../../shared/helpers/query.helper.js";
import orderRepository from "../../order/order.repository.js";
import categoryService from "../category/category.service.js";
import dailyMenuRepository from "../daily_menu/daily_menu.repository.js";
import scheduledMenuRepository from "../scheduled_menu/scheduled_menu.repository.js";
import foodItemRepository from "./food_item.repository.js";
import { toFoodItemResponse } from "./food_item.dto.js";

const foodItemNotFoundError = () => new AppError("FOODITEM_NOT_FOUND", 404);

const buildFoodItemPayload = (body) => ({
  categoryId: body.categoryId,
  name: body.name.trim(),
  description: body.description?.trim() || null,
  basePrice: Number(body.basePrice),
  cost: Number(body.cost),
  isActive: body.isActive,
  isArchived: body.isArchived,
});

const getFoodItemOrThrow = async (id) => {
  const foodItem = await foodItemRepository.findByIdWithCategory(id);

  if (!foodItem) {
    throw foodItemNotFoundError();
  }

  return foodItem;
};

const toFoodItemResponseFromDocument = (foodItem, categoryName) =>
  toFoodItemResponse({
    ...foodItem.toObject(),
    categoryName,
  });

const assertFoodItemNotReferenced = async (foodItemId) => {
  const [dailyMenuCount, scheduledMenuCount, orderCount] = await Promise.all([
    dailyMenuRepository.countByFoodItemId(foodItemId),
    scheduledMenuRepository.countByFoodItemId(foodItemId),
    orderRepository.countByFoodItemId(foodItemId),
  ]);

  if (dailyMenuCount + scheduledMenuCount + orderCount > 0) {
    throw new AppError("FOODITEM_IN_USE", 409);
  }
};

const mutateFoodItem = async (
  id,
  { beforeMutate, patch, responseMode = "withCategory", categoryName },
) => {
  if (beforeMutate) {
    await beforeMutate();
  }

  const foodItem = await foodItemRepository.patchById(id, patch);

  if (!foodItem) {
    throw foodItemNotFoundError();
  }

  if (responseMode === "deleted") {
    return toFoodItemResponse({
      ...foodItem.toObject(),
      categoryName: null,
    });
  }

  return toFoodItemResponseFromDocument(foodItem, categoryName);
};

/**
 * Archive toggle vs delete share one mutate path.
 * - PATCH /archive: isArchived only.
 * - DELETE: isActive=false + isArchived=true + deletedAt + deletedBy (inactive + audit).
 */
const changeFoodItemArchiveState = async (
  id,
  isArchived,
  { auditDelete = false, userId, categoryName } = {},
) => {
  const patch = { isArchived };

  if (auditDelete) {
    patch.isActive = false;
    patch.isArchived = true;
    patch.deletedAt = new Date();
    patch.deletedBy = userId ?? null;
  }

  return mutateFoodItem(id, {
    beforeMutate: auditDelete ? () => assertFoodItemNotReferenced(id) : undefined,
    patch,
    responseMode: auditDelete ? "deleted" : "withCategory",
    categoryName,
  });
};

const foodItemService = {
  async getFoodItems(query) {
    const { page, limit } = parsePagination(query);
    const isArchived = parseBooleanQuery(query.isArchived);
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
    const category = await categoryService.getCategoryReference(body.categoryId);
    const foodItem = await foodItemRepository.create(buildFoodItemPayload(body));

    return toFoodItemResponseFromDocument(foodItem, category.name);
  },

  async updateFoodItem(id, body) {
    const category = await categoryService.getCategoryReference(body.categoryId);

    return mutateFoodItem(id, {
      patch: buildFoodItemPayload(body),
      categoryName: category.name,
    });
  },

  async updateFoodItemArchive(id, isArchived) {
    const foodItem = await foodItemRepository.findByIdWithCategory(id);

    if (!foodItem) {
      throw foodItemNotFoundError();
    }

    return changeFoodItemArchiveState(id, isArchived, {
      categoryName: foodItem.categoryName,
    });
  },

  async deleteFoodItem(id, userId) {
    return changeFoodItemArchiveState(id, true, { auditDelete: true, userId });
  },
};

export default foodItemService;
