import * as notificationRepository from "./notification.repository.js";
import { findUsers } from "../user/user.repository.js";
import AppError from "../../shared/exceptions/AppError.js";
import {
  NOTIFICATION_TYPES,
  ORDER_STATUS_VI,
} from "./notification.constants.js";
import { USER_ROLES } from "../user/user.constants.js";
import { getIO } from "../../sockets/socket.js";

/**
 * Resolves active recipients (combining explicit userIds and roleScope)
 * and inserts notifications idempotently.
 * Enforces deduplication using metadata.dedupKey.
 */
export const createForRecipients = async ({
  roleScope,
  userIds,
  type,
  title,
  content,
  dedupKey,
  metadata = {},
}) => {
  const recipientFilter = { isActive: true };
  const conditions = [];

  if (userIds && Array.isArray(userIds) && userIds.length > 0) {
    conditions.push({ _id: { $in: userIds } });
  }
  if (roleScope && Array.isArray(roleScope) && roleScope.length > 0) {
    conditions.push({ role: { $in: roleScope } });
  }

  if (conditions.length > 0) {
    recipientFilter.$or = conditions;
  } else {
    throw new AppError(
      "Either roleScope or userIds must be specified",
      400,
      "VALIDATION_ERROR",
    );
  }

  // Resolve active users matching filter criteria
  const activeRecipients = await findUsers({ filter: recipientFilter });

  if (activeRecipients.length === 0) {
    return;
  }

  const notificationDocs = activeRecipients.map((user) => ({
    userId: user._id,
    title,
    content,
    type,
    isRead: false,
    metadata: {
      dedupKey,
      actionType: metadata.actionType || null,
      actionPayload: metadata.actionPayload || null,
    },
  }));

  try {
    const created = await notificationRepository.createMany(notificationDocs);
    const io = getIO();
    if (io && created) {
      const docs = Array.isArray(created) ? created : [created];
      for (const notif of docs) {
        io.to(notif.userId.toString()).emit("notification-received", notif);
      }
    }
  } catch (error) {
    // Swallow duplicate key error (11000)
    const isDuplicateKeyError =
      error.code === 11000 ||
      (error.writeErrors && error.writeErrors.some((e) => e.code === 11000));

    if (!isDuplicateKeyError) {
      throw error;
    }
  }
};

/**
 * Retrieves notifications list and total unread count for a user.
 */
export const getNotifications = async (userId, query) => {
  const page = query.page || 1;
  const limit = query.limit || 50;
  const unreadOnly = query.unreadOnly === "true";

  const [items, unreadCount] = await Promise.all([
    notificationRepository.findAll(userId, { page, limit, unreadOnly }),
    notificationRepository.countDocuments(userId, { unreadOnly: true }),
  ]);

  return {
    items,
    unreadCount,
  };
};

/**
 * Marks a single notification as read, enforcing owner-scoping.
 * Hides document existence for other users (returns 404).
 */
export const markAsRead = async (id, userId) => {
  const notification = await notificationRepository.findByIdAndUser(id, userId);

  if (!notification) {
    throw new AppError("Notification not found", 404, "NOTIFICATION_NOT_FOUND");
  }

  if (notification.isRead) {
    return notification;
  }

  return notificationRepository.markAsRead(id, userId);
};

/**
 * Marks all unread notifications of a user as read.
 */
export const markAllAsRead = async (userId) => {
  await notificationRepository.markAllAsRead(userId);
};

/**
 * Helper to trigger Low Stock alerts idempotently.
 * Checks threshold and constructs dedup key.
 */
export const triggerLowStockNotification = async (
  menuDate,
  foodItemId,
  foodItemName,
  remainingQuantity,
) => {
  const threshold = 3;
  if (remainingQuantity <= 0 || remainingQuantity > threshold) {
    return; // Ignore recovery or out-of-stock triggers
  }

  // Compute 4-hour local bucket in Vietnam timezone (UTC+7)
  const now = new Date();
  const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const yyyy = vnTime.getUTCFullYear();
  const mm = String(vnTime.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(vnTime.getUTCDate()).padStart(2, "0");
  const hour = vnTime.getUTCHours();
  const bucketHour = String(Math.floor(hour / 4) * 4).padStart(2, "0");
  const bucket = `${yyyy}-${mm}-${dd}-${bucketHour}:00`;

  const dedupKey = `low_stock:${menuDate}:${foodItemId}:${bucket}`;

  await createForRecipients({
    roleScope: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    type: NOTIFICATION_TYPES.SYSTEM_LOG,
    title: "Cảnh báo sắp hết món",
    content: `Món ăn "${foodItemName}" hiện chỉ còn lại ${remainingQuantity} phần phục vụ. Vui lòng kiểm tra và chuẩn bị thêm.`,
    dedupKey,
  });
};

/**
 * Helper to trigger Order Status alerts idempotently on transitions.
 */
export const triggerOrderStatusNotification = async (order, newStatus) => {
  const dedupKey = `order_status:${order._id}:${newStatus}`;
  const statusVi = ORDER_STATUS_VI[newStatus] || newStatus;

  const isNewOrder = newStatus === "Pending";
  const title = isNewOrder
    ? "Đơn hàng mới được tạo"
    : "Cập nhật trạng thái đơn hàng";
  const content = isNewOrder
    ? `Đơn hàng #${order.orderNumber} đã được tạo thành công và đang chờ khách hàng thanh toán.`
    : `Đơn hàng #${order.orderNumber} đã chuyển sang trạng thái: "${statusVi}".`;

  // Recipient list combines creating staff and all active Admins/Managers.
  await createForRecipients({
    userIds: [order.staffId],
    roleScope: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    type: NOTIFICATION_TYPES.ORDER_UPDATE,
    title,
    content,
    dedupKey,
  });
};
