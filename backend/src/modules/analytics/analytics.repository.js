import Order from "../order/order.model.js";
import Payment from "../payment/payment.model.js";
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  TIMEZONE,
  EXPORT_MAX_ROWS,
} from "./analytics.constants.js";
import {
  toEndOfDayVN,
  toStartOfDayVN,
} from "../../shared/helpers/analytics.helper.js";

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const matchPaidPaymentsByCreatedAt = (fromDateStr, toDateStr) => ({
  paymentStatus: PAYMENT_STATUS.PAID,
  createdAt: {
    $gte: toStartOfDayVN(fromDateStr),
    $lte: toEndOfDayVN(toDateStr),
  },
});

const matchCompletedOrdersByOrderDate = (fromDateStr, toDateStr) => ({
  orderStatus: ORDER_STATUS.COMPLETED,
  orderDate: {
    $gte: toStartOfDayVN(fromDateStr),
    $lte: toEndOfDayVN(toDateStr),
  },
});

const buildPaymentDateMatch = (fromDateStr, toDateStr) =>
  matchPaidPaymentsByCreatedAt(fromDateStr, toDateStr);

const buildPaymentFilterMatch = (filters = {}) => {
  const match = {};

  if (filters.status) {
    match.paymentStatus = filters.status;
  }

  if (filters.paymentMethod) {
    match.paymentMethod = filters.paymentMethod;
  }

  if (filters.from || filters.to) {
    const from = filters.from ?? filters.to;
    const to = filters.to ?? filters.from;
    match.createdAt = {
      $gte: toStartOfDayVN(from),
      $lte: toEndOfDayVN(to),
    };
  }

  if (filters.search) {
    const escapedSearch = escapeRegExp(filters.search.trim());
    const regex = new RegExp(escapedSearch, "i");
    match.$or = [{ paymentNumber: regex }, { transactionCode: regex }];
  }

  return match;
};

export const countPaidPayments = (from, to) => {
  const query = { paymentStatus: PAYMENT_STATUS.PAID };
  if (from || to) {
    query.createdAt = {};
    if (from) {
      query.createdAt.$gte = toStartOfDayVN(from);
    }
    if (to) {
      query.createdAt.$lte = toEndOfDayVN(to);
    }
  }
  return Payment.countDocuments(query);
};

export const sumRevenueForDate = async (dateStr, source) => {
  if (source === "payment") {
    const [result] = await Payment.aggregate([
      { $match: matchPaidPaymentsByCreatedAt(dateStr, dateStr) },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$finalAmount" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    return {
      revenue: result?.revenue ?? 0,
      orderCount: result?.orderCount ?? 0,
    };
  }

  const [result] = await Order.aggregate([
    {
      $match: {
        orderStatus: ORDER_STATUS.COMPLETED,
        orderDate: {
          $gte: toStartOfDayVN(dateStr),
          $lte: toEndOfDayVN(dateStr),
        },
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: "$totalAmount" },
        orderCount: { $sum: 1 },
      },
    },
  ]);

  return {
    revenue: result?.revenue ?? 0,
    orderCount: result?.orderCount ?? 0,
  };
};

export const sumRevenueByDateRange = async (from, to, source) => {
  if (source === "payment") {
    const [result] = await Payment.aggregate([
      { $match: buildPaymentDateMatch(from, to) },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$finalAmount" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    return {
      revenue: result?.revenue ?? 0,
      orderCount: result?.orderCount ?? 0,
    };
  }

  const [result] = await Order.aggregate([
    { $match: matchCompletedOrdersByOrderDate(from, to) },
    {
      $group: {
        _id: null,
        revenue: { $sum: "$totalAmount" },
        orderCount: { $sum: 1 },
      },
    },
  ]);

  return {
    revenue: result?.revenue ?? 0,
    orderCount: result?.orderCount ?? 0,
  };
};

export const getRevenueGroupedByDay = async (from, to, source) => {
  if (source === "payment") {
    const rows = await Payment.aggregate([
      { $match: buildPaymentDateMatch(from, to) },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: TIMEZONE,
            },
          },
          revenue: { $sum: "$finalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return rows.map((row) => ({
      date: row._id,
      revenue: row.revenue,
      orderCount: row.orderCount,
    }));
  }

  const rows = await Order.aggregate([
    { $match: matchCompletedOrdersByOrderDate(from, to) },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$orderDate",
            timezone: TIMEZONE,
          },
        },
        revenue: { $sum: "$totalAmount" },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return rows.map((row) => ({
    date: row._id,
    revenue: row.revenue,
    orderCount: row.orderCount,
  }));
};

