import AppError from "../../shared/exceptions/AppError.js";
import {
  calcPercentChange,
  escapeCsvValue,
  fillMissingDates,
  formatVNDateTime,
  getPreviousPeriod,
  parseChartRange,
  parseDateRange,
  parseTrendPeriod,
  roundAmount,
  subtractDays,
  validateDateString,
} from "../../shared/helpers/analytics.helper.js";
import { getTodayVNDateString } from "../../shared/helpers/date.helper.js";
import { buildPaginationMeta } from "../../shared/helpers/pagination.helper.js";
import {
  parsePagination,
  parseSearchQuery,
} from "../../shared/helpers/query.helper.js";
import {
  CHART_RANGE,
  DEFAULT_PAGE_LIMIT,
  DEFAULT_TOP_FOODS_LIMIT,
  EXPORT_MAX_ROWS,
  MAX_PAGE_LIMIT,
  MAX_TOP_FOODS_LIMIT,
  REVENUE_SOURCE,
  TOP_FOODS_SORT,
} from "./analytics.constants.js";
import * as analyticsDto from "./analytics.dto.js";
import * as analyticsRepository from "./analytics.repository.js";

// Revenue is read from whichever real dataset has more records. The payment
// table is the preferred source, but if completed orders outnumber paid
// payments (the current real data), revenue falls back to orders so the
// dashboard reflects actual sales instead of a near-empty payment table.
const resolveRevenueSource = async () => {
  const [paidPayments, completedOrders] = await Promise.all([
    analyticsRepository.countPaidPayments(),
    analyticsRepository.countCompletedOrders(),
  ]);

  return paidPayments >= completedOrders
    ? REVENUE_SOURCE.PAYMENT
    : REVENUE_SOURCE.ORDER;
};

const buildTopFoodsWithChange = async (refDate, limit) => {
  const to = refDate;
  const from = subtractDays(refDate, 6);
  const { from: prevFrom, to: prevTo } = getPreviousPeriod(from, to);

  const [currentItems, previousItems] = await Promise.all([
    analyticsRepository.getTopFoods({
      from,
      to,
      limit,
      sortBy: TOP_FOODS_SORT.QUANTITY,
    }),
    analyticsRepository.getTopFoods({
      from: prevFrom,
      to: prevTo,
      limit: 100,
      sortBy: TOP_FOODS_SORT.QUANTITY,
    }),
  ]);

  const previousMap = new Map(
    previousItems.map((item) => [String(item.foodItemId), item.quantity]),
  );

  return currentItems.map((item) => {
    const prevQty = previousMap.get(String(item.foodItemId)) ?? 0;
    return {
      ...item,
      changePercent: calcPercentChange(item.quantity, prevQty),
    };
  });
};

const buildChartData = async (chartRange, refDate, source) => {
  const { from, to } = parseChartRange(chartRange, refDate);
  const points = await analyticsRepository.getRevenueGroupedByDay(from, to, source);
  return fillMissingDates(points, from, to);
};

const clampLimit = (value, defaultValue, maxValue) => {
  const parsed = Number(value ?? defaultValue);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return defaultValue;
  }
  return Math.min(Math.floor(parsed), maxValue);
};

const normalizeTopFoodsQuery = (query) => {
  const refDate = query.to ?? getTodayVNDateString();
  if (query.to) {
    validateDateString(query.to, "to");
  }
  if (query.from) {
    validateDateString(query.from, "from");
  }

  const from = query.from ?? subtractDays(refDate, 6);
  const to = query.to ?? refDate;

  if (from > to) {
    throw new AppError("from must be before or equal to to", 400, "VALIDATION_ERROR");
  }

  return {
    from,
    to,
    limit: clampLimit(query.limit, DEFAULT_TOP_FOODS_LIMIT, MAX_TOP_FOODS_LIMIT),
    sortBy: query.sortBy === TOP_FOODS_SORT.REVENUE
      ? TOP_FOODS_SORT.REVENUE
      : TOP_FOODS_SORT.QUANTITY,
  };
};

