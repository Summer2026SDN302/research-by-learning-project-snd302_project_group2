import jwt from "jsonwebtoken";
import User from "../user/user.model.js";
import RefreshToken from "./refresh_token.model.js";
import AppError from "../../shared/exceptions/AppError.js";
import { comparePassword } from "../../shared/helpers/password.helper.js";
import {
  clearAuthCookies,
  createAccessToken,
  createRefreshToken,
  getRefreshTokenFromRequest,
  hashToken,
  setAuthCookies,
} from "../../shared/helpers/token.helper.js";

const sanitizeUser = (user) => {
  const plainUser = user.toObject ? user.toObject() : user;
  delete plainUser.passwordHash;
  return plainUser;
};

export const login = async ({ identifier, username, email, password }, res) => {
  const loginIdentifier = identifier || username || email;

  const user = await User.findOne({
    $or: [{ username: loginIdentifier }, { email: String(loginIdentifier).toLowerCase() }],
    deletedAt: null,
  });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!user.isActive) {
    throw new AppError("User account is disabled", 403);
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const accessToken = createAccessToken(user);
  const refreshToken = await createRefreshToken(user);

  setAuthCookies(res, accessToken, refreshToken);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

export const refresh = async (req, res) => {
  const refreshToken = getRefreshTokenFromRequest(req);

  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    throw new AppError("Missing JWT_REFRESH_SECRET in environment variables", 500);
  }

  let decoded;

  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  if (decoded.type !== "refresh") {
    throw new AppError("Invalid refresh token", 401);
  }

  const existingRefreshToken = await RefreshToken.findOne({
    tokenHash: hashToken(refreshToken),
    isRevoked: false,
  });

  if (!existingRefreshToken) {
    throw new AppError("Refresh token has been revoked", 401);
  }

  if (existingRefreshToken.expiresAt <= new Date()) {
    existingRefreshToken.isRevoked = true;
    existingRefreshToken.revokedAt = new Date();
    await existingRefreshToken.save();
    throw new AppError("Refresh token expired", 401);
  }

  const user = await User.findOne({
    _id: decoded.sub,
    deletedAt: null,
  });

  if (!user) {
    throw new AppError("User not found", 401);
  }

  if (!user.isActive) {
    throw new AppError("User account is disabled", 403);
  }

  existingRefreshToken.isRevoked = true;
  existingRefreshToken.revokedAt = new Date();
  await existingRefreshToken.save();

  const newAccessToken = createAccessToken(user);
  const newRefreshToken = await createRefreshToken(user);

  setAuthCookies(res, newAccessToken, newRefreshToken);

  return {
    user: sanitizeUser(user),
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logout = async (req, res) => {
  const refreshToken = getRefreshTokenFromRequest(req);

  if (refreshToken) {
    await RefreshToken.findOneAndUpdate(
      { tokenHash: hashToken(refreshToken), isRevoked: false },
      { isRevoked: true, revokedAt: new Date() },
    );
  }

  clearAuthCookies(res);

  return null;
};
