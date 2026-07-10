import { toObjectId } from "../../shared/helpers/mongo.helper.js";
import Order from "./order.model.js";
import { ORDER_STATUS } from "./order.constants.js";

const orderRepository = {
  async countByFoodItemId(foodItemId) {
    return Order.countDocuments({
      "items.foodItemId": toObjectId(foodItemId),
    });
  },

  async findCompletedOrdersSince(date) {
    return Order.find({
      orderStatus: { $in: [ORDER_STATUS.COMPLETED] },
      createdAt: { $gte: date },
    });
  },
};

export default orderRepository;
