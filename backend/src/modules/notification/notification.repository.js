import Notification from "./notification.model.js";

export const findAll = async (userId, { page = 1, limit = 50, unreadOnly = false }) => {
  const filter = { userId };
  if (unreadOnly) {
    filter.isRead = false;
  }
  
  const skip = (page - 1) * limit;

  return Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export const countDocuments = async (userId, { unreadOnly = false }) => {
  const filter = { userId };
  if (unreadOnly) {
    filter.isRead = false;
  }
  return Notification.countDocuments(filter);
};

export const findByIdAndUser = async (id, userId) => {
  return Notification.findOne({ _id: id, userId });
};

export const markAsRead = async (id, userId) => {
  return Notification.findOneAndUpdate(
    { _id: id, userId },
    { $set: { isRead: true } },
    { new: true }
  );
};

export const markAllAsRead = async (userId) => {
  return Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } }
  );
};

export const createMany = async (documents) => {
  return Notification.insertMany(documents, { ordered: false });
};

export const deleteOlderThan = async (date) => {
  return Notification.deleteMany({ createdAt: { $lt: date } });
};