const normalizeTransactionFilters = (query) => ({
  status: query.status || undefined,
  paymentMethod: query.paymentMethod || undefined,
  from: query.from || undefined,
  to: query.to || undefined,
  search: parseSearchQuery(query.search),
});

const computeOrderTotals = (rows) => {
  const totals = {
    orderCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    returnedCount: 0,
    totalRevenue: 0,
  };

  for (const row of rows) {
    totals.orderCount += row.count;

    if (row.status === "Completed") {
      totals.completedCount += row.count;
      totals.totalRevenue += row.revenue;
    } else if (row.status === "Cancelled") {
      totals.cancelledCount += row.count;
    } else if (row.status === "Returned") {
      totals.returnedCount += row.count;
    }
  }

  return totals;
};

export const getDashboardSummary = async (query = {}) => {
  const refDate = query.date ?? getTodayVNDateString();
  if (query.date) {
    validateDateString(query.date, "date");
  }

  const chartRange = analyticsDto.getDefaultChartRange(query.chartRange);
  const topFoodsLimit = clampLimit(
    query.topFoodsLimit,
    DEFAULT_TOP_FOODS_LIMIT,
    MAX_TOP_FOODS_LIMIT,
  );
  const yesterday = subtractDays(refDate, 1);
  const source = await resolveRevenueSource();

  const [todayStats, yesterdayStats, chartPoints, topFoods] = await Promise.all([
    analyticsRepository.sumRevenueForDate(refDate, source),
    analyticsRepository.sumRevenueForDate(yesterday, source),
    buildChartData(chartRange, refDate, source),
    buildTopFoodsWithChange(refDate, topFoodsLimit),
  ]);

  return analyticsDto.toDashboardSummaryDto({
    date: refDate,
    todayStats,
    yesterdayStats,
    chartPoints,
    topFoods,
    chartRange,
  });
};

export const getRevenueChart = async (query = {}) => {
  const refDate = query.to ?? query.date ?? getTodayVNDateString();
  const range = query.range ?? CHART_RANGE.SEVEN_DAYS;
  const source = await resolveRevenueSource();

  let from;
  let to;

  if (query.from && query.to) {
    validateDateString(query.from, "from");
    validateDateString(query.to, "to");
    from = query.from;
    to = query.to;
  } else {
    ({ from, to } = parseChartRange(range, refDate));
  }

  if (from > to) {
    throw new AppError("from must be before or equal to to", 400, "VALIDATION_ERROR");
  }

  const points = fillMissingDates(
    await analyticsRepository.getRevenueGroupedByDay(from, to, source),
    from,
    to,
  );

  return analyticsDto.toRevenueChartDto({ range, from, to, points });
};

export const getTopFoods = async (query = {}) => {
  const { from, to, limit, sortBy } = normalizeTopFoodsQuery(query);
  const { from: prevFrom, to: prevTo } = getPreviousPeriod(from, to);

  const [currentItems, previousItems] = await Promise.all([
    analyticsRepository.getTopFoods({ from, to, limit, sortBy }),
    analyticsRepository.getTopFoods({
      from: prevFrom,
      to: prevTo,
      limit: 100,
      sortBy,
    }),
  ]);

  const previousMap = new Map(
    previousItems.map((item) => [
      String(item.foodItemId),
      sortBy === TOP_FOODS_SORT.REVENUE ? item.revenue : item.quantity,
    ]),
  );

  const items = currentItems.map((item) => {
    const currentValue =
      sortBy === TOP_FOODS_SORT.REVENUE ? item.revenue : item.quantity;
    const previousValue = previousMap.get(String(item.foodItemId)) ?? 0;

    return {
      ...item,
      changePercent: calcPercentChange(currentValue, previousValue),
    };
  });

  return analyticsDto.toTopFoodsDto(items, { from, to });
};

