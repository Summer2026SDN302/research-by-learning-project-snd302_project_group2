import AppError from "../../shared/exceptions/AppError.js";
import {
  comparePassword,
  hashPassword,
} from "../../shared/helpers/password.helper.js";
import { USER_ROLE_VALUES } from "./user.constants.js";
import * as userRepository from "./user.repository.js";
import { revokeUserRefreshTokens } from "../auth/auth.service.js";

export const USER_ROLES = USER_ROLE_VALUES;

const sanitizeUser = (user) => {
  const plainUser = user.toObject ? user.toObject() : { ...user };
  delete plainUser.passwordHash;
  return plainUser;
};

const findActiveUserById = async (id, includePassword = false) => {
  const user = await userRepository.findUserById(id, includePassword);

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return user;
};

const checkUniqueUserFields = async ({
  username,
  email,
  excludeUserId = null,
}) => {
  const duplicatedUser = await userRepository.findDuplicatedUser({
    username,
    email,
    excludeUserId,
  });

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
    await checkUniqueUserFields({
      email: payload.email,
      excludeUserId: user._id,
    });

    user.email = String(payload.email).toLowerCase();
  }

  if (payload.fullName !== undefined) user.fullName = payload.fullName;
  if (payload.phone !== undefined) user.phone = payload.phone || null;

  await userRepository.saveUser(user);

  return sanitizeUser(user);
};

export const changeOwnPassword = async (
  userId,
  { currentPassword, newPassword },
) => {
  const user = await findActiveUserById(userId, true);

  const isCurrentPasswordValid = await comparePassword(
    currentPassword,
    user.passwordHash,
  );

  if (!isCurrentPasswordValid) {
    throw new AppError("Current password is incorrect", 400);
  }

  const isSamePassword = await comparePassword(newPassword, user.passwordHash);

  if (isSamePassword) {
    throw new AppError(
      "New password must be different from current password",
      400,
    );
  }

  user.passwordHash = await hashPassword(newPassword);

  await userRepository.saveUser(user);
  await revokeUserRefreshTokens(user._id);

  return null;
};

export const getUsers = async ({
  page = 1,
  limit = 10,
  search,
  role,
  isActive,
}) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const skip = (safePage - 1) * safeLimit;

  const filter = {};

  if (role) filter.role = role;

  if (isActive !== undefined && isActive !== "") {
    filter.isActive = String(isActive) === "true";
  }

  if (search) {
    const regex = new RegExp(String(search).trim(), "i");
    filter.$or = [
      { username: regex },
      { fullName: regex },
      { email: regex },
      { phone: regex },
    ];
  }

  const [items, total] = await Promise.all([
    userRepository.findUsers({
      filter,
      skip,
      limit: safeLimit,
    }),
    userRepository.countUsers(filter),
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

export const createUser = async ({
  username,
  password,
  fullName,
  email,
  phone,
  role,
}) => {
  await checkUniqueUserFields({ username, email });

  const user = await userRepository.createUser({
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
  if (payload.email !== undefined)
    user.email = String(payload.email).toLowerCase();
  if (payload.phone !== undefined) user.phone = payload.phone || null;
  if (payload.role !== undefined) user.role = payload.role;

  await userRepository.saveUser(user);

  return sanitizeUser(user);
};

export const disableUser = async (id, adminUserId) => {
  const user = await findActiveUserById(id);

  if (String(user._id) === String(adminUserId)) {
    throw new AppError(
      "Admin cannot disable their own account",
      400,
      "ADMIN_CANNOT_DISABLE_SELF",
    );
  }

  if (!user.isActive) {
    throw new AppError(
      "User is already disabled",
      409,
      "USER_ALREADY_DISABLED",
    );
  }

  user.isActive = false;
  user.deletedAt = new Date();
  user.deletedBy = adminUserId;

  await userRepository.saveUser(user);
  await revokeUserRefreshTokens(user._id);

  return sanitizeUser(user);
};

export const enableUser = async (id) => {
  const user = await userRepository.findUserByIdIncludingDeleted(id);

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  if (user.isActive) {
    throw new AppError(
      "User is already enabled",
      409,
      "USER_ALREADY_ENABLED",
    );
  }

  user.isActive = true;
  user.deletedAt = null;
  user.deletedBy = null;

  await userRepository.saveUser(user);

  return sanitizeUser(user);
};

export const resetUserPassword = async (id, { newPassword }, adminUserId) => {
  const user = await findActiveUserById(id, true);

  if (String(user._id) === String(adminUserId)) {
    throw new AppError(
      "Use change password endpoint to update your own password",
      400,
      "SELF_PASSWORD_RESET_NOT_ALLOWED",
    );
  }

  user.passwordHash = await hashPassword(newPassword);

  await userRepository.saveUser(user);
  await revokeUserRefreshTokens(user._id);

  return null;
};


