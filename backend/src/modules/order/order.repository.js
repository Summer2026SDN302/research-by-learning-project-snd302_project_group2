import { toObjectId } from "../../shared/helpers/mongo.helper.js";
import Order from "./order.model.js";

const parseToUTCMidnight = (dateString) => {
  const [year, month, day] = dateString.split("-");
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
};

/**
 * Tra ve dau ngay tiep theo (UTC midnight cua ngay + 1).
 * Dung cho $lt khi query "<= toDate" de bao gom toan bo ngay toDate.
 */
const parseToNextDayUTCMidnight = (dateString) => {
  const [year, month, day] = dateString.split("-");
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day) + 1));
};

const orderRepository = {
  async create(payload, session) {
    // Fix #3: nhan session tu transaction de dam bao rollback neu co loi
    const [order] = await Order.create([payload], { session });
    return order;
  },

  async findAll({ staffId, orderStatus, date, fromDate, toDate, page, limit }) {
    const filter = {};

    if (staffId) {
      filter.staffId = toObjectId(staffId);
    }

    if (orderStatus) {
      filter.orderStatus = orderStatus;
    }

    if (date) {
      filter.orderDate = parseToUTCMidnight(date);
    } else if (fromDate || toDate) {
      filter.orderDate = {};
      if (fromDate) filter.orderDate.$gte = parseToUTCMidnight(fromDate);
      // Dung $lt voi ngay tiep theo de bao gom toan bo ngay toDate
      // Vi du: toDate=2026-06-15 -> $lt 2026-06-16T00:00Z (dung)
      // Neu dung $lte 2026-06-15T00:00Z -> bo sot moi order tao sau midnight
      if (toDate) filter.orderDate.$lt = parseToNextDayUTCMidnight(toDate);
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Order.find(filter)
        .populate("items.foodItemId", "name") // Fix #7: populate de co ten mon trong response
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return { items, total };
  },

  async findById(id) {
    return Order.findOne({ _id: toObjectId(id) }).populate(
      "items.foodItemId",
      "name",
    );
  },

  async updateStatusById(id, status) {
    return Order.findOneAndUpdate(
      { _id: toObjectId(id) },
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