export const getTopFoods = async ({ from, to, limit, sortBy, source }) => {
  const sortField = sortBy === "revenue" ? "revenue" : "quantity";

  if (source === "payment") {
    return Payment.aggregate([
      { $match: buildPaymentDateMatch(from, to) },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      { $unwind: "$order.items" },
      {
        $group: {
          _id: "$order.items.foodItemId",
          name: { $first: "$order.items.name" },
          quantity: { $sum: "$order.items.quantity" },
          revenue: {
            $sum: { $multiply: ["$order.items.quantity", "$order.items.unitPrice"] },
          },
        },
      },
      { $sort: { [sortField]: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          foodItemId: "$_id",
          name: 1,
          quantity: 1,
          revenue: 1,
        },
      },
    ]);
  }

  return Order.aggregate([
    { $match: matchCompletedOrdersByOrderDate(from, to) },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.foodItemId",
        name: { $first: "$items.name" },
        quantity: { $sum: "$items.quantity" },
        revenue: {
          $sum: { $multiply: ["$items.quantity", "$items.unitPrice"] },
        },
      },
    },
    { $sort: { [sortField]: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        foodItemId: "$_id",
        name: 1,
        quantity: 1,
        revenue: 1,
      },
    },
  ]);
};

export const getOrdersByStatus = async (from, to) =>
  Order.aggregate([
    {
      $match: {
        orderDate: {
          $gte: toStartOfDayVN(from),
          $lte: toEndOfDayVN(to),
        },
      },
    },
    {
      $group: {
        _id: "$orderStatus",
        count: { $sum: 1 },
        revenue: {
          $sum: {
            $cond: [
              { $eq: ["$orderStatus", ORDER_STATUS.COMPLETED] },
              "$totalAmount",
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        status: "$_id",
        count: 1,
        revenue: 1,
      },
    },
    { $sort: { status: 1 } },
  ]);

export const getPaymentsByMethod = async (from, to) => {
  const match = {
    paymentStatus: PAYMENT_STATUS.PAID,
    createdAt: {
      $gte: toStartOfDayVN(from),
      $lte: toEndOfDayVN(to),
    },
  };

  return Payment.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$paymentMethod",
        count: { $sum: 1 },
        amount: { $sum: "$finalAmount" },
      },
    },
    {
      $project: {
        _id: 0,
        method: "$_id",
        count: 1,
        amount: 1,
      },
    },
    { $sort: { method: 1 } },
  ]);
};

export const getPaymentStats = async (from, to) => {
  const match = {
    createdAt: {
      $gte: toStartOfDayVN(from),
      $lte: toEndOfDayVN(to),
    },
  };

  const rows = await Payment.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$paymentStatus",
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = rows.reduce(
    (acc, row) => {
      acc[row._id] = row.count;
      return acc;
    },
    {},
  );

  const successCount = counts[PAYMENT_STATUS.PAID] ?? 0;
  const pendingCount = counts[PAYMENT_STATUS.PENDING] ?? 0;
  const failedCount = counts[PAYMENT_STATUS.FAILED] ?? 0;
  const resolved = successCount + failedCount;
  const successRate =
    resolved === 0 ? 0 : Math.round((successCount / resolved) * 1000) / 10;

  return {
    successCount,
    pendingCount,
    failedCount,
    successRate,
  };
};

