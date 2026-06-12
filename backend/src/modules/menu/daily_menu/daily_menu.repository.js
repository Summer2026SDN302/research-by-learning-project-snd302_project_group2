import { toObjectId } from "../../../shared/helpers/mongo.helper.js";
import DailyMenu from "./daily_menu.model.js";

const dailyMenuRepository = {
  async countByFoodItemId(foodItemId) {
    return DailyMenu.countDocuments({
      "items.foodItemId": toObjectId(foodItemId),
    });
  },
};

export default dailyMenuRepository;
