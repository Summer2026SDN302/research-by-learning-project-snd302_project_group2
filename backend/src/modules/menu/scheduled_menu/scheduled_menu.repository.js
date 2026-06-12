import { toObjectId } from "../../../shared/helpers/mongo.helper.js";
import ScheduledMenu from "./scheduled_menu.model.js";

const scheduledMenuRepository = {
  async countByFoodItemId(foodItemId) {
    return ScheduledMenu.countDocuments({
      "menuItems.foodItemId": toObjectId(foodItemId),
    });
  },
};

export default scheduledMenuRepository;
