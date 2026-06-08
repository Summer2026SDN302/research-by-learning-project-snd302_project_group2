import mongoose from "mongoose";
import { errorResponse } from "../shared/response/responseFormatter.js";

export const notFoundHandler = (req, res) => {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404, {
    code: "ROUTE_NOT_FOUND",
    details: [
      {
        method: req.method,
        path: req.originalUrl,
      },
    ],
  });
};

export const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";
  let code = error.code || "INTERNAL_SERVER_ERROR";
  let details = Array.isArray(error.details) ? error.details : [];

  if (error.code === 11000) {
    statusCode = 409;

    const duplicateField = Object.keys(error.keyPattern || {})[0] || "field";
    message = `${duplicateField} already exists`;
    code = "DUPLICATE_FIELD";
    details = [
      {
        field: duplicateField,
        message,
      },
    ];
  }

  if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid resource id";
    code = "INVALID_RESOURCE_ID";
    details = [
      {
        field: error.path || "id",
        message,
      },
    ];
  }

  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join("; ");
    code = "DATABASE_VALIDATION_ERROR";
    details = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }

  return errorResponse(res, message, statusCode, {
    code,
    details,
  });
};