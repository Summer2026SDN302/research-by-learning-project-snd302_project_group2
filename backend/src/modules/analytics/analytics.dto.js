import {
  calcPercentChange,
  getWeekdayLabel,
  roundAmount,
} from "../../shared/helpers/analytics.helper.js";
import { CHART_RANGE } from "./analytics.constants.js";

export const toDashboardSummaryDto = ({
  date,
  todayStats,
  yesterdayStats,
  chartPoints,
  topFoods,
  chartRange,
}) => {
  const todayRevenue = roundAmount(todayStats.revenue);
  const yesterdayRevenue = roundAmount(yesterdayStats.revenue);
  const todayOrderCount = todayStats.orderCount;
  const yesterdayOrderCount = yesterdayStats.orderCount;
  const averageOrderValue =
    todayOrderCount === 0
      ? 0
      : roundAmount(todayRevenue / todayOrderCount);
  const yesterdayAverage =
    yesterdayOrderCount === 0
      ? 0
      : roundAmount(yesterdayRevenue / yesterdayOrderCount);

  return {
    meta: {
      date,
      generatedAt: new Date().toISOString(),
    },
    kpis: {
      todayRevenue,
      revenueChangePercent: calcPercentChange(todayRevenue, yesterdayRevenue),
      todayOrderCount,
      orderCountDelta: todayOrderCount - yesterdayOrderCount,
      averageOrderValue,
      averageOrderValueChangePercent: calcPercentChange(
        averageOrderValue,
        yesterdayAverage,
      ),
    },
    revenueChart: {
      range: chartRange,
      labels: chartPoints.map((point) => getWeekdayLabel(point.date)),
      values: chartPoints.map((point) => roundAmount(point.revenue)),
      unit: "VND",
    },
    topFoods: topFoods.map((item, index) => toTopFoodItemDto(item, index + 1)),
  };
};

export const toRevenueChartDto = ({ range, from, to, points }) => {
  const mappedPoints = points.map((point) => ({
    date: point.date,
    label: getWeekdayLabel(point.date),
    revenue: roundAmount(point.revenue),
    orderCount: point.orderCount,
  }));

  return {
    range,
    from,
    to,
    points: mappedPoints,
    totalRevenue: mappedPoints.reduce((sum, point) => sum + point.revenue, 0),
    unit: "VND",
  };
};

export const toTopFoodItemDto = (item, rank) => ({
  rank,
  foodItemId: item.foodItemId,
  name: item.name,
  imageUrl: item.imageUrl ?? null,
  quantity: item.quantity,
  revenue: roundAmount(item.revenue),
  changePercent: item.changePercent ?? null,
});

export const toTopFoodsDto = (items, period) => ({
  items: items.map((item, index) => toTopFoodItemDto(item, index + 1)),
  period,
});

export const toSalesTrendDto = ({ current, previous }) => ({
  current: {
    from: current.from,
    to: current.to,
    revenue: roundAmount(current.revenue),
    orderCount: current.orderCount,
    averageOrderValue:
      current.orderCount === 0
        ? 0
        : roundAmount(current.revenue / current.orderCount),
  },
  previous: {
    from: previous.from,
    to: previous.to,
    revenue: roundAmount(previous.revenue),
    orderCount: previous.orderCount,
    averageOrderValue:
      previous.orderCount === 0
        ? 0
        : roundAmount(previous.revenue / previous.orderCount),
  },
  changes: {
    revenuePercent: calcPercentChange(current.revenue, previous.revenue),
    orderCountDelta: current.orderCount - previous.orderCount,
    averageOrderValuePercent: calcPercentChange(
      current.orderCount === 0 ? 0 : current.revenue / current.orderCount,
      previous.orderCount === 0 ? 0 : previous.revenue / previous.orderCount,
    ),
  },
});

export const toOrderStatisticsDto = ({
  from,
  to,
  byStatus,
  byPaymentMethod,
  paymentStats,
  totals,
}) => ({
  period: { from, to },
  totals: {
    orderCount: totals.orderCount,
    completedCount: totals.completedCount,
    cancelledCount: totals.cancelledCount,
    returnedCount: totals.returnedCount,
    totalRevenue: roundAmount(totals.totalRevenue),
  },
  byStatus: byStatus.map((row) => ({
    status: row.status,
    count: row.count,
    revenue: roundAmount(row.revenue),
  })),
  byPaymentMethod: byPaymentMethod.map((row) => ({
    method: row.method,
    count: row.count,
    amount: roundAmount(row.amount),
  })),
  payments: {
    successCount: paymentStats.successCount,
    pendingCount: paymentStats.pendingCount,
    failedCount: paymentStats.failedCount,
    successRate: paymentStats.successRate,
  },
});

export const toTransactionItemDto = (item) => ({
  _id: item._id,
  paymentNumber: item.paymentNumber,
  orderId: item.orderId,
  orderNumber: item.orderNumber ?? null,
  paidAt: item.paidAt,
  paymentMethod: item.paymentMethod,
  finalAmount: roundAmount(item.finalAmount),
  paymentStatus: item.paymentStatus,
  transactionCode: item.transactionCode ?? null,
});

export const toTransactionReportDto = ({
  summary,
  items,
  pagination,
  revenueChangePercent,
}) => ({
  summary: {
    totalRevenue: roundAmount(summary.totalRevenue),
    revenueChangePercent,
    successCount: summary.successCount,
    pendingCount: summary.pendingCount,
    successRate: summary.successRate,
  },
  items: items.map(toTransactionItemDto),
  pagination,
});

export const getDefaultChartRange = (value) => value ?? CHART_RANGE.SEVEN_DAYS;
