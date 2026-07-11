import cron from "node-cron";
import * as aiService from "../modules/ai/ai.service.js";
import { getTodayVNDateString } from "../shared/helpers/date.helper.js";

export const startAiPricingScheduler = () => {
  const runPricingJob = async () => {
    const todayStr = getTodayVNDateString();
    console.log(
      `[AIPricingJob] Auto-generating dynamic pricing recommendations for ${todayStr}...`,
    );

    try {
      const insight =
        await aiService.generateDynamicPricingRecommendations(todayStr);

      if (insight && insight.pricingRecommendations) {
        console.log(
          `[AIPricingJob] Generated ${insight.pricingRecommendations.length} recommendations.`,
        );
      }
    } catch (error) {
      if (
        error.code === "DAILY_MENU_NOT_CONFIGURED" ||
        error.code === "INSIGHT_NOT_FOUND"
      ) {
        console.log(`[AIPricingJob] Skipping: ${error.message}`);
      } else {
        console.error(
          `[AIPricingJob] Failed to generate pricing recommendations for ${todayStr}:`,
          error,
        );
      }
    }
  };

  // Run at 12:30 every day (Xả quầy trưa)
  cron.schedule("30 12 * * *", runPricingJob, { timezone: "Asia/Ho_Chi_Minh" });

  // Run at 16:00, 18:00 every day (Sắp đóng và sát giờ đóng quầy tối)
  cron.schedule("0 16,18 * * *", runPricingJob, { timezone: "Asia/Ho_Chi_Minh" });

  console.log(
    "[AIPricingJob] Scheduled: dynamic pricing auto-generation at 12:30, 16:00, 18:00",
  );
};
