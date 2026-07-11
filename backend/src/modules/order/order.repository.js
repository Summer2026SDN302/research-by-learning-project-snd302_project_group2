import { toObjectId } from "../../shared/helpers/mongo.helper.js";
import Order from "./order.model.js";
import { ORDER_STATUS } from "./order.constants.js";

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
        .populate("items.foodItemId", "name") // Fix #7: populate để có tên món trong response
        .populate("staffId", "fullName username role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return { items, total };
  },

  async findById(id) {
    return Order.findOne({ _id: toObjectId(id) })
      .populate("items.foodItemId", "name")
      .populate("staffId", "fullName username role");
  },

  async updateStatusById(id, status, session) {
    return Order.findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: { orderStatus: status } },
      { new: true, runValidators: true, session },
    );
  },

  async countByFoodItemId(foodItemId) {
    return Order.countDocuments({
      "items.foodItemId": toObjectId(foodItemId),
    });
  },

  async findCompletedOrdersSince(date) {
    return Order.find({
      orderStatus: { $in: [ORDER_STATUS.COMPLETED] },
      orderDate: { $gte: date },
    });
  },

  async findIdsByOrderNumberKeyword(keyword) {
    const regex = new RegExp(keyword, "i");
    const orders = await Order.find({ orderNumber: regex }).select("_id");
    return orders.map((item) => item._id);
  },

  async findByOrderCodeInt(orderCode) {
    const regex = new RegExp(String(orderCode));
    return Order.findOne({ orderNumber: regex });
  },

  async updateItemsById(id, fields, session) {
    return Order.findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: fields },
      { new: true, runValidators: true, session },
    )
      .populate("items.foodItemId", "name")
      .populate("staffId", "fullName username role");
  },
};

export default orderRepository;
