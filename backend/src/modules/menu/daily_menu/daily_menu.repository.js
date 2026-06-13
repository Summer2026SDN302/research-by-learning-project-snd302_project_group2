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
};

export default dailyMenuRepository;
