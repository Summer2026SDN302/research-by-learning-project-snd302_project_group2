import { body, param, query } from "express-validator";

import { ALLOWED_ICONS } from "./category.dto.js";

const categoryFieldsValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name must be between 2 and 100 characters")
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters"),
  body("description")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
  body("icon")
    .optional()
    .isIn(ALLOWED_ICONS)
    .withMessage("Invalid icon"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("Invalid status"),
];

const objectIdParamValidation = [
  param("id").isMongoId().withMessage("Invalid category id"),
];

export const validateListQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  query("isActive")
    .optional()
    .isIn(["true", "false"])
    .withMessage("Invalid status"),
];

export const validateCreate = [...categoryFieldsValidation];

export const getCategoryByIdValidation = objectIdParamValidation;

export const validateUpdate = [...objectIdParamValidation, ...categoryFieldsValidation];

export const validateStatus = [
  ...objectIdParamValidation,
  body("isActive")
    .isBoolean()
    .withMessage("Invalid status"),
];

export const validateDelete = objectIdParamValidation;
