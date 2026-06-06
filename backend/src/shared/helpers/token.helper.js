import crypto from "crypto";
import jwt from "jsonwebtoken";
import RefreshToken from "../../modules/auth/refresh_token.model.js";
import AppError from "../exceptions/AppError.js";

const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

const parseExpiresInToMs = (value, fallbackMs) => {
  if (!value) return fallbackMs;

  if (typeof value === "number") return value * 1000;

  const match = String(value).trim().match(/^(\d+)\s*(s|m|h|d)$/i);
  if (!match) return fallbackMs;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
};

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const getAccessTokenExpiresIn = () => process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
export const getRefreshTokenExpiresIn = () => process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

export const getAccessTokenMaxAge = () => {
  return parseExpiresInToMs(getAccessTokenExpiresIn(), 15 * 60 * 1000);
};

export const getRefreshTokenMaxAge = () => {
  return parseExpiresInToMs(getRefreshTokenExpiresIn(), 7 * 24 * 60 * 60 * 1000);
};

export const createAccessToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError("Missing JWT_SECRET in environment variables", 500);
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      type: "access",
    },
    process.env.JWT_SECRET,
    { expiresIn: getAccessTokenExpiresIn() },
  );
};

export const createRefreshToken = async (user) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new AppError("Missing JWT_REFRESH_SECRET in environment variables", 500);
  }

  const refreshToken = jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      type: "refresh",
      jti: crypto.randomUUID(),
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: getRefreshTokenExpiresIn() },
  );

  const expiresAt = new Date(Date.now() + getRefreshTokenMaxAge());

  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt,
  });

  return refreshToken;
};

export const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: getAccessTokenMaxAge(),
  });

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: getRefreshTokenMaxAge(),
  });
};

export const clearAuthCookies = (res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie(ACCESS_TOKEN_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
  });

  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
  });
};

export const getBearerToken = (req) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.split(" ")[1];
};

export const getAccessTokenFromRequest = (req) => {
  return getBearerToken(req) || req.cookies?.accessToken || null;
};

export const getRefreshTokenFromRequest = (req) => {
  return req.body?.refreshToken || req.cookies?.refreshToken || null;
};
