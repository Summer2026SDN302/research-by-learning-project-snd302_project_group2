import AppError from "../../../shared/exceptions/AppError.js";
import foodItemRepository from "../food_item/food_item.repository.js";
import scheduledMenuRepository from "./scheduled_menu.repository.js";
import { DAY_OF_WEEK } from "./scheduled_menu.constants.js";
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
};

export default scheduledMenuService;
