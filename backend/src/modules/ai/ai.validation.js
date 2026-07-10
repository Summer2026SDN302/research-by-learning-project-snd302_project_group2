import { body, param } from "express-validator";
import { FORECAST_STATUS } from "./ai.constants.js";

const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ALLOWED_UPDATE_STATUSES = [FORECAST_STATUS.APPLIED, FORECAST_STATUS.REJECTED];

const dateFormatValidation = (field, location = "body") => {
  const reqField = location === "body" ? body(field) : param(field);
  return reqField
    .matches(DATE_FORMAT_REGEX)
    .withMessage("Date must be in YYYY-MM-DD format")
    .bail()
    .custom((value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }
      return true;
    });
};

export const generateInsightValidation = [
  dateFormatValidation("targetDate", "body"),
];

/** Identical shape to generateInsightValidation but kept separate for clarity. */
export const generatePricingValidation = [
  dateFormatValidation("targetDate", "body"),
];

export const getInsightValidation = [
  dateFormatValidation("targetDate", "param"),
];

export const applyForecastsValidation = [
  param("insightId")
    .isMongoId()
    .withMessage("Invalid insight id"),
  body("updates")
    .isArray({ min: 1 })
    .withMessage("Updates must be a non-empty array"),
  body("updates.*.foodItemId")
    .isMongoId()
    .withMessage("Invalid food item id"),
  body("updates.*.status")
    .isIn(ALLOWED_UPDATE_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_UPDATE_STATUSES.join(", ")}`),
];

export const applyPricingValidation = [
  param("insightId")
    .isMongoId()
    .withMessage("Invalid insight id"),
  body("updates")
    .isArray({ min: 1 })
    .withMessage("Updates must be a non-empty array"),
  body("updates.*.foodItemId")
    .isMongoId()
    .withMessage("Invalid food item id"),
  body("updates.*.status")
    .isIn(ALLOWED_UPDATE_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_UPDATE_STATUSES.join(", ")}`),
];
