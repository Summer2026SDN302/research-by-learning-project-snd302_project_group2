import mongoose from "mongoose";
import { errorResponse } from "../shared/response/responseFormatter.js";

export const notFoundHandler = (req, res) => {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

export const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";

  if (error.code === 11000) {
    statusCode = 409;
    const duplicateField = Object.keys(error.keyPattern || {})[0] || "field";
    message = `${duplicateField} already exists`;
  }

  if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid resource id";
  }

  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join("; ");
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }

  return errorResponse(res, message, statusCode);
};
