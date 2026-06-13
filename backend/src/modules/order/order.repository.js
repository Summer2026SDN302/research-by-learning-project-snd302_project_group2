import { toObjectId } from "../../shared/helpers/mongo.helper.js";
import Order from "./order.model.js";

const orderRepository = {
  async create(payload) {
    return Order.create(payload);
  },

  async findAll({ staffId, orderStatus, date, page, limit }) {
    const filter = { deletedAt: null };

    if (staffId) {
      filter.staffId = toObjectId(staffId);
    }

    if (orderStatus) {
      filter.orderStatus = orderStatus;
    }

    if (date) {
      filter.orderDate = date;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    return { items, total };
  },

  async findById(id) {
    return Order.findOne({ _id: toObjectId(id), deletedAt: null });
  },

  async updateStatusById(id, status) {
    return Order.findOneAndUpdate(
      { _id: toObjectId(id), deletedAt: null },
      { $set: { orderStatus: status } },
      { new: true, runValidators: true },
    );
  },

  async countByFoodItemId(foodItemId) {
    return Order.countDocuments({
      "items.foodItemId": toObjectId(foodItemId),
    });
  },
};

export default orderRepository;

