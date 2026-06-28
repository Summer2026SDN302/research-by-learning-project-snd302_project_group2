import { toObjectId } from "../../shared/helpers/mongo.helper.js";
import Order from "./order.model.js";

const parseToUTCMidnight = (dateString) => {
  const [year, month, day] = dateString.split("-");
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
};

const parseToNextDayUTCMidnight = (dateString) => {
  const [year, month, day] = dateString.split("-");
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day) + 1));
};

const applyDefaultPopulates = (query) =>
  query
    .populate("items.foodItemId", "name")
    .populate("staffId", "username fullName role");

const buildBaseFilter = ({
  staffId,
  orderStatus,
  date,
  fromDate,
  toDate,
  orderIds = null,
}) => {
  const filter = {};

  if (staffId) {
    filter.staffId = toObjectId(staffId);
  }

  if (orderStatus) {
    filter.orderStatus = orderStatus;
  }

  if (Array.isArray(orderIds)) {
    if (orderIds.length === 0) {
      filter._id = { $in: [] };
    } else {
      filter._id = { $in: orderIds.map(toObjectId) };
    }
  }

  if (date) {
    filter.orderDate = parseToUTCMidnight(date);
  } else if (fromDate || toDate) {
    filter.orderDate = {};

    if (fromDate) {
      filter.orderDate.$gte = parseToUTCMidnight(fromDate);
    }

    if (toDate) {
      filter.orderDate.$lt = parseToNextDayUTCMidnight(toDate);
    }
  }

  return filter;
};

const orderRepository = {
  async create(payload, session) {
    const [order] = await Order.create([payload], session ? { session } : {});
    return order;
  },

  async findAll({
    staffId,
    orderStatus,
    date,
    fromDate,
    toDate,
    page,
    limit,
  }) {
    const filter = buildBaseFilter({
      staffId,
      orderStatus,
      date,
      fromDate,
      toDate,
    });

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      applyDefaultPopulates(
        Order.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
      ),
      Order.countDocuments(filter),
    ]);

    return { items, total };
  },

  async findMatching({
    staffId,
    orderStatus,
    date,
    fromDate,
    toDate,
    orderIds = null,
    session = null,
  }) {
    const query = applyDefaultPopulates(
      Order.find(
        buildBaseFilter({
          staffId,
          orderStatus,
          date,
          fromDate,
          toDate,
          orderIds,
        }),
      ).sort({ createdAt: -1 }),
    );

    if (session) {
      query.session(session);
    }

    return query;
  },

  async findById(id, { session = null } = {}) {
    const query = applyDefaultPopulates(Order.findOne({ _id: toObjectId(id) }));

    if (session) {
      query.session(session);
    }

    return query;
  },

  async findIdsByOrderNumberKeyword(keyword) {
    const regex = new RegExp(keyword, "i");
    const orders = await Order.find({ orderNumber: regex }).select("_id");
    return orders.map((item) => item._id);
  },

  async updateStatusById(id, status, session = null) {
    return Order.findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: { orderStatus: status } },
      { new: true, runValidators: true, session },
    );
  },

  async updateById(id, updates, session = null) {
    const query = applyDefaultPopulates(
      Order.findOneAndUpdate(
        { _id: toObjectId(id) },
        { $set: updates },
        { new: true, runValidators: true },
      ),
    );

    if (session) {
      query.session(session);
    }

    return query;
  },

  async countByFoodItemId(foodItemId) {
    return Order.countDocuments({
      "items.foodItemId": toObjectId(foodItemId),
    });
  },
};

export default orderRepository;
