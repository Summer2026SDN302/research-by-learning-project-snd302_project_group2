import User from "../user/user.model.js";
import RefreshToken from "./refresh_token.model.js";
import PasswordResetToken from "./password_reset_token.model.js";

export const findUserByIdentifier = async (identifier) => {
  const normalizedIdentifier = String(identifier || "").trim();
  const normalizedEmail = normalizedIdentifier.toLowerCase();

  return User.findOne({
    $or: [{ username: normalizedIdentifier }, { email: normalizedEmail }],
    deletedAt: null,
  });
};

export const findUserByEmail = async (email) => {
  return User.findOne({
    email: String(email || "").trim().toLowerCase(),
    deletedAt: null,
  });
};

export const findActiveUserById = async (userId) => {
  return User.findOne({
    _id: userId,
    deletedAt: null,
  });
};

export const saveUser = async (user) => {
  return user.save();
};

export const createRefreshTokenRecord = async ({
  userId,
  tokenHash,
  expiresAt,
}) => {
  return RefreshToken.create({
    userId,
    tokenHash,
    expiresAt,
  });
};

export const findValidRefreshTokenByHash = async (tokenHash) => {
  return RefreshToken.findOne({
    tokenHash,
    isRevoked: false,
  });
};

export const revokeRefreshTokenByHash = async (tokenHash) => {
  return RefreshToken.findOneAndUpdate(
    {
      tokenHash,
      isRevoked: false,
    },
    {
      isRevoked: true,
      revokedAt: new Date(),
    },
  );
};

export const revokeRefreshTokenDocument = async (refreshTokenDocument) => {
  if (!refreshTokenDocument || refreshTokenDocument.isRevoked) {
    return null;
  }

  refreshTokenDocument.isRevoked = true;
  refreshTokenDocument.revokedAt = new Date();

  return refreshTokenDocument.save();
};

export const revokeUserRefreshTokens = async (userId) => {
  return RefreshToken.updateMany(
    {
      userId,
      isRevoked: false,
    },
    {
      isRevoked: true,
      revokedAt: new Date(),
    },
  );
};

export const markUnusedPasswordResetTokensAsUsed = async (userId) => {
  return PasswordResetToken.updateMany(
    {
      userId,
      usedAt: null,
      deletedAt: null,
    },
    {
      usedAt: new Date(),
    },
  );
};

export const createPasswordResetOtp = async ({ userId, otpHash, expiresAt }) => {
  return PasswordResetToken.create({
    userId,
    tokenHash: otpHash,
    expiresAt,
  });
};

export const findValidPasswordResetOtp = async ({ userId, otpHash }) => {
  return PasswordResetToken.findOne({
    userId,
    tokenHash: otpHash,
    usedAt: null,
    deletedAt: null,
    isActive: true,
    expiresAt: { $gt: new Date() },
  });
};

export const increasePasswordResetOtpAttempts = async (passwordResetToken) => {
  if (!passwordResetToken) {
    return null;
  }

  passwordResetToken.attempts += 1;

  return passwordResetToken.save();
};

export const markPasswordResetTokenAsUsed = async (passwordResetToken) => {
  if (!passwordResetToken || passwordResetToken.usedAt) {
    return null;
  }

  passwordResetToken.usedAt = new Date();

  return passwordResetToken.save();
};