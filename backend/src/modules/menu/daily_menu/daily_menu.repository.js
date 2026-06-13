import { toObjectId } from "../../../shared/helpers/mongo.helper.js";
import DailyMenu from "./daily_menu.model.js";

const dailyMenuRepository = {
  async countByFoodItemId(foodItemId) {
    return DailyMenu.countDocuments({
      "items.foodItemId": toObjectId(foodItemId),
    });
  },

  async countActiveByFoodItemId(foodItemId, fromDate) {
    return DailyMenu.countDocuments({
      date: { $gte: fromDate },
      items: {
        $elemMatch: {
          foodItemId: toObjectId(foodItemId),
          status: "Available",
        },
      },
    });
  },

  async findByDate(dateString) {
    return DailyMenu.findOne({ date: dateString });
  },

  async deductSoldQuantity(dateString, foodItemId, quantity) {
    return DailyMenu.findOneAndUpdate(
      {
        date: dateString,
        "items.foodItemId": toObjectId(foodItemId),
      },
      {
        $inc: {
          "items.$.soldQuantity": quantity,
          "items.$.remainingQuantity": -quantity,
        },
      },
      { new: true },
    );
  },
};

export default dailyMenuRepository;

