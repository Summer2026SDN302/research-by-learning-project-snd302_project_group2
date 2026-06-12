import jwt from "jsonwebtoken";
import User from "../modules/user/user.model.js";
import AppError from "../shared/exceptions/AppError.js";
import { getAccessTokenFromRequest } from "../shared/helpers/token.helper.js";
import { TOKEN_TYPES } from "../modules/auth/auth.constants.js";

export const authenticate = async (req, _res, next) => {
  try {
    const token = getAccessTokenFromRequest(req);

    if (!token) {
      throw new AppError("AUTHENTICATION_REQUIRED", 401);
    }

    if (!process.env.JWT_SECRET) {
      throw new AppError("SERVER_CONFIGURATION_ERROR", 500);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== TOKEN_TYPES.ACCESS) {
      throw new AppError("INVALID_ACCESS_TOKEN", 401);
    }

    const user = await User.findOne({
      _id: decoded.sub,
      deletedAt: null,
    }).select("-passwordHash");

    if (!user) {
      throw new AppError("USER_NOT_FOUND", 401);
    }

    if (!user.isActive) {
      throw new AppError("ACCOUNT_DISABLED", 403);
    }

    req.user = user;
    req.userId = user._id.toString();

    return next();
  } catch (error) {
    if (error instanceof AppError) return next(error);

    if (error.name === "TokenExpiredError") {
      return next(new AppError("ACCESS_TOKEN_EXPIRED", 401));
    }

    if (error.name === "JsonWebTokenError") {
      return next(new AppError("INVALID_ACCESS_TOKEN", 401));
    }

    return next(error);
  }
};
