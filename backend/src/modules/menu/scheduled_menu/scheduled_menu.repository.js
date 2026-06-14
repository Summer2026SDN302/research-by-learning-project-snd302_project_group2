import { toObjectId } from "../../../shared/helpers/mongo.helper.js";
import ScheduledMenu from "./scheduled_menu.model.js";

const scheduledMenuRepository = {
  async countByFoodItemId(foodItemId) {
    return ScheduledMenu.countDocuments({
      "menuItems.foodItemId": toObjectId(foodItemId),
    });
  },
  async findByDayOfWeek(dayOfWeek) {
    return ScheduledMenu.findOne({ dayOfWeek })
      .populate("menuItems.foodItemId")
      .populate("createdBy", "-passwordHash")
      .populate("updatedBy", "-passwordHash");
  },
};

export default scheduledMenuRepository;
