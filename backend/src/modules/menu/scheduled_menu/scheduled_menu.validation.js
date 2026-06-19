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
