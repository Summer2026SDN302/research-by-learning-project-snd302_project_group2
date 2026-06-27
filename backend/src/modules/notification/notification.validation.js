import mongoose from "mongoose";
import { query, param } from "express-validator";

export const getNotificationsValidation = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be an integer between 1 and 100")
    .toInt(),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be an integer >= 1")
    .toInt(),
  query("unreadOnly")
    .optional()
    .isString()
    .isIn(["true", "false"])
    .withMessage("unreadOnly must be a boolean string ('true' or 'false')"),
];

export const markReadValidation = [
  param("id").custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("Invalid notification id");
    }
    return true;
  }),
];
