import { validationResult } from "express-validator";
import AppError from "../shared/exceptions/AppError.js";

export const validateRequest = (req, _res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array().map((error) => ({
    field: error.path,
    message: error.msg,
  }));

  const message = errors.map((error) => error.message).join("; ");

  return next(new AppError(message || "Validation failed", 400));
};
