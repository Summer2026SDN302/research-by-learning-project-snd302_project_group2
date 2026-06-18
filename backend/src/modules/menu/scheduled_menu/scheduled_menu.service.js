import AppError from "../../../shared/exceptions/AppError.js";
import { toObjectId } from "../../../shared/helpers/mongo.helper.js";
import FoodItem from "../food_item/food_item.model.js";
import scheduledMenuRepository from "./scheduled_menu.repository.js";
import { DAY_OF_WEEK } from "./scheduled_menu.constants.js";

const scheduledMenuService = {
  async getWeeklySchedule() {
    const docs = await scheduledMenuRepository.findAll();

    const docMap = {};
    docs.forEach((doc) => {
      docMap[doc.dayOfWeek] = doc;
    });

    return DAY_OF_WEEK.map((day) =>
      docMap[day] ?? { dayOfWeek: day, menuItems: [] },
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
      const existingCount = await FoodItem.countDocuments({
        _id: { $in: foodItemIds.map(toObjectId) },
        deletedAt: null,
      });

      if (existingCount !== foodItemIds.length) {
        throw new AppError(
          "One or more food items not found",
          404,
          "FOOD_ITEM_NOT_FOUND",
        );
      }
    }

    const menuItems = foodItemIds.map((id) => ({ foodItemId: id }));

    return scheduledMenuRepository.upsertByDay(day, menuItems, userId);
  },
};

export default scheduledMenuService;
