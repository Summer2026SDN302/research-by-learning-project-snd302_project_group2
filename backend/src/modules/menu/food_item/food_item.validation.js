import { body, param, query } from "express-validator";

const foodItemFieldsValidation = [
  body("categoryId")
    .isMongoId()
    .withMessage("Please select a valid category"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Food item name must be between 1 and 150 characters")
    .isLength({ min: 1, max: 150 })
    .withMessage("Food item name must be between 1 and 150 characters"),
  body("description")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
  body("basePrice")
    .isFloat({ min: 0 })
    .withMessage("Invalid base price"),
  body("cost")
    .isFloat({ min: 0 })
    .withMessage("Invalid cost"),
  body("isArchived")
    .optional()
    .isBoolean()
    .withMessage("Invalid archive status"),
];

const objectIdParamValidation = [
  param("id").isMongoId().withMessage("Invalid food item id"),
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
  query("categoryId")
    .optional()
    .isMongoId()
    .withMessage("Invalid category id"),
  query("isArchived")
    .optional()
    .isIn(["true", "false"])
    .withMessage("Invalid archive status"),
];

export const validateCreate = [...foodItemFieldsValidation];

export const getFoodItemByIdValidation = objectIdParamValidation;

export const validateUpdate = [...objectIdParamValidation, ...foodItemFieldsValidation];

export const validateArchive = [
  ...objectIdParamValidation,
  body("isArchived")
    .isBoolean()
    .withMessage("Invalid archive status"),
];

export const validateDelete = objectIdParamValidation;
