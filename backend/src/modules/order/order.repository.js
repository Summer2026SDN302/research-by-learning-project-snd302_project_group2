import { toObjectId } from "../../shared/helpers/mongo.helper.js";
import Order from "./order.model.js";

const orderRepository = {
  async countByFoodItemId(foodItemId) {
    return Order.countDocuments({
      "items.foodItemId": toObjectId(foodItemId),
    });
  },
};

export default orderRepository;
