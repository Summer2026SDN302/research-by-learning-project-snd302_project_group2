import User from "./user.model.js";
import RefreshToken from "../auth/refresh_token.model.js";

export const findUserById = async (id, includePassword = false) => {
  const query = User.findOne({
    _id: id,
    deletedAt: null,
  });

  if (!includePassword) {
    query.select("-passwordHash");
  }

  return query;
};

export const findDuplicatedUser = async ({
  username,
  email,
  excludeUserId = null,
}) => {
  const conditions = [];

  if (username) conditions.push({ username });
  if (email) conditions.push({ email: String(email).toLowerCase() });

  if (conditions.length === 0) {
    return null;
  }

  const query = {
    $or: conditions,
    deletedAt: null,
  };

  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  return User.findOne(query);
};

export const findUsers = async ({ filter, skip, limit }) => {
  return User.find(filter)
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export const countUsers = async (filter) => {
  return User.countDocuments(filter);
};

export const createUser = async (payload) => {
  return User.create(payload);
};

export const saveUser = async (user) => {
  return user.save();
};
