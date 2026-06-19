import crypto from "crypto";
import jwt from "jsonwebtoken";
import AppError from "../../shared/exceptions/AppError.js";
import { sendEmail } from "../../shared/helpers/email.helper.js";
import {
  comparePassword,
  hashPassword,
} from "../../shared/helpers/password.helper.js";
import {
  createAccessToken,
  createRefreshTokenValue,
  getRefreshTokenMaxAge,
  hashToken,
} from "../../shared/helpers/token.helper.js";
import { TOKEN_TYPES } from "./auth.constants.js";
import * as authRepository from "./auth.repository.js";

const MAX_RESET_OTP_ATTEMPTS = 5;

const sanitizeUser = (user) => {
  const plainUser = user.toObject ? user.toObject() : { ...user };

  delete plainUser.passwordHash;

  return plainUser;
};

const createAndStoreRefreshToken = async (user) => {
  const refreshToken = createRefreshTokenValue(user);
  const expiredAt = new Date(Date.now() + getRefreshTokenMaxAge());

  await authRepository.createRefreshTokenRecord({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    expiredAt,
  });

  return refreshToken;
};

const getPasswordResetExpiresMinutes = () => {
  const value = Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES || 15);

  if (!Number.isFinite(value) || value <= 0) {
    return 15;
  }

  return value;
};

const generateResetOtp = () => {
  return String(crypto.randomInt(100000, 1000000));
};

const buildResetPasswordOtpEmail = ({ otp, expiresMinutes }) => {
  const subject = "Your StallBox password reset OTP";

  const text = [
    "You requested to reset your StallBox password.",
    `Your OTP is: ${otp}`,
    `This OTP expires in ${expiresMinutes} minutes.`,
    "If you did not request this, you can ignore this email.",
  ].join("\n\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2>Reset your StallBox password</h2>
      <p>You requested to reset your StallBox password.</p>
      <p>Your OTP is:</p>
      <div style="display:inline-block;letter-spacing:8px;font-size:28px;font-weight:700;padding:12px 18px;background:#f3f4f6;border-radius:10px;color:#111827;">
        ${otp}
      </div>
      <p>This OTP expires in <strong>${expiresMinutes} minutes</strong>.</p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
  `;

  return { subject, text, html };
};

export const login = async ({ identifier, username, email, password }) => {
  const loginIdentifier = identifier || username || email;

  const user = await authRepository.findUserByIdentifier(loginIdentifier);

  if (!user) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  if (!user.isActive) {
    throw new AppError("User account is disabled", 403, "ACCOUNT_DISABLED");
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
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
    throw new AppError(
      "Refresh token is required",
      401,
      "REFRESH_TOKEN_REQUIRED",
    );
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    throw new AppError(
      "Missing JWT_REFRESH_SECRET in environment variables",
      500,
      "SERVER_CONFIGURATION_ERROR",
    );
  }

  let decoded;

  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (_error) {
    throw new AppError(
      "Invalid or expired refresh token",
      401,
      "INVALID_REFRESH_TOKEN",
    );
  }

  if (decoded.type !== TOKEN_TYPES.REFRESH) {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
  }

  const existingRefreshToken = await authRepository.findValidRefreshTokenByHash(
    hashToken(refreshToken),
  );

  if (!existingRefreshToken) {
    throw new AppError(
      "Refresh token has been revoked",
      401,
      "REFRESH_TOKEN_REVOKED",
    );
  }

  const user = await authRepository.findActiveUserById(decoded.sub);

  if (!user) {
    throw new AppError("User not found", 401, "USER_NOT_FOUND");
  }

  if (!user.isActive) {
    throw new AppError("User account is disabled", 403, "ACCOUNT_DISABLED");
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

export const forgotPassword = async ({ email }) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user || !user.isActive) {
    return null;
  }

  const otp = generateResetOtp();
  const expiresMinutes = getPasswordResetExpiresMinutes();
  const expiredAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

  await authRepository.markUnusedPasswordResetTokensAsUsed(user._id);

  await authRepository.createPasswordResetOtp({
    userId: user._id,
    otpHash: hashToken(otp),
    expiredAt,
  });

  const emailContent = buildResetPasswordOtpEmail({ otp, expiresMinutes });

  await sendEmail({
    to: user.email,
    ...emailContent,
  });

  return null;
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user || !user.isActive) {
    throw new AppError(
      "Invalid or expired OTP",
      400,
      "INVALID_OR_EXPIRED_RESET_OTP",
    );
  }

  const passwordResetToken = await authRepository.findAndIncrementPasswordResetOtpAttempts({
    userId: user._id,
    otpHash: hashToken(String(otp || "").trim()),
  });

  if (!passwordResetToken) {
    throw new AppError(
      "Invalid or expired OTP",
      400,
      "INVALID_OR_EXPIRED_RESET_OTP",
    );
  }

  if (passwordResetToken.attempts > MAX_RESET_OTP_ATTEMPTS) {
    await authRepository.markPasswordResetTokenAsUsed(passwordResetToken);

    throw new AppError(
      "OTP has been used too many times. Please request a new OTP",
      400,
      "RESET_OTP_ATTEMPTS_EXCEEDED",
    );
  }

  const isSamePassword = await comparePassword(newPassword, user.passwordHash);

  if (isSamePassword) {
    throw new AppError(
      "New password must be different from current password",
      400,
      "SAME_PASSWORD_NOT_ALLOWED",
    );
  }

  user.passwordHash = await hashPassword(newPassword);

  await authRepository.saveUser(user);
  await authRepository.markPasswordResetTokenAsUsed(passwordResetToken);
  await authRepository.revokeUserRefreshTokens(user._id);

  return null;
};

export const revokeUserRefreshTokens = async (userId) => {
  await authRepository.revokeUserRefreshTokens(userId);
};