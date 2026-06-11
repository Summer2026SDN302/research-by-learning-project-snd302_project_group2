import AppError from "../../../shared/exceptions/AppError.js";
import { buildPaginationMeta } from "../../../shared/helpers/pagination.helper.js";
import {
  parseBooleanQuery,
  parsePagination,
  parseSearchQuery,
} from "../../../shared/helpers/query.helper.js";
import categoryService from "../category/category.service.js";
import foodItemRepository from "./food_item.repository.js";
import { toFoodItemResponse } from "./food_item.dto.js";

const foodItemNotFoundError = () =>
  new AppError("Food item not found", 404, "FOODITEM_NOT_FOUND");

const buildFoodItemPayload = (body) => ({
  categoryId: body.categoryId,
  name: body.name.trim(),
  description: body.description?.trim() || null,
  basePrice: Number(body.basePrice),
  cost: Number(body.cost),
  isArchived: body.isArchived,
});

const getFoodItemOrThrow = async (id) => {
  const foodItem = await foodItemRepository.findByIdWithCategory(id);

  if (!foodItem) {
    throw foodItemNotFoundError();
  }

  return foodItem;
};

const toFoodItemResponseFromDocument = async (foodItem, { categoryName } = {}) => {
  const resolvedCategoryName =
    categoryName ??
    (await categoryService.getCategoryReference(foodItem.categoryId)).name;

  return toFoodItemResponse({
    ...foodItem.toObject(),
    categoryName: resolvedCategoryName,
  });
};

const mutateFoodItem = async (id, { beforeMutate, patch, responseMode = "withCategory", categoryName }) => {
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

  return toFoodItemResponseFromDocument(foodItem, { categoryName });
};

/**
 * Archive toggle vs delete share one mutate path.
 * - PATCH /archive: isArchived only.
 * - DELETE: isArchived=true + deletedAt + deletedBy (inactive + audit, not hard delete).
 */
const changeFoodItemArchiveState = async (
  id,
  isArchived,
  { auditDelete = false, userId } = {},
) => {
  const patch = { isArchived };

  if (auditDelete) {
    patch.isArchived = true;
    patch.deletedAt = new Date();
    patch.deletedBy = userId ?? null;
  }

  return mutateFoodItem(id, {
    beforeMutate: auditDelete
      ? async () => {
          const inUse = await foodItemRepository.isReferencedInMenusOrOrders(id);

          if (inUse) {
            throw new AppError(
              "Cannot delete food item that is referenced in menus or orders",
              409,
              "FOODITEM_IN_USE",
            );
          }
        }
      : undefined,
    patch,
    responseMode: auditDelete ? "deleted" : "withCategory",
  });
};

const foodItemService = {
  async countActiveByCategoryId(categoryId) {
    return foodItemRepository.countActiveByCategoryId(categoryId);
  },

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

    return toFoodItemResponse({
      ...foodItem.toObject(),
      categoryName: category.name,
    });
  },

  async updateFoodItem(id, body) {
    const category = await categoryService.getCategoryReference(body.categoryId);

    return mutateFoodItem(id, {
      patch: buildFoodItemPayload(body),
      categoryName: category.name,
    });
  },

  async updateFoodItemArchive(id, isArchived) {
    return changeFoodItemArchiveState(id, isArchived);
  },

  async deleteFoodItem(id, userId) {
    return changeFoodItemArchiveState(id, true, { auditDelete: true, userId });
  },
};

export default foodItemService;
