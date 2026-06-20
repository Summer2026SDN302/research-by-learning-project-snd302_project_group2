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
    return DailyMenu.findOne({ date: dateString }).populate(
      "items.foodItemId",
      "name",
    );
  },

  async deductSoldQuantity(dateString, foodItemId, quantity, session) {
    const result = await DailyMenu.findOneAndUpdate(
      {
        date: dateString,
        items: {
          $elemMatch: {
            foodItemId: toObjectId(foodItemId),
            remainingQuantity: { $gte: quantity }, // atomic guard — chỉ update khi còn đủ hàng
          },
        },
      },
      {
        $inc: {
          "items.$.soldQuantity": quantity,
          "items.$.remainingQuantity": -quantity,
        },
      },
      { new: true, session },
    );
    return result;
  },
};

export default dailyMenuRepository;

