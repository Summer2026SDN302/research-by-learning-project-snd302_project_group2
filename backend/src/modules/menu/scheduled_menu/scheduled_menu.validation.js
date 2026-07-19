import { body, param } from "express-validator";
import { DAY_OF_WEEK } from "./scheduled_menu.constants.js";

export const validateDayParam = [
  param("dayOfWeek")
    .isIn(DAY_OF_WEEK)
    .withMessage(`Day of week must be one of: ${DAY_OF_WEEK.join(", ")}`),
];

export const validateUpdateBody = [
  body("foodItemIds")
    .isArray()
    .withMessage("foodItemIds must be an array"),
  body("foodItemIds.*")
    .isMongoId()
    .withMessage("Each food item ID must be a valid MongoDB ObjectId"),
];

export const validateBatchUpdateBody = [
  body("days")
    .isArray({ min: 1, max: 7 })
    .withMessage("Days must be a non-empty array with length up to 7"),
  body("days.*.dayOfWeek")
    .isIn(DAY_OF_WEEK)
    .withMessage(`Each dayOfWeek must be one of: ${DAY_OF_WEEK.join(", ")}`),
  body("days.*.foodItemIds")
    .isArray({ max: 200 })
    .withMessage("foodItemIds must be an array with length up to 200"),
  body("days.*.foodItemIds.*")
    .isMongoId()
    .withMessage("Each food item ID must be a valid MongoDB ObjectId"),
];
