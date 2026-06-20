// Date patterns
export const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Days of week
export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Item status enum
export const DAILY_MENU_ITEM_STATUS = {
  AVAILABLE: "Available",
  UNAVAILABLE: "Unavailable",
};

export const DAILY_MENU_ITEM_STATUS_VALUES = Object.values(
  DAILY_MENU_ITEM_STATUS,
);

// Price history source enum
export const PRICE_SOURCE = {
  AI: "AI",
  MANUAL: "MANUAL",
};

export const PRICE_SOURCE_VALUES = Object.values(PRICE_SOURCE);
