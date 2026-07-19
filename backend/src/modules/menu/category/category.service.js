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
import { USER_ROLES } from "../../user/user.constants.js";

const categoryNotFoundError = () =>
  new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");

const assertUniqueName = async (name, excludeId = null) => {
  const existing = await categoryRepository.findByNameIgnoreCase(
    name,
    excludeId,
  );

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
    ? await categoryRepository.findByIdWithFoodItemCount(id)
    : await categoryRepository.findById(id);

  if (!category) {
    throw categoryNotFoundError();
  }

  return category;
};

const toCategoryResponseFromDocument = async (
  category,
  { foodItemCount } = {},
) => {
  const resolvedCount =
    foodItemCount ??
    (await foodItemRepository.countActiveByCategoryId(category._id));

  return toCategoryResponse({
    ...category.toObject(),
    foodItemCount: resolvedCount,
  });
};

const mutateCategory = async (id, { patch }) => {
  const category = await categoryRepository.patchById(id, patch);

  if (!category) {
    throw categoryNotFoundError();
  }

  return toCategoryResponseFromDocument(category);
};

const categoryService = {
  async getCategories(query, role) {
    const { page, limit } = parsePagination(query);
    const isActive =
      role === USER_ROLES.STAFF ? true : parseBooleanQuery(query.isActive);
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
      icon: body.icon,
      isActive: body.isActive,
    });

    return toCategoryResponse({ ...category.toObject(), foodItemCount: 0 });
  },

  async updateCategory(id, body) {
    if (body.name !== undefined) {
      await assertUniqueName(body.name, id);
    }

    const patch = {};
    if (body.name !== undefined) patch.name = body.name.trim();
    if (body.description !== undefined)
      patch.description = body.description?.trim() || null;
    if (body.icon !== undefined) patch.icon = body.icon;

    return mutateCategory(id, { patch });
  },

  async updateCategoryStatus(id, isActive, userId) {
    const patch = { isActive };

    if (isActive) {
      patch.deletedAt = null;
      patch.deletedBy = null;
    } else {
      const foodItemCount =
        await foodItemRepository.countActiveByCategoryId(id);

      if (foodItemCount > 0) {
        throw new AppError(
          "Cannot disable category with active food items",
          409,
          "CATEGORY_HAS_FOOD_ITEMS",
        );
      }

      patch.deletedAt = new Date();
      patch.deletedBy = userId ?? null;
    }

    return mutateCategory(id, { patch });
  },
};

export default categoryService;
