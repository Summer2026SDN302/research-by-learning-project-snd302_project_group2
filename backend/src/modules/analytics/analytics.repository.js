import Order from "../order/order.model.js";
import Payment from "../payment/payment.model.js";
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  TIMEZONE,
} from "./analytics.constants.js";
import {
  toEndOfDayVN,
  toStartOfDayVN,
} from "../../shared/helpers/analytics.helper.js";

const matchPaidPaymentsByCreatedAt = (fromDateStr, toDateStr) => ({
  paymentStatus: PAYMENT_STATUS.PAID,
  createdAt: {
    $gte: toStartOfDayVN(fromDateStr),
    $lte: toEndOfDayVN(toDateStr),
  },
});

// Orders are filtered by `createdAt` (always a real Date via timestamps)
// instead of `orderDate`, because legacy data stores `orderDate` with mixed
// BSON types (some String, some Date), which breaks string range matching.
const matchCompletedOrdersByDate = (fromDateStr, toDateStr) => ({
  orderStatus: ORDER_STATUS.COMPLETED,
  createdAt: {
    $gte: toStartOfDayVN(fromDateStr),
    $lte: toEndOfDayVN(toDateStr),
  },
});

const matchOrdersByDate = (fromDateStr, toDateStr) => ({
  createdAt: {
    $gte: toStartOfDayVN(fromDateStr),
    $lte: toEndOfDayVN(toDateStr),
  },
});

const buildPaymentDateMatch = (fromDateStr, toDateStr) => {
  if (fromDateStr === toDateStr) {
    return matchPaidPaymentsByCreatedAt(fromDateStr, toDateStr);
  }

  return {
    paymentStatus: PAYMENT_STATUS.PAID,
    createdAt: {
      $gte: toStartOfDayVN(fromDateStr),
      $lte: toEndOfDayVN(toDateStr),
    },
  };
};

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
    const regex = new RegExp(filters.search.trim(), "i");
    match.$or = [{ paymentNumber: regex }, { transactionCode: regex }];
  }

  return match;
};

export const countPaidPayments = () =>
  Payment.countDocuments({ paymentStatus: PAYMENT_STATUS.PAID });

export const countCompletedOrders = () =>
  Order.countDocuments({ orderStatus: ORDER_STATUS.COMPLETED });

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
    { $match: matchCompletedOrdersByDate(dateStr, dateStr) },
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
    { $match: matchCompletedOrdersByDate(from, to) },
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
    { $match: matchCompletedOrdersByDate(from, to) },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
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

export const getTopFoods = async ({ from, to, limit, sortBy }) => {
  const sortField = sortBy === "revenue" ? "revenue" : "quantity";

  return Order.aggregate([
    { $match: matchCompletedOrdersByDate(from, to) },
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
        imageUrl: { $literal: null },
      },
    },
  ]);
};

export const getOrdersByStatus = async (from, to) =>
  Order.aggregate([
    { $match: matchOrdersByDate(from, to) },
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
        paidAt: "$createdAt",
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
    pipeline.push({ $limit: 10_000 });
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
