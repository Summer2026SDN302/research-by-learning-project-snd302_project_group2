import jwt from "jsonwebtoken";
import AppError from "../../shared/exceptions/AppError.js";
import { comparePassword } from "../../shared/helpers/password.helper.js";
import {
  createAccessToken,
  createRefreshTokenValue,
  getRefreshTokenMaxAge,
  hashToken,
} from "../../shared/helpers/token.helper.js";
import { TOKEN_TYPES } from "./auth.constants.js";
import * as authRepository from "./auth.repository.js";

const sanitizeUser = (user) => {
  const plainUser = user.toObject ? user.toObject() : { ...user };
  delete plainUser.passwordHash;
  return plainUser;
};

const createAndStoreRefreshToken = async (user) => {
  const refreshToken = createRefreshTokenValue(user);
  const expiresAt = new Date(Date.now() + getRefreshTokenMaxAge());

  await authRepository.createRefreshTokenRecord({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt,
  });

  return refreshToken;
};

export const login = async ({ identifier, username, email, password }) => {
  const loginIdentifier = identifier || username || email;

  const user = await authRepository.findUserByIdentifier(loginIdentifier);

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
  const refreshToken = await createAndStoreRefreshToken(user);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

export const refresh = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    throw new AppError("Missing JWT_REFRESH_SECRET in environment variables", 500);
  }

  let decoded;

  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (_error) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  if (decoded.type !== TOKEN_TYPES.REFRESH) {
    throw new AppError("Invalid refresh token", 401);
  }

  const existingRefreshToken = await authRepository.findValidRefreshTokenByHash(hashToken(refreshToken));

  if (!existingRefreshToken) {
    throw new AppError("Refresh token has been revoked", 401);
  }

  const user = await authRepository.findActiveUserById(decoded.sub);

  if (!user) {
    throw new AppError("User not found", 401);
  }

  if (!user.isActive) {
    throw new AppError("User account is disabled", 403);
  }

  await authRepository.revokeRefreshTokenDocument(existingRefreshToken);

  const newAccessToken = createAccessToken(user);
  const newRefreshToken = await createAndStoreRefreshToken(user);

  return {
    user: sanitizeUser(user),
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logout = async (refreshToken) => {
  if (refreshToken) {
    await authRepository.revokeRefreshTokenByHash(hashToken(refreshToken));
  }

  return null;
};