const buildTransactionPipeline = (filters, pagination) => {
  const match = buildPaymentFilterMatch(filters);
  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: "orders",
        localField: "orderId",
        foreignField: "_id",
        as: "order",
      },
    },
    { $unwind: { path: "$order", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        paymentNumber: 1,
        orderId: 1,
        orderNumber: "$order.orderNumber",
        paidAt: {
          $cond: {
            if: { $in: ["$paymentStatus", ["Paid", "Refunded"]] },
            then: { $ifNull: ["$updatedAt", "$createdAt"] },
            else: null,
          },
        },
        paymentMethod: 1,
        finalAmount: 1,
        paymentStatus: 1,
        transactionCode: 1,
      },
    },
    { $sort: { paidAt: -1 } },
  ];

  if (pagination) {
    const skip = (pagination.page - 1) * pagination.limit;
    pipeline.push({ $skip: skip }, { $limit: pagination.limit });
  } else {
    pipeline.push({ $limit: EXPORT_MAX_ROWS + 1 });
  }

  return pipeline;
};

export const findTransactions = async (filters, page, limit) => {
  const match = buildPaymentFilterMatch(filters);
  const [total, items] = await Promise.all([
    Payment.countDocuments(match),
    Payment.aggregate(buildTransactionPipeline(filters, { page, limit })),
  ]);

  return { items, total };
};

export const findTransactionsForExport = (filters) =>
  Payment.aggregate(buildTransactionPipeline(filters));

export const getTransactionSummary = async (filters) => {
  const match = buildPaymentFilterMatch(filters);

  const [paidStats, statusRows] = await Promise.all([
    Payment.aggregate([
      {
        $match: {
          ...match,
          paymentStatus: PAYMENT_STATUS.PAID,
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$finalAmount" },
          successCount: { $sum: 1 },
        },
      },
    ]),
    Payment.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const statusMap = statusRows.reduce((acc, row) => {
    acc[row._id] = row.count;
    return acc;
  }, {});

  const successCount = statusMap[PAYMENT_STATUS.PAID] ?? 0;
  const pendingCount = statusMap[PAYMENT_STATUS.PENDING] ?? 0;
  const failedCount = statusMap[PAYMENT_STATUS.FAILED] ?? 0;
  const resolved = successCount + failedCount;

  return {
    totalRevenue: paidStats[0]?.totalRevenue ?? 0,
    successCount,
    pendingCount,
    successRate:
      resolved === 0 ? 0 : Math.round((successCount / resolved) * 1000) / 10,
  };
};

export const getRevenueGroupedByHour = async (dateStr, source) => {
  if (source === "payment") {
    const rows = await Payment.aggregate([
      { $match: buildPaymentDateMatch(dateStr, dateStr) },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%H:00",
              date: "$createdAt",
              timezone: TIMEZONE,
            },
          },
          revenue: { $sum: "$finalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return rows.map((row) => ({
      hour: row._id,
      revenue: row.revenue,
      orderCount: row.orderCount,
    }));
  }

  const rows = await Order.aggregate([
    { $match: matchCompletedOrdersByOrderDate(dateStr, dateStr) },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%H:00",
            date: "$orderDate",
            timezone: TIMEZONE,
          },
        },
        revenue: { $sum: "$totalAmount" },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return rows.map((row) => ({
    hour: row._id,
    revenue: row.revenue,
    orderCount: row.orderCount,
  }));
};

export const countOrdersByStatus = (status) => {
  return Order.countDocuments({ orderStatus: status });
};

export const countCompletedOrdersForDateRange = (from, to) => {
  return Order.countDocuments({
    orderStatus: ORDER_STATUS.COMPLETED,
    orderDate: {
      $gte: toStartOfDayVN(from),
      $lte: toEndOfDayVN(to),
    },
  });
};
