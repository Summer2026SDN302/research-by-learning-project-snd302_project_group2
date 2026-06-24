import AppError from "../../../shared/exceptions/AppError.js";
import foodItemRepository from "../food_item/food_item.repository.js";
import scheduledMenuRepository from "./scheduled_menu.repository.js";
import { DAY_OF_WEEK } from "./scheduled_menu.constants.js";
import { withTransaction } from "../../../shared/helpers/transaction.helper.js";
import {
  toEmptyScheduledMenuDayResponse,
  toScheduledMenuDayResponse,
} from "./scheduled_menu.dto.js";

const scheduledMenuService = {
  async getWeeklySchedule() {
    const docs = await scheduledMenuRepository.findAll();

    const docMap = {};
    docs.forEach((doc) => {
      docMap[doc.dayOfWeek] = doc;
    });

    return DAY_OF_WEEK.map((day) =>
      docMap[day]
        ? toScheduledMenuDayResponse(docMap[day])
        : toEmptyScheduledMenuDayResponse(day),
    );
  },

  async updateDaySchedule(day, foodItemIds, userId) {
    if (!DAY_OF_WEEK.includes(day)) {
      throw new AppError(`Invalid day of week: ${day}`, 400, "VALIDATION_ERROR");
    }

    const uniqueIds = new Set(foodItemIds);
    if (uniqueIds.size !== foodItemIds.length) {
      throw new AppError(
        "Duplicate food item IDs are not allowed for the same day",
        400,
        "DUPLICATE_FOOD_ITEM",
      );
    }

    if (foodItemIds.length > 0) {
      const existingCount = await foodItemRepository.countActiveByIds(foodItemIds);

      if (existingCount !== foodItemIds.length) {
        throw new AppError(
          "One or more food items not found",
          404,
          "FOOD_ITEM_NOT_FOUND",
        );
      }
    }

    const menuItems = foodItemIds.map((id) => ({ foodItemId: id }));
    const savedDoc = await scheduledMenuRepository.upsertByDay(day, menuItems, userId);

    return toScheduledMenuDayResponse(savedDoc);
  },

  async batchUpdateSchedule(days, userId) {
    if (!Array.isArray(days) || days.length === 0 || days.length > 7) {
      throw new AppError("Days must be a non-empty array with length up to 7", 400, "VALIDATION_ERROR");
    }

    const allFoodItemIds = [];
    for (const dayObj of days) {
      const { dayOfWeek, foodItemIds } = dayObj;

      if (!dayOfWeek || !DAY_OF_WEEK.includes(dayOfWeek)) {
        throw new AppError(`Invalid day of week: ${dayOfWeek}`, 400, "VALIDATION_ERROR");
      }

      if (!Array.isArray(foodItemIds)) {
        throw new AppError("foodItemIds must be an array", 400, "VALIDATION_ERROR");
      }

      if (foodItemIds.length > 200) {
        throw new AppError("foodItemIds length must be up to 200", 400, "VALIDATION_ERROR");
      }

      const uniqueIds = new Set(foodItemIds);
      if (uniqueIds.size !== foodItemIds.length) {
        throw new AppError(
          "Duplicate food item IDs are not allowed for the same day",
          400,
          "DUPLICATE_FOOD_ITEM",
        );
      }

      allFoodItemIds.push(...foodItemIds);
    }

    const dayOfWeekSet = new Set(days.map((d) => d.dayOfWeek));
    if (dayOfWeekSet.size !== days.length) {
      throw new AppError("Duplicate day of week in batch is not allowed", 400, "DUPLICATE_DAY_IN_BATCH");
    }

    const uniqueAllFoodItemIds = [...new Set(allFoodItemIds)];
    if (uniqueAllFoodItemIds.length > 0) {
      const existingCount = await foodItemRepository.countActiveByIds(uniqueAllFoodItemIds);
      if (existingCount !== uniqueAllFoodItemIds.length) {
        throw new AppError(
          "One or more food items not found",
          404,
          "FOOD_ITEM_NOT_FOUND",
        );
      }
    }

    const sortedDays = [...days].sort(
      (a, b) => DAY_OF_WEEK.indexOf(a.dayOfWeek) - DAY_OF_WEEK.indexOf(b.dayOfWeek),
    );

    await withTransaction(async (session) => {
      for (const dayObj of sortedDays) {
        const { dayOfWeek, foodItemIds } = dayObj;
        const menuItems = foodItemIds.map((id) => ({ foodItemId: id }));
        await scheduledMenuRepository.upsertByDay(dayOfWeek, menuItems, userId, { session });
      }
    });

    return this.getWeeklySchedule();
  },
};

export default scheduledMenuService;
