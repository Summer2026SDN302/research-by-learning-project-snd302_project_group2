import cron from "node-cron";
import * as dailyMenuRepository from "../modules/menu/daily-menu/daily-menu.repository.js";
import * as notificationService from "../modules/notification/notification.service.js";
import { getTodayVNDateString } from "../shared/helpers/date.helper.js";
import { NOTIFICATION_TYPES } from "../modules/notification/notification.constants.js";
import { USER_ROLES } from "../modules/user/user.constants.js";

const checkAndSendReminder = async (slot) => {
  try {
    const today = getTodayVNDateString();
    const menu = await dailyMenuRepository.findMenuByDate(today);

    // FR-20: Silent skip when no menu document exists for today
    if (!menu) {
      console.log(`[MenuReminderJob] No daily menu found for ${today}, skipping reminder.`);
      return;
    }

    // FR-21: Skip reminder if the daily menu is already published (isConfigured === true)
    if (menu.isConfigured) {
      console.log(`[MenuReminderJob] Daily menu for ${today} is already published, skipping reminder.`);
      return;
    }

    console.log(`[MenuReminderJob] Today's menu (${today}) is not published. Sending reminder...`);

    // FR-18 & FR-19: Inserts System_Log notification for active Admins and Managers with dedup key
    const dedupKey = `menu_reminder:${today}:${slot}`;
    
    await notificationService.createForRecipients({
      roleScope: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      type: NOTIFICATION_TYPES.SYSTEM_LOG,
      title: "Chưa công bố thực đơn",
      content: `Thực đơn ngày hôm nay (${today}) chưa được công bố. Vui lòng kiểm tra và công bố thực đơn.`,
      dedupKey,
    });

    console.log(`[MenuReminderJob] Reminder sent successfully for ${today} (slot: ${slot})`);
  } catch (error) {
    console.error(`[MenuReminderJob] Error running reminder job for slot ${slot}:`, error);
  }
};

export const startMenuReminderJob = () => {
  // Slot A at 00:05
  cron.schedule(
    "5 0 * * *",
    async () => {
      await checkAndSendReminder("00:05");
    },
    { timezone: "Asia/Ho_Chi_Minh" }
  );

  // Slot B at 06:00
  cron.schedule(
    "0 6 * * *",
    async () => {
      await checkAndSendReminder("06:00");
    },
    { timezone: "Asia/Ho_Chi_Minh" }
  );

  console.log("[MenuReminderJob] Scheduled: daily menu configuration reminders at 00:05 and 06:00");
};
