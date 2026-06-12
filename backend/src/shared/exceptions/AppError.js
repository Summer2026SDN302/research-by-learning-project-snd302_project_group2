import { resolveErrorMessage } from "./error.messages.js";

class AppError extends Error {
  constructor(code, statusCode = 500, details = [], isOperational = true) {
    super(resolveErrorMessage(code, details));

    this.statusCode = statusCode;
    this.code = code;
    this.details = Array.isArray(details) ? details : [];
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
