import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/response/responseFormatter.js";
import * as notificationService from "./notification.service.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const data = await notificationService.getNotifications(userId, req.query);
  return successResponse(res, data, "Notifications retrieved successfully");
});

export const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const notificationId = req.params.id;
  const data = await notificationService.markAsRead(notificationId, userId);
  return successResponse(res, data, "Notification marked as read successfully");
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await notificationService.markAllAsRead(userId);
  return successResponse(res, null, "All notifications marked as read successfully");
});
