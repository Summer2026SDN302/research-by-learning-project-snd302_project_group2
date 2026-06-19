import cron from "node-cron";
import { generateDailyMenu } from "../modules/menu/daily-menu/daily-menu.service.js";
import { expireAllPastMenus } from "../modules/menu/daily-menu/daily-menu.repository.js";
import { getTodayVNDateString } from "../shared/helpers/date.helper.js";

export const startDailyMenuJob = () => {
  cron.schedule(
    "0 0 * * *",
    async () => {
      const today = getTodayVNDateString();
      console.log(`[DailyMenuJob] Auto-generating menu for ${today}...`);

      try {
        await generateDailyMenu(today, null);
        console.log(`[DailyMenuJob] Menu generated successfully for ${today}`);
      } catch (error) {
        if (error.code === "DAILY_MENU_ALREADY_EXISTS") {
          console.log(
            `[DailyMenuJob] Menu already exists for ${today}, skipping.`,
          );
          return;
        }
        console.error(
          `[DailyMenuJob] Failed to generate menu for ${today}:`,
          error.message,
        );
      }
    },
    { timezone: "Asia/Ho_Chi_Minh" },
  );

  console.log("[DailyMenuJob] Scheduled: daily menu auto-generation at 00:00");
};

export const startExpireDailyMenuJob = () => {
  cron.schedule(
    "5 0 * * *",
    async () => {
      try {
        const todayStr = getTodayVNDateString();

        const result = await expireAllPastMenus(todayStr);

        console.log(
          `[expireDailyMenuJob] Updated ${result.modifiedCount} daily menu(s) at ${new Date().toISOString()}`,
        );
      } catch (err) {
        console.error("[expireDailyMenuJob] Failed:", err);
      }
    },
    { timezone: "Asia/Ho_Chi_Minh" },
  );
};
