import mongoose from "mongoose";
import { body, param, query } from "express-validator";
import {
  DATE_FORMAT_REGEX,
  DAILY_MENU_ITEM_STATUS_VALUES,
} from "./daily-menu.constants.js";

const dateFormatValidation = [
  param("date")
    .matches(DATE_FORMAT_REGEX)
    .withMessage("Date must be in YYYY-MM-DD format")
    .bail()
    .custom((value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }
      return true;
    }),
];

const objectIdParamValidation = [
  param("menuId").custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("Invalid menu id");
    }
    return true;
  }),
  param("itemId").custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("Invalid item id");
    }
    return true;
  }),
];

export const getMenuByDateValidation = dateFormatValidation;

export const generateDailyMenuValidation = [
  body("date")
    .matches(DATE_FORMAT_REGEX)
    .withMessage("Date must be in YYYY-MM-DD format")
    .bail()
    .custom((value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }
      return true;
    }),
];

export const updateDailyMenuItemValidation = [
  ...objectIdParamValidation,
  body("preparedQuantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Prepared quantity must be a positive integer"),
  body("currentPrice")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Current price must be a positive number"),
  body("status")
    .optional()
    .isIn(DAILY_MENU_ITEM_STATUS_VALUES)
    .withMessage(
      `Status must be one of: ${DAILY_MENU_ITEM_STATUS_VALUES.join(", ")}`,
    ),
  body("reason").optional().isString().withMessage("Reason must be a string"),
];

export const applyAiQuantityValidation = [
  ...objectIdParamValidation,
  body("recommendedQuantity")
    .isInt({ min: 1 })
    .withMessage("Recommended quantity must be a positive integer"),
];

export const applyAiPriceValidation = [
  ...objectIdParamValidation,
  body("recommendedPrice")
    .isFloat({ gt: 0 })
    .withMessage("Recommended price must be a positive number"),
  body("recommendationId")
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid recommendation id");
      }
      return true;
    }),
];

export const addFoodItemToDailyMenuValidation = [
  param("menuId").custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("Invalid menu id");
    }
    return true;
  }),
  body("foodItemId").custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("Invalid food item id");
    }
    return true;
  }),
];

export const removeFoodItemFromDailyMenuValidation = [
  ...objectIdParamValidation,
];
