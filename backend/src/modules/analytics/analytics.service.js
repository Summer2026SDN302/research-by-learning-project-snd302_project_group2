import AppError from "../../shared/exceptions/AppError.js";
import ExcelJS from "exceljs";
import {
  calcPercentChange,
  escapeCsvValue,
  fillMissingDates,
  fillMissingHours,
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
import * as dailyMenuRepository from "../menu/daily-menu/daily-menu.repository.js";

const resolveRevenueSource = async (from, to) => {
  const count = await analyticsRepository.countPaidPayments(from, to);
  return count > 0 ? REVENUE_SOURCE.PAYMENT : REVENUE_SOURCE.ORDER;
};

const buildTopFoodsWithChange = async (refDate, limit, source) => {
  const to = refDate;
  const from = subtractDays(refDate, 6);
  const { from: prevFrom, to: prevTo } = getPreviousPeriod(from, to);

  const [currentItems, previousItems] = await Promise.all([
    analyticsRepository.getTopFoods({
      from,
      to,
      limit,
      sortBy: TOP_FOODS_SORT.QUANTITY,
      source,
    }),
    analyticsRepository.getTopFoods({
      from: prevFrom,
      to: prevTo,
      limit: 100,
      sortBy: TOP_FOODS_SORT.QUANTITY,
      source,
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
  if (from === to) {
    const points = await analyticsRepository.getRevenueGroupedByHour(
      from,
      source,
    );
    return fillMissingHours(points);
  }
  const points = await analyticsRepository.getRevenueGroupedByDay(
    from,
    to,
    source,
  );
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
    throw new AppError(
      "from must be before or equal to to",
      400,
      "VALIDATION_ERROR",
    );
  }

  return {
    from,
    to,
    limit: clampLimit(
      query.limit,
      DEFAULT_TOP_FOODS_LIMIT,
      MAX_TOP_FOODS_LIMIT,
    ),
    sortBy:
      query.sortBy === TOP_FOODS_SORT.REVENUE
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
  };

  for (const row of rows) {
    totals.orderCount += row.count;

    if (row.status === "Completed") {
      totals.completedCount += row.count;
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
  const { from: chartFrom, to: chartTo } = parseChartRange(chartRange, refDate);
  const source = await resolveRevenueSource(chartFrom, chartTo);

  const [todayStats, yesterdayStats, chartPoints, topFoods] = await Promise.all(
    [
      analyticsRepository.sumRevenueForDate(refDate, source),
      analyticsRepository.sumRevenueForDate(yesterday, source),
      buildChartData(chartRange, refDate, source),
      buildTopFoodsWithChange(refDate, topFoodsLimit, source),
    ],
  );

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
  let from, to;
  if (query.from && query.to) {
    validateDateString(query.from, "from");
    validateDateString(query.to, "to");
    from = query.from;
    to = query.to;
  } else {
    ({ from, to } = parseChartRange(range, refDate));
  }

  if (from > to) {
    throw new AppError(
      "from must be before or equal to to",
      400,
      "VALIDATION_ERROR",
    );
  }

  const source = await resolveRevenueSource(from, to);

  const points =
    from === to
      ? fillMissingHours(
          await analyticsRepository.getRevenueGroupedByHour(from, source),
        )
      : fillMissingDates(
          await analyticsRepository.getRevenueGroupedByDay(from, to, source),
          from,
          to,
        );

  return analyticsDto.toRevenueChartDto({ range, from, to, points });
};

export const getTopFoods = async (query = {}) => {
  const { from, to, limit, sortBy } = normalizeTopFoodsQuery(query);
  const { from: prevFrom, to: prevTo } = getPreviousPeriod(from, to);
  const source = await resolveRevenueSource(from, to);

  const [currentItems, previousItems] = await Promise.all([
    analyticsRepository.getTopFoods({ from, to, limit, sortBy, source }),
    analyticsRepository.getTopFoods({
      from: prevFrom,
      to: prevTo,
      limit: 100,
      sortBy,
      source,
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
  const source = await resolveRevenueSource(currentRange.from, currentRange.to);

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

  const source = await resolveRevenueSource(from, to);

  const [byStatus, byPaymentMethod, paymentStats, rangeRevenue] =
    await Promise.all([
      analyticsRepository.getOrdersByStatus(from, to),
      analyticsRepository.getPaymentsByMethod(from, to),
      analyticsRepository.getPaymentStats(from, to),
      analyticsRepository.sumRevenueByDateRange(from, to, source),
    ]);

  const totals = {
    ...computeOrderTotals(byStatus),
    totalRevenue: rangeRevenue.revenue,
  };

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
    throw new AppError(
      "from must be before or equal to to",
      400,
      "VALIDATION_ERROR",
    );
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
    const source = await resolveRevenueSource(filters.from, filters.to);
    const [currentRevenue, previousRevenue] = await Promise.all([
      analyticsRepository.sumRevenueByDateRange(
        filters.from,
        filters.to,
        source,
      ),
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
  if (filters.from && filters.to && filters.from > filters.to) {
    throw new AppError(
      "from must be before or equal to to",
      400,
      "VALIDATION_ERROR",
    );
  }

  const [rows, summary] = await Promise.all([
    analyticsRepository.findTransactionsForExport(filters),
    analyticsRepository.getTransactionSummary(filters),
  ]);

  if (rows.length > EXPORT_MAX_ROWS) {
    throw new AppError("Export too large", 413, "EXPORT_TOO_LARGE");
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SDN System";
  workbook.created = new Date();

  // Sheet 1: Tổng quan
  const summarySheet = workbook.addWorksheet("Tổng quan");
  summarySheet.columns = [
    { header: "Chỉ số", key: "metric", width: 25 },
    { header: "Giá trị", key: "value", width: 25 },
  ];
  
  summarySheet.getRow(1).font = { bold: true };
  summarySheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

  const periodStr = (filters.from && filters.to) ? `${filters.from} đến ${filters.to}` : (filters.from || filters.to || "Tất cả");

  summarySheet.addRow({ metric: "Thời gian", value: periodStr });
  summarySheet.addRow({ metric: "Tổng doanh thu", value: `${roundAmount(summary.totalRevenue)} VND` });
  summarySheet.addRow({ metric: "Giao dịch thành công", value: summary.successCount });

  // Sheet 2: Chi tiết giao dịch
  const detailsSheet = workbook.addWorksheet("Chi tiết giao dịch");
  detailsSheet.columns = [
    { header: "Mã GD", key: "paymentNumber", width: 15 },
    { header: "Mã đơn", key: "orderNumber", width: 15 },
    { header: "Thời gian", key: "paidAt", width: 25 },
    { header: "Phương thức", key: "paymentMethod", width: 20 },
    { header: "Số tiền (VND)", key: "finalAmount", width: 20 },
    { header: "Trạng thái", key: "paymentStatus", width: 20 },
  ];

  detailsSheet.getRow(1).font = { bold: true };
  detailsSheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

  rows.forEach((row) => {
    detailsSheet.addRow({
      paymentNumber: row.paymentNumber,
      orderNumber: row.orderNumber ?? "",
      paidAt: formatVNDateTime(row.paidAt),
      paymentMethod: row.paymentMethod,
      finalAmount: roundAmount(row.finalAmount),
      paymentStatus: row.paymentStatus,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

export const getStaffDashboardSummary = async (query = {}) => {
  const refDate = query.date ?? getTodayVNDateString();
  if (query.date) {
    validateDateString(query.date, "date");
  }

  // Calculate order statistics (Pending, Completed today)
  const [pendingOrdersCount, completedOrdersCount] = await Promise.all([
    analyticsRepository.countOrdersByStatus("Pending"),
    analyticsRepository.countCompletedOrdersForDateRange(refDate, refDate),
  ]);

  const activeOrdersCount = pendingOrdersCount;

  // Calculate menu summary (active items, sold out items)
  const dailyMenu = await dailyMenuRepository.findMenuByDate(refDate);
  const activeMenuItemsCount = dailyMenu
    ? dailyMenu.items.filter((item) => item.status === "Available").length
    : 0;
  const soldOutMenuItemsCount = dailyMenu
    ? dailyMenu.items.filter((item) => item.remainingQuantity === 0).length
    : 0;

  // Calculate top foods sold today by quantity
  const topFoods = await analyticsRepository.getTopFoods({
    from: refDate,
    to: refDate,
    limit: 5,
    sortBy: "quantity",
    source: "order",
  });

  return analyticsDto.toStaffDashboardSummaryDto({
    activeOrdersCount,
    pendingOrdersCount,
    completedOrdersCount,
    activeMenuItemsCount,
    soldOutMenuItemsCount,
    topFoods,
  });
};
