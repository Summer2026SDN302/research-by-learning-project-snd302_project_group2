import mongoose from "mongoose";
import User from "./user.model.js";
import RefreshToken from "../auth/refresh_token.model.js";
import AppError from "../../shared/exceptions/AppError.js";
import { comparePassword, hashPassword } from "../../shared/helpers/password.helper.js";

export const USER_ROLES = ["Staff", "Manager", "Admin"];

const sanitizeUser = (user) => {
  const plainUser = user?.toObject ? user.toObject() : user;
  if (!plainUser) return plainUser;
  delete plainUser.passwordHash;
  return plainUser;
};

const assertValidObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid user id", 400);
  }
};

const findActiveUserById = async (id, includePassword = false) => {
  assertValidObjectId(id);

  const query = User.findOne({ _id: id, deletedAt: null });

  if (!includePassword) {
    query.select("-passwordHash");
  }

  const user = await query;

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

const checkUniqueUserFields = async ({ username, email, excludeUserId = null }) => {
  const conditions = [];

  if (username) conditions.push({ username });
  if (email) conditions.push({ email: String(email).toLowerCase() });

  if (conditions.length === 0) return;

  const query = { $or: conditions, deletedAt: null };

  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const duplicatedUser = await User.findOne(query);

  if (!duplicatedUser) return;

  if (username && duplicatedUser.username === username) {
    throw new AppError("Username already exists", 409);
  }

  if (email && duplicatedUser.email === String(email).toLowerCase()) {
    throw new AppError("Email already exists", 409);
  }
};

export const getProfile = async (userId) => {
  const user = await findActiveUserById(userId);
  return sanitizeUser(user);
};

export const updateProfile = async (userId, payload) => {
  const user = await findActiveUserById(userId);

  if (payload.email) {
    await checkUniqueUserFields({ email: payload.email, excludeUserId: user._id });
    user.email = String(payload.email).toLowerCase();
  }

  if (payload.fullName !== undefined) user.fullName = payload.fullName;
  if (payload.phone !== undefined) user.phone = payload.phone || null;

  await user.save();

  return sanitizeUser(user);
};

export const changeOwnPassword = async (userId, { currentPassword, newPassword }) => {
  const user = await findActiveUserById(userId, true);

  const isCurrentPasswordValid = await comparePassword(currentPassword, user.passwordHash);

  if (!isCurrentPasswordValid) {
    throw new AppError("Current password is incorrect", 400);
  }

  const isSamePassword = await comparePassword(newPassword, user.passwordHash);

  if (isSamePassword) {
    throw new AppError("New password must be different from current password", 400);
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  await revokeUserRefreshTokens(user._id);

  return null;
};

export const getUsers = async ({ page = 1, limit = 10, search, role, isActive }) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const skip = (safePage - 1) * safeLimit;

  const filter = { deletedAt: null };

  if (role) filter.role = role;

  if (isActive !== undefined && isActive !== "") {
    filter.isActive = String(isActive) === "true";
  }

  if (search) {
    const regex = new RegExp(String(search).trim(), "i");
    filter.$or = [{ username: regex }, { fullName: regex }, { email: regex }, { phone: regex }];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    User.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

export const getUserById = async (id) => {
  const user = await findActiveUserById(id);
  return sanitizeUser(user);
};

export const createUser = async ({ username, password, fullName, email, phone, role }) => {
  await checkUniqueUserFields({ username, email });

  const user = await User.create({
    username,
    passwordHash: await hashPassword(password),
    fullName,
    email: String(email).toLowerCase(),
    phone: phone || null,
    role,
    isActive: true,
  });

  return sanitizeUser(user);
};

export const updateUser = async (id, payload) => {
  const user = await findActiveUserById(id);

  await checkUniqueUserFields({
    username: payload.username,
    email: payload.email,
    excludeUserId: user._id,
  });

  if (payload.username !== undefined) user.username = payload.username;
  if (payload.fullName !== undefined) user.fullName = payload.fullName;
  if (payload.email !== undefined) user.email = String(payload.email).toLowerCase();
  if (payload.phone !== undefined) user.phone = payload.phone || null;
  if (payload.role !== undefined) user.role = payload.role;

  await user.save();

  return sanitizeUser(user);
};

export const disableUser = async (id, adminUserId) => {
  const user = await findActiveUserById(id);

  if (String(user._id) === String(adminUserId)) {
    throw new AppError("Admin cannot disable their own account", 400);
  }

  if (!user.isActive) {
    return sanitizeUser(user);
  }

  user.isActive = false;
  await user.save();

  await revokeUserRefreshTokens(user._id);

  return sanitizeUser(user);
};

export const enableUser = async (id) => {
  const user = await findActiveUserById(id);

  user.isActive = true;
  await user.save();

  return sanitizeUser(user);
};

export const resetUserPassword = async (id, { newPassword }, adminUserId) => {
  const user = await findActiveUserById(id, true);

  if (String(user._id) === String(adminUserId)) {
    throw new AppError("Use change password endpoint to update your own password", 400);
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  await revokeUserRefreshTokens(user._id);

  return null;
};

export const revokeUserRefreshTokens = async (userId) => {
  await RefreshToken.updateMany(
    { userId, isRevoked: false },
    { isRevoked: true, revokedAt: new Date() },
  );
};
