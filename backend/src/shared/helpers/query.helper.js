import AppError from "../exceptions/AppError.js";

export const parseBooleanQuery = (
  value,
  errorMessage = "Invalid status",
) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (value === true || value === "true") {
    return true;
  }

  if (value === false || value === "false") {
    return false;
  }

  throw new AppError(errorMessage, 400, "VALIDATION_ERROR");
};

export const parsePagination = (query, { defaultLimit = 10, maxLimit = 50 } = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(query.limit, 10) || defaultLimit),
  );

  return { page, limit };
};

export const parseSearchQuery = (search) => search?.trim() || undefined;
