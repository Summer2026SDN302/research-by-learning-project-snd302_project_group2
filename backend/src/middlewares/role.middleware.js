import AppError from "../shared/exceptions/AppError.js";

export const authorizeRoles = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(
        new AppError("AUTHENTICATION_REQUIRED", 401),
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("INSUFFICIENT_PERMISSIONS", 403),
      );
    }

    return next();
  };
};
