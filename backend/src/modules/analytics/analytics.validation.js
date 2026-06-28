import { query } from "express-validator";
import {
  CHART_RANGE_VALUES,
  DATE_FORMAT_REGEX,
  MAX_PAGE_LIMIT,
  MAX_TOP_FOODS_LIMIT,
  PAYMENT_METHOD_VALUES,
  PAYMENT_STATUS_VALUES,
  TREND_PERIOD_VALUES,
  TOP_FOODS_SORT_VALUES,
} from "./analytics.constants.js";

const dateQuery = (field) =>
  query(field)
    .optional({ values: "falsy" })
    .matches(DATE_FORMAT_REGEX)
    .withMessage(`${field} must be in YYYY-MM-DD format`)
    .bail()
    .custom((value) => {
      const date = new Date(`${value}T12:00:00+07:00`);
      if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid ${field}`);
      }
      return true;
    });

const intQuery = (field, { min = 1, max } = {}) => {
  const chain = query(field)
    .optional({ values: "falsy" })
    .isInt({ min })
    .withMessage(`${field} must be an integer >= ${min}`)
    .toInt();

  if (max !== undefined) {
    chain.isInt({ min, max }).withMessage(`${field} must be <= ${max}`);
  }

  return chain;
};

export const dashboardSummaryValidation = [
  dateQuery("date"),
  query("chartRange")
    .optional({ values: "falsy" })
    .isIn(CHART_RANGE_VALUES)
    .withMessage(`chartRange must be one of: ${CHART_RANGE_VALUES.join(", ")}`),
  intQuery("topFoodsLimit", { min: 1, max: MAX_TOP_FOODS_LIMIT }),
];

export const revenueChartValidation = [
  query("range")
    .optional({ values: "falsy" })
    .isIn(CHART_RANGE_VALUES)
    .withMessage(`range must be one of: ${CHART_RANGE_VALUES.join(", ")}`),
  dateQuery("from"),
  dateQuery("to"),
  dateQuery("date"),
];

export const topFoodsValidation = [
  intQuery("limit", { min: 1, max: MAX_TOP_FOODS_LIMIT }),
  dateQuery("from"),
  dateQuery("to"),
  query("sortBy")
    .optional({ values: "falsy" })
    .isIn(TOP_FOODS_SORT_VALUES)
    .withMessage(`sortBy must be one of: ${TOP_FOODS_SORT_VALUES.join(", ")}`),
];

export const salesTrendValidation = [
  query("period")
    .optional({ values: "falsy" })
    .isIn(TREND_PERIOD_VALUES)
    .withMessage(`period must be one of: ${TREND_PERIOD_VALUES.join(", ")}`),
  dateQuery("date"),
];

export const orderStatisticsValidation = [
  dateQuery("from"),
  dateQuery("to"),
  dateQuery("date"),
];

const transactionFiltersValidation = [
  query("status")
    .optional({ values: "falsy" })
    .isIn(PAYMENT_STATUS_VALUES)
    .withMessage(`status must be one of: ${PAYMENT_STATUS_VALUES.join(", ")}`),
  query("paymentMethod")
    .optional({ values: "falsy" })
    .isIn(PAYMENT_METHOD_VALUES)
    .withMessage(
      `paymentMethod must be one of: ${PAYMENT_METHOD_VALUES.join(", ")}`,
    ),
  dateQuery("from"),
  dateQuery("to"),
  query("search")
    .optional({ values: "falsy" })
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("search must be at most 100 characters"),
];

export const transactionReportValidation = [
  ...transactionFiltersValidation,
  intQuery("page", { min: 1 }),
  intQuery("limit", { min: 1, max: MAX_PAGE_LIMIT }),
];

export const exportReportValidation = [...transactionFiltersValidation];