export const getSalesTrend = async (query = {}) => {
  const refDate = query.date ?? getTodayVNDateString();
  if (query.date) {
    validateDateString(query.date, "date");
  }

  const period = query.period ?? "day";
  const currentRange = parseTrendPeriod(period, refDate);
  const previousRange = getPreviousPeriod(currentRange.from, currentRange.to);
  const source = await resolveRevenueSource();

  const [current, previous] = await Promise.all([
    analyticsRepository.sumRevenueByDateRange(
      currentRange.from,
      currentRange.to,
      source,
    ),
    analyticsRepository.sumRevenueByDateRange(
      previousRange.from,
      previousRange.to,
      source,
    ),
  ]);

  return analyticsDto.toSalesTrendDto({
    current: { ...currentRange, ...current },
    previous: { ...previousRange, ...previous },
  });
};

export const getOrderStatistics = async (query = {}) => {
  const { from, to } = parseDateRange({
    from: query.from,
    to: query.to,
    date: query.date,
  });

  const [byStatus, byPaymentMethod, paymentStats, rangeRevenue] =
    await Promise.all([
      analyticsRepository.getOrdersByStatus(from, to),
      analyticsRepository.getPaymentsByMethod(from, to),
      analyticsRepository.getPaymentStats(from, to),
      analyticsRepository.sumRevenueByDateRange(
        from,
        to,
        await resolveRevenueSource(),
      ),
    ]);

  const totals = computeOrderTotals(byStatus);
  totals.totalRevenue = rangeRevenue.revenue;

  return analyticsDto.toOrderStatisticsDto({
    from,
    to,
    byStatus,
    byPaymentMethod,
    paymentStats,
    totals,
  });
};

export const getTransactionReport = async (query = {}) => {
  const { page, limit } = parsePagination(query, {
    defaultLimit: DEFAULT_PAGE_LIMIT,
    maxLimit: MAX_PAGE_LIMIT,
  });
  const filters = normalizeTransactionFilters(query);

  if (filters.from) {
    validateDateString(filters.from, "from");
  }
  if (filters.to) {
    validateDateString(filters.to, "to");
  }
  if (filters.from && filters.to && filters.from > filters.to) {
    throw new AppError("from must be before or equal to to", 400, "VALIDATION_ERROR");
  }

  const [{ items, total }, summary] = await Promise.all([
    analyticsRepository.findTransactions(filters, page, limit),
    analyticsRepository.getTransactionSummary(filters),
  ]);

  let revenueChangePercent = null;
  if (filters.from && filters.to) {
    const { from: prevFrom, to: prevTo } = getPreviousPeriod(
      filters.from,
      filters.to,
    );
    const source = await resolveRevenueSource();
    const [currentRevenue, previousRevenue] = await Promise.all([
      analyticsRepository.sumRevenueByDateRange(filters.from, filters.to, source),
      analyticsRepository.sumRevenueByDateRange(prevFrom, prevTo, source),
    ]);
    revenueChangePercent = calcPercentChange(
      currentRevenue.revenue,
      previousRevenue.revenue,
    );
  }

  return analyticsDto.toTransactionReportDto({
    summary,
    items,
    pagination: buildPaginationMeta({ page, limit, total }),
    revenueChangePercent,
  });
};

export const exportRevenueReport = async (query = {}) => {
  const filters = normalizeTransactionFilters(query);

  if (filters.from) {
    validateDateString(filters.from, "from");
  }
  if (filters.to) {
    validateDateString(filters.to, "to");
  }

  const rows = await analyticsRepository.findTransactionsForExport(filters);

  if (rows.length > EXPORT_MAX_ROWS) {
    throw new AppError("Export too large", 413, "EXPORT_TOO_LARGE");
  }

  const header = [
    "Mã GD",
    "Mã đơn",
    "Thời gian",
    "Phương thức",
    "Số tiền (VND)",
    "Trạng thái",
  ];

  const lines = rows.map((row) =>
    [
      escapeCsvValue(row.paymentNumber),
      escapeCsvValue(row.orderNumber ?? ""),
      escapeCsvValue(formatVNDateTime(row.paidAt)),
      escapeCsvValue(row.paymentMethod),
      escapeCsvValue(roundAmount(row.finalAmount)),
      escapeCsvValue(row.paymentStatus),
    ].join(","),
  );

  return `\uFEFF${[header.join(","), ...lines].join("\n")}`;
};
