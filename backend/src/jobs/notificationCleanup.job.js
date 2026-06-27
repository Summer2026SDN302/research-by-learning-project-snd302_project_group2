import cron from "node-cron";
import * as notificationRepository from "../modules/notification/notification.repository.js";

export const startNotificationCleanupJob = () => {
  cron.schedule(
    "0 3 * * *",
    async () => {
      console.log("[NotificationCleanupJob] Running notification cleanup job...");
      try {
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - 90);

        const result = await notificationRepository.deleteOlderThan(thresholdDate);
        console.log(
          `[NotificationCleanupJob] Successfully purged ${result.deletedCount} notifications older than 90 days.`
        );
      } catch (error) {
        console.error("[NotificationCleanupJob] Failed to clean up old notifications:", error);
      }
    },
    { timezone: "Asia/Ho_Chi_Minh" }
  );

  console.log("[NotificationCleanupJob] Scheduled: daily retention cleanup at 03:00");
};
