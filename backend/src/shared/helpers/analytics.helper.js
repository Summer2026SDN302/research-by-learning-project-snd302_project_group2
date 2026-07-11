import AppError from "../exceptions/AppError.js";
import { getTodayVNDateString } from "./date.helper.js";
import {
  CHART_RANGE,
  DATE_FORMAT_REGEX,
  TREND_PERIOD,
  WEEKDAY_LABELS_VI,
  TIMEZONE_OFFSET,
} from "../../modules/analytics/analytics.constants.js";

export const validateDateString = (date, fieldName = "date") => {
  if (!DATE_FORMAT_REGEX.test(date)) {
    throw new AppError(
      `${fieldName} must be in YYYY-MM-DD format`,
      400,
      "VALIDATION_ERROR",
    );
  }

  const parsed = new Date(`${date}T12:00:00${TIMEZONE_OFFSET}`);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(`Invalid ${fieldName}`, 400, "VALIDATION_ERROR");
  }
};

export const addDays = (dateStr, days) => {
  const date = new Date(`${dateStr}T12:00:00${TIMEZONE_OFFSET}`);
  date.setDate(date.getDate() + days);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
};

export const subtractDays = (dateStr, days) => addDays(dateStr, -days);

export const toStartOfDayVN = (dateStr) =>
  new Date(`${dateStr}T00:00:00${TIMEZONE_OFFSET}`);

export const toEndOfDayVN = (dateStr) =>
  new Date(`${dateStr}T23:59:59.999${TIMEZONE_OFFSET}`);

export const getWeekdayLabel = (dateStr) => {
  const date = new Date(`${dateStr}T12:00:00${TIMEZONE_OFFSET}`);
  return WEEKDAY_LABELS_VI[date.getDay()];
};

export const calcPercentChange = (current, previous) => {
  if (previous === 0) {
    return null;
  }

  const change = ((current - previous) / previous) * 100;
  return Math.round(change * 10) / 10;
};

export const getPreviousPeriod = (from, to) => {
  const fromDate = new Date(`${from}T12:00:00${TIMEZONE_OFFSET}`);
  const toDate = new Date(`${to}T12:00:00${TIMEZONE_OFFSET}`);
  const dayCount =
    Math.round((toDate.getTime() - fromDate.getTime()) / 86_400_000) + 1;
  const prevTo = subtractDays(from, 1);
  const prevFrom = subtractDays(from, dayCount);
  return { from: prevFrom, to: prevTo };
};

export const parseChartRange = (range, refDate) => {
  const date = refDate ?? getTodayVNDateString();

  if (range === "today") {
    return { from: date, to: date };
  }

  if (range === CHART_RANGE.MONTH) {
    const [year, month] = date.split("-");
    return { from: `${year}-${month}-01`, to: date };
  }

  if (range === CHART_RANGE.THIRTY_DAYS) {
    return { from: subtractDays(date, 29), to: date };
  }

  return { from: subtractDays(date, 6), to: date };
};

export const parseTrendPeriod = (period, refDate) => {
  const date = refDate ?? getTodayVNDateString();

  if (period === TREND_PERIOD.WEEK) {
    return { from: subtractDays(date, 6), to: date };
  }

  if (period === TREND_PERIOD.MONTH) {
    const [year, month] = date.split("-");
    return { from: `${year}-${month}-01`, to: date };
  }

  return { from: date, to: date };
};

export const parseDateRange = ({ from, to, range, date }) => {
  if (from && to) {
    validateDateString(from, "from");
    validateDateString(to, "to");

    if (from > to) {
      throw new AppError("from must be before or equal to to", 400, "VALIDATION_ERROR");
    }

    return { from, to };
  }

  if (range) {
    const refDate = date ?? getTodayVNDateString();
    if (date) {
      validateDateString(date, "date");
    }
    return parseChartRange(range, refDate);
  }

  const today = date ?? getTodayVNDateString();
  if (date) {
    validateDateString(date, "date");
  }

  return { from: today, to: today };
};

export const fillMissingDates = (points, from, to) => {
  const map = new Map(points.map((point) => [point.date, point]));
  const result = [];
  let current = from;

  while (current <= to) {
    result.push(
      map.get(current) ?? {
        date: current,
        revenue: 0,
        orderCount: 0,
      },
    );
    current = addDays(current, 1);
  }

  return result;
};

export const fillMissingHours = (points) => {
  const map = new Map(points.map((point) => [point.hour, point]));
  const result = [];

  for (let h = 0; h < 24; h++) {
    const hourStr = `${h.toString().padStart(2, "0")}:00`;
    result.push(
      map.get(hourStr) ?? {
        hour: hourStr,
        revenue: 0,
        orderCount: 0,
      },
    );
  }

  return result;
};

export const roundAmount = (value) => Math.round(Number(value) || 0);

export const formatVNDateTime = (value) => {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(value));
};

export const escapeCsvValue = (value) => {
  let str = String(value ?? "");
  if (/^[=\+\-@]/.test(str)) {
    str = `'${str}`;
  }
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};
