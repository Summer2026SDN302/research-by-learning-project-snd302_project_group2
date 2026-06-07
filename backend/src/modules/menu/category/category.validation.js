import { body, query, validationResult } from "express-validator";

import AppError from "../../../shared/exceptions/AppError.js";
import { ALLOWED_ICONS } from "./category.dto.js";

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new AppError(
        errors.array()[0].msg,
        400,
        "VALIDATION_ERROR",
        errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
        })),
      ),
    );
  }

  next();
};

const categoryFieldsValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên danh mục phải từ 2–100 ký tự")
    .isLength({ min: 2, max: 100 })
    .withMessage("Tên danh mục phải từ 2–100 ký tự"),
  body("description")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Mô tả không được vượt quá 500 ký tự"),
  body("icon")
    .optional()
    .isIn(ALLOWED_ICONS)
    .withMessage("Biểu tượng không hợp lệ"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("Trạng thái không hợp lệ"),
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
    .withMessage("Trạng thái không hợp lệ"),
  handleValidation,
];

export const validateCreate = [...categoryFieldsValidation, handleValidation];

export const validateUpdate = [...categoryFieldsValidation, handleValidation];

export const validateStatus = [
  body("isActive")
    .isBoolean()
    .withMessage("Trạng thái không hợp lệ"),
  handleValidation,
];
