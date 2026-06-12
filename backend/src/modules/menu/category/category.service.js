import AppError from "../../../shared/exceptions/AppError.js";
import { buildPaginationMeta } from "../../../shared/helpers/pagination.helper.js";
import {
  parseBooleanQuery,
  parsePagination,
  parseSearchQuery,
} from "../../../shared/helpers/query.helper.js";
import foodItemRepository from "../food_item/food_item.repository.js";
import categoryRepository from "./category.repository.js";
import { toCategoryResponse } from "./category.dto.js";

const categoryNotFoundError = () => new AppError("CATEGORY_NOT_FOUND", 404);

const assertUniqueName = async (name, excludeId = null) => {
  const existing = await categoryRepository.findByNameIgnoreCase(name, excludeId);

  if (existing) {
    throw new AppError("CATEGORY_NAME_EXISTS", 409);
  }
};

const getCategoryOrThrow = async (id, withFoodItemCount = false) => {
  const category = withFoodItemCount
    ? await categoryRepository.findByIdWithFoodItemCount(id)
    : await categoryRepository.findById(id);

  if (!category) {
    throw categoryNotFoundError();
  }

  return category;
};

const toCategoryResponseFromDocument = async (category, { foodItemCount } = {}) => {
  const resolvedCount =
    foodItemCount ??
    (await foodItemRepository.countActiveByCategoryId(category._id));

  return toCategoryResponse({
    ...category.toObject(),
    foodItemCount: resolvedCount,
  });
};

const mutateCategory = async (id, { beforeMutate, patch, responseMode = "withCount" }) => {
  if (beforeMutate) {
    await beforeMutate();
  }

  const category = await categoryRepository.patchById(id, patch);

  if (!category) {
    throw categoryNotFoundError();
  }

  if (responseMode === "deleted") {
    return toCategoryResponse({ ...category.toObject(), foodItemCount: 0 });
  }

  return toCategoryResponseFromDocument(category);
};

/**
 * Single entry point for status changes.
 * - PATCH /status: updates isActive only (deactivate/reactivate, no audit trail).
 * - DELETE: isActive=false + deletedAt + deletedBy (inactive + audit, not hard delete).
 */
const getCategoryReference = async (id) => {
  const category = await categoryRepository.findById(id);

  if (!category) {
    throw categoryNotFoundError();
  }

  return {
    _id: category._id,
    name: category.name,
  };
};

const changeCategoryStatus = async (id, isActive, { auditDelete = false, userId } = {}) => {
  const patch = { isActive };

  if (auditDelete) {
    patch.isActive = false;
    patch.deletedAt = new Date();
    patch.deletedBy = userId ?? null;
  }

  return mutateCategory(id, {
    beforeMutate: auditDelete
      ? async () => {
          const foodItemCount = await foodItemRepository.countActiveByCategoryId(id);

          if (foodItemCount > 0) {
            throw new AppError("CATEGORY_HAS_FOOD_ITEMS", 409);
          }
        }
      : undefined,
    patch,
    responseMode: auditDelete ? "deleted" : "withCount",
  });
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

  getCategoryReference,

  async assertCategoryExists(id) {
    await getCategoryReference(id);
  },

  async createCategory(body) {
    await assertUniqueName(body.name);

    const category = await categoryRepository.create({
      name: body.name.trim(),
      description: body.description?.trim() || null,
      icon: body.icon,
      isActive: body.isActive,
    });

    return toCategoryResponse({ ...category.toObject(), foodItemCount: 0 });
  },

  async updateCategory(id, body) {
    await assertUniqueName(body.name, id);

    return mutateCategory(id, {
      patch: {
        name: body.name.trim(),
        description: body.description?.trim() || null,
        icon: body.icon,
        isActive: body.isActive,
      },
    });
  },

  async updateCategoryStatus(id, isActive) {
    return changeCategoryStatus(id, isActive);
  },

  async deleteCategory(id, userId) {
    return changeCategoryStatus(id, false, { auditDelete: true, userId });
  },
};

export default categoryService;
