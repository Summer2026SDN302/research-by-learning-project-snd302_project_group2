import express from "express";
import * as notificationController from "./notification.controller.js";
import {
  getNotificationsValidation,
  markReadValidation,
} from "./notification.validation.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET / - Retrieve notifications
router.get(
  "/",
  getNotificationsValidation,
  validateRequest,
  notificationController.getNotifications
);

// PATCH /read-all - Mark all notifications as read
router.patch(
  "/read-all",
  notificationController.markAllAsRead
);

// PATCH /:id/read - Mark single notification as read
router.patch(
  "/:id/read",
  markReadValidation,
  validateRequest,
  notificationController.markAsRead
);

export default router;
