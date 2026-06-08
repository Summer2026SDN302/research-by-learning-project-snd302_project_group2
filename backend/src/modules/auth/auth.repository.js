import User from "../user/user.model.js";
import RefreshToken from "./refresh_token.model.js";

export const findUserByIdentifier = async (identifier) => {
  const normalizedIdentifier = String(identifier || "").trim();
  const normalizedEmail = normalizedIdentifier.toLowerCase();

  return User.findOne({
    $or: [{ username: normalizedIdentifier }, { email: normalizedEmail }],
    deletedAt: null,
  });
};

export const findActiveUserById = async (userId) => {
  return User.findOne({
    _id: userId,
    deletedAt: null,
  });
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
