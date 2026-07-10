import * as aiRepository from "./ai.repository.js";
import foodItemRepository from "../menu/food_item/food_item.repository.js";
import orderRepository from "../order/order.repository.js";
import scheduledMenuRepository from "../menu/scheduled_menu/scheduled_menu.repository.js";
import AppError from "../../shared/exceptions/AppError.js";
import * as dailyMenuRepository from "../menu/daily-menu/daily-menu.repository.js";
import { FORECAST_STATUS, CANTEEN_CLOSING_HOUR } from "./ai.constants.js";
import {
  DAILY_MENU_ITEM_STATUS,
  PRICE_SOURCE,
} from "../menu/daily-menu/daily-menu.constants.js";
import * as userRepository from "../user/user.repository.js";
import { getIO } from "../../sockets/socket.js";

/**
 * Helper to fetch and serialize database data into JSON structure for AI API payload.
 */
const getSerializedDataForAI = async () => {
  console.log("Serializing real data for AI Service...");

  // 1. Get Food Items
  const foodItems = await foodItemRepository.findAllActiveWithCategory();
  const foodItemsData = foodItems.map((item) => ({
    item_id: item._id.toString(),
    item_name: item.name,
    category_id: item.categoryId?._id?.toString() || "",
    category_name: item.categoryId?.name || "",
  }));

  // 2. Get Sales (Orders) - limited to last 90 days to optimize database & network payload
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const orders = await orderRepository.findCompletedOrdersSince(ninetyDaysAgo);
  const salesData = [];
  orders.forEach((order) => {
    const timestamp = order.createdAt
      ? order.createdAt.toISOString().replace("T", " ").substring(0, 19)
      : "";

    order.items.forEach((item) => {
      salesData.push({
        transaction_id: order.orderNumber,
        timestamp: timestamp,
        item_id: item.foodItemId.toString(),
        quantity: item.quantity,
        unit_price: item.unitPrice,
      });
    });
  });

  // 3. Get Scheduled Menus
  const scheduledMenus = await scheduledMenuRepository.findAllRaw();
  const scheduledMenuData = [];
  scheduledMenus.forEach((sm) => {
    sm.menuItems.forEach((mi) => {
      scheduledMenuData.push({
        day_of_week: sm.dayOfWeek,
        item_id: mi.foodItemId.toString(),
      });
    });
  });

  return {
    food_items: foodItemsData,
    sales: salesData,
    scheduled_menu: scheduledMenuData,
  };
};

/**
 * Step 2: Trigger the FastAPI endpoint and get predictions.
 */
const runAIPrediction = async (targetDate, dataPayload) => {
  console.log(`Triggering AI Inference API for target date: ${targetDate}`);
  const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
  try {
    const response = await fetch(`${aiServiceUrl}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target_date: targetDate,
        sales: dataPayload.sales,
        scheduled_menu: dataPayload.scheduled_menu,
        food_items: dataPayload.food_items,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Service HTTP error: ${response.status} - ${errorText}`);
    }

    const parsedOutput = await response.json();
    return parsedOutput;
  } catch (error) {
    console.error("AI Prediction HTTP Request Failed:", error);
    throw new AppError(
      `Failed to execute AI prediction service: ${error.message}`,
      500,
      "AI_PREDICTION_FAILED",
    );
  }
};

/**
 * Master function to orchestrate the flow and save to DB.
 */
export const generateDailyInsight = async (targetDate) => {
  // 1. Retrieve & serialize DB data
  const dataPayload = await getSerializedDataForAI();

  // 2. Get predictions from FastAPI AI service
  const aiOutput = await runAIPrediction(targetDate, dataPayload);

  if (!aiOutput || !aiOutput.forecasts) {
    throw new AppError(
      "Invalid output received from AI Module.",
      500,
      "AI_INVALID_OUTPUT",
    );
  }

  if (aiOutput.forecasts.length === 0) {
    throw new AppError(
      "AI could not generate forecasts. No sales history available for the requested date.",
      422,
      "AI_NO_FORECAST_DATA",
    );
  }

  // 3. Save Insight to Database
  const latestInsight = await aiRepository.findLatestByDate(
    aiOutput.targetDate,
  );
  // Version = simple run counter: how many times we've generated for this date
  const nextVersion = latestInsight ? latestInsight.version + 1 : 1;

  const savedInsight = await aiRepository.createInsight({
    targetDate: new Date(aiOutput.targetDate),
    version: nextVersion,
    forecasts: aiOutput.forecasts,
    metrics: aiOutput.metrics || { confidence: 0, modelName: "Unknown" },
    pricingRecommendations: [], // Can be filled by a pricing AI logic later
  });

  console.log(`Insight successfully saved to DB for date: ${targetDate}`);
  return savedInsight;
};

/**
 * Get the latest insight for a specific target date.
 */
export const getInsightByDate = async (targetDate, version) => {
  let insight;
  if (version) {
    insight = await aiRepository.findByDateAndVersion(
      targetDate,
      parseInt(version),
    );
  } else {
    insight = await aiRepository.findLatestByDate(targetDate);
  }
  if (!insight) {
    throw new AppError("AI Insight not found.", 404, "INSIGHT_NOT_FOUND");
  }
  return insight;
};

export const getVersionsByDate = async (targetDate) => {
  const versions = await aiRepository.findVersionsByDate(targetDate);
  return versions.map((v) => ({
    version: v.version,
    generatedAt: v.generatedAt,
  }));
};

/**
 * Apply AI recommended quantities to the daily menu items.
 */
export const applyForecasts = async (insightId, updates, userId) => {
  const insight = await aiRepository.findById(insightId);
  if (!insight) {
    throw new AppError("AI Insight not found.", 404, "INSIGHT_NOT_FOUND");
  }

  const targetDate = insight.targetDate;
  const targetDateStr = new Date(targetDate).toISOString().substring(0, 10);
  const dailyMenu = await dailyMenuRepository.findMenuByDate(targetDateStr);
  if (!dailyMenu) {
    throw new AppError(
      `Daily Menu for date ${targetDateStr} does not exist. Please generate the daily menu first before applying forecasts.`,
      400,
      "DAILY_MENU_NOT_FOUND",
    );
  }

  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }
  const isAdmin = user.role === "Admin";

  let updatedCount = 0;
  const dbUpdates = [];

  for (const update of updates) {
    const { foodItemId, status } = update;

    const forecast = insight.forecasts.find(
      (f) => f.foodItemId.toString() === foodItemId.toString(),
    );

    if (!forecast) {
      continue;
    }

    // BR-AI-02 Recommendation Immutability
    // Once a recommendation transitions from 'Pending' to either 'Applied' or 'Rejected',
    // its status becomes final and cannot be reverted (except by Admin under specific conditions).
    if (forecast.status !== FORECAST_STATUS.PENDING) {
      if (!isAdmin) {
        throw new AppError(
          "Recommendation is already finalized. Only Admins can override it.",
          403,
          "OVERRIDE_FORBIDDEN",
        );
      } else {
        const finalizedById = forecast.appliedBy || forecast.rejectedBy;
        if (finalizedById) {
          if (finalizedById.toString() === userId.toString()) {
            throw new AppError(
              "Admins cannot override their own finalized recommendations.",
              403,
              "OVERRIDE_FORBIDDEN_SELF",
            );
          }
          const finalizedByUser =
            await userRepository.findUserById(finalizedById);
          if (finalizedByUser && finalizedByUser.role !== "Manager") {
            throw new AppError(
              "Admins can only override recommendations finalized by a Manager.",
              403,
              "OVERRIDE_FORBIDDEN_NOT_MANAGER",
            );
          }
        }
      }
    }

    const menuItem = dailyMenu.items.find(
      (item) => item.foodItemId._id.toString() === foodItemId.toString(),
    );

    // Exception 22.0.E1 Item Removed from Daily Menu
    if (!menuItem) {
      forecast.status = FORECAST_STATUS.REJECTED;
      forecast.rejectedBy = userId;
      forecast.rejectedAt = new Date();
      forecast.appliedBy = null;
      forecast.appliedAt = null;
      updatedCount++;
      throw new AppError(
        "Cannot apply recommendation; the target item is no longer on today's menu.",
        400,
        "ITEM_REMOVED",
      );
    }

    if (status === FORECAST_STATUS.APPLIED) {
      // BR-DailyMenu-02 Quantity Rules
      if (
        forecast.recommendedQuantity < 0 ||
        forecast.recommendedQuantity < menuItem.soldQuantity
      ) {
        throw new AppError(
          `Cannot apply recommendation; the recommended quantity (${forecast.recommendedQuantity}) is less than the already sold quantity (${menuItem.soldQuantity}).`,
          400,
          "INVALID_QUANTITY",
        );
      }

      forecast.status = FORECAST_STATUS.APPLIED;
      forecast.appliedBy = userId;
      forecast.appliedAt = new Date();
      forecast.rejectedBy = null;
      forecast.rejectedAt = null;

      dbUpdates.push(
        dailyMenuRepository.updateMenuItemFields(dailyMenu._id, foodItemId, {
          preparedQuantity: forecast.recommendedQuantity,
          remainingQuantity:
            forecast.recommendedQuantity - menuItem.soldQuantity,
          quantityAdjustedBy: userId,
          adjustedAt: new Date(),
        }),
      );
      updatedCount++;
    } else if (status === FORECAST_STATUS.REJECTED) {
      // Admin override: Revert if changing from Applied to Rejected
      if (forecast.status === FORECAST_STATUS.APPLIED) {
        dbUpdates.push(
          dailyMenuRepository.updateMenuItemFields(dailyMenu._id, foodItemId, {
            preparedQuantity: 0,
            remainingQuantity: 0, // Reset quantity
            quantityAdjustedBy: userId,
            adjustedAt: new Date(),
          }),
        );
      }

      forecast.status = FORECAST_STATUS.REJECTED;
      forecast.rejectedBy = userId;
      forecast.rejectedAt = new Date();
      forecast.appliedBy = null;
      forecast.appliedAt = null;
      updatedCount++;
    }
  }

  // Run all daily-menu updates in parallel, then save insight
  if (updatedCount > 0) {
    await Promise.all(dbUpdates);
    await aiRepository.saveInsight(insight);
  }

  return aiRepository.findById(insightId);
};

/**
 * Generate dynamic pricing recommendations based on today's remaining inventory and forecast.
 */
export const generateDynamicPricingRecommendations = async (targetDateStr) => {
  const targetDate = new Date(targetDateStr);
  const latestInsight = await aiRepository.findLatestByDate(targetDate);

  if (!latestInsight) {
    throw new AppError(
      "AI Insight not found. Cannot generate pricing recommendations.",
      404,
      "INSIGHT_NOT_FOUND",
    );
  }

  const dailyMenu = await dailyMenuRepository.findMenuByDate(targetDateStr);
  if (!dailyMenu || !dailyMenu.isConfigured) {
    throw new AppError(
      "Daily Menu is not configured for the target date.",
      400,
      "DAILY_MENU_NOT_CONFIGURED",
    );
  }

  const recommendations = [];
  const now = new Date();

  const closingTime = new Date(targetDateStr);
  closingTime.setHours(CANTEEN_CLOSING_HOUR, 0, 0, 0);

  for (const menuItem of dailyMenu.items) {
    if (
      menuItem.status !== DAILY_MENU_ITEM_STATUS.AVAILABLE ||
      menuItem.remainingQuantity <= 0
    ) {
      continue; // Skip out of stock or unavailable items
    }

    const foodItemId = menuItem.foodItemId._id;
    const cost = menuItem.foodItemId.cost;
    const originalPrice = menuItem.originalPrice;

    // Find forecast
    const forecast = latestInsight.forecasts.find(
      (f) => f.foodItemId.toString() === foodItemId.toString(),
    );
    if (!forecast) {
      continue;
    }

    const forecastToday = forecast.predictedDemand;
    const soldToday = menuItem.soldQuantity;

    // D_remain = max(0, ForecastToday - SoldToday)
    const demandRemain = Math.max(0, forecastToday - soldToday);

    // Excess = remainingQuantity - D_remain
    const excess = Math.max(0, menuItem.remainingQuantity - demandRemain);
    const excessRatio = excess / menuItem.remainingQuantity;

    if (excess <= 0) {
      continue; // No excess expected, no need to discount
    }

    let discountPercentage = 0;
    let reason = "";

    const currentHour = now.getHours() + now.getMinutes() / 60;

    // Rule-based discount rules for Lunch and Dinner
    if (currentHour >= 12.5 && currentHour < 14) {
      // 12:30 - 14:00 (Xả quầy trưa)
      if (excessRatio >= 0.1 && excessRatio <= 0.3) {
        discountPercentage = 10;
        reason = "Tồn dư nhỏ, xả quầy trưa";
      } else if (excessRatio > 0.3 && excessRatio <= 0.6) {
        discountPercentage = 20;
        reason = "Tồn dư vừa, xả quầy trưa";
      } else if (excessRatio > 0.6) {
        discountPercentage = 30;
        reason = "Tồn dư cao, xả quầy trưa";
      }
    } else if (currentHour >= 16 && currentHour < 18) {
      // 16:00 - 18:00 (Sắp đóng quầy tối)
      if (excessRatio >= 0.1 && excessRatio <= 0.3) {
        discountPercentage = 10;
        reason = "Tồn dư nhỏ, sắp đóng quầy tối";
      } else if (excessRatio > 0.3 && excessRatio <= 0.6) {
        discountPercentage = 20;
        reason = "Tồn dư vừa, sắp đóng quầy tối";
      } else if (excessRatio > 0.6) {
        discountPercentage = 30;
        reason = "Tồn dư cao, sắp đóng quầy tối";
      }
    } else if (currentHour >= 18) {
      // After 18:00 (< 2 hours remaining)
      if (excessRatio >= 0.1 && excessRatio <= 0.3) {
        discountPercentage = 20;
        reason = "Tồn dư nhỏ, sát giờ đóng quầy tối";
      } else if (excessRatio > 0.3 && excessRatio <= 0.6) {
        discountPercentage = 30;
        reason = "Tồn dư vừa, sát giờ đóng quầy tối";
      } else if (excessRatio > 0.6) {
        discountPercentage = 50;
        reason = "Tồn dư cao, xả hàng cuối ngày";
      }
    } else {
      // Before 12:30 or between 14:00 and 16:00
      continue; // No discount yet
    }

    if (discountPercentage > 0) {
      const discountedPrice = originalPrice * (1 - discountPercentage / 100);
      const floorPrice = cost * 1.05;

      const recommendedPrice = Math.max(floorPrice, discountedPrice);

      recommendations.push({
        foodItemId: foodItemId,
        name: menuItem.foodItemId.name,
        currentRemaining: menuItem.remainingQuantity,
        originalPrice: originalPrice,
        recommendedPrice: recommendedPrice,
        recommendedDiscountPercentage: discountPercentage,
        reason: reason,
        status: FORECAST_STATUS.PENDING,
      });
    }
  }

  // Upsert-merge: keep existing recommendations that are NOT in the new batch,
  // then add/replace with the freshly computed ones.
  const newFoodItemIds = new Set(
    recommendations.map((r) => r.foodItemId.toString()),
  );
  const kept = (latestInsight.pricingRecommendations || []).filter(
    (r) => !newFoodItemIds.has(r.foodItemId.toString()),
  );
  latestInsight.pricingRecommendations = [...kept, ...recommendations];
  await aiRepository.saveInsight(latestInsight);

  return latestInsight;
};

/**
 * Apply AI pricing recommendations.
 */
export const applyPricingRecommendations = async (
  insightId,
  updates,
  userId,
) => {
  const insight = await aiRepository.findById(insightId);
  if (!insight) {
    throw new AppError("AI Insight not found.", 404, "INSIGHT_NOT_FOUND");
  }

  const targetDateStr = new Date(insight.targetDate)
    .toISOString()
    .substring(0, 10);
  const dailyMenu = await dailyMenuRepository.findMenuByDate(targetDateStr);
  if (!dailyMenu) {
    throw new AppError("Daily Menu not found.", 400, "DAILY_MENU_NOT_FOUND");
  }

  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }
  const isAdmin = user.role === "Admin";

  let updatedCount = 0;
  const dbUpdates = [];

  for (const update of updates) {
    const { foodItemId, status } = update;

    const recommendation = insight.pricingRecommendations.find(
      (r) => r.foodItemId.toString() === foodItemId.toString(),
    );

    if (!recommendation) {
      continue;
    }

    // BR-AI-02 Recommendation Immutability
    if (recommendation.status !== FORECAST_STATUS.PENDING) {
      if (!isAdmin) {
        throw new AppError(
          "Recommendation is already finalized. Only Admins can override it.",
          403,
          "OVERRIDE_FORBIDDEN",
        );
      } else {
        const finalizedById =
          recommendation.appliedBy || recommendation.rejectedBy;
        if (finalizedById) {
          if (finalizedById.toString() === userId.toString()) {
            throw new AppError(
              "Admins cannot override their own finalized recommendations.",
              403,
              "OVERRIDE_FORBIDDEN_SELF",
            );
          }
          const finalizedByUser =
            await userRepository.findUserById(finalizedById);
          if (finalizedByUser && finalizedByUser.role !== "Manager") {
            throw new AppError(
              "Admins can only override recommendations finalized by a Manager.",
              403,
              "OVERRIDE_FORBIDDEN_NOT_MANAGER",
            );
          }
        }
      }
    }

    const menuItem = dailyMenu.items.find(
      (item) => item.foodItemId._id.toString() === foodItemId.toString(),
    );

    // Exception 21.0.E1 Item Sold Out Concurrently
    if (!menuItem || menuItem.remainingQuantity <= 0) {
      recommendation.status = FORECAST_STATUS.REJECTED;
      recommendation.rejectedBy = userId;
      recommendation.rejectedAt = new Date();
      recommendation.appliedBy = null;
      recommendation.appliedAt = null;
      updatedCount++;
      await aiRepository.saveInsight(insight);
      throw new AppError(
        "Cannot apply recommendation; the item is already sold out.",
        400,
        "ITEM_SOLD_OUT",
      );
    }

    if (status === FORECAST_STATUS.APPLIED) {
      recommendation.status = FORECAST_STATUS.APPLIED;
      recommendation.appliedBy = userId;
      recommendation.appliedAt = new Date();
      recommendation.rejectedBy = null;
      recommendation.rejectedAt = null;

      const priceHistoryEntry = {
        oldValue: menuItem.currentPrice,
        newValue: recommendation.recommendedPrice,
        changedBy: userId,
        changedAt: new Date(),
        source: PRICE_SOURCE.AI,
        recommendationId: insightId,
        reason: update.reason || "Áp dụng đề xuất định giá AI",
      };

      dbUpdates.push(
        dailyMenuRepository.pushPriceHistoryAndUpdatePrice(
          dailyMenu._id,
          foodItemId,
          recommendation.recommendedPrice,
          priceHistoryEntry,
        ),
      );
      updatedCount++;
    } else if (status === FORECAST_STATUS.REJECTED) {
      // Revert pricing to original if Admin overrides Applied to Rejected
      if (recommendation.status === FORECAST_STATUS.APPLIED) {
        const priceHistoryEntry = {
          oldValue: menuItem.currentPrice,
          newValue: recommendation.originalPrice,
          changedBy: userId,
          changedAt: new Date(),
          source: PRICE_SOURCE.AI,
          recommendationId: insightId,
          reason: "Reverted AI Pricing Recommendation (Override)",
        };

        dbUpdates.push(
          dailyMenuRepository.pushPriceHistoryAndUpdatePrice(
            dailyMenu._id,
            foodItemId,
            recommendation.originalPrice,
            priceHistoryEntry,
          ),
        );
      }

      recommendation.status = FORECAST_STATUS.REJECTED;
      recommendation.rejectedBy = userId;
      recommendation.rejectedAt = new Date();
      recommendation.appliedBy = null;
      recommendation.appliedAt = null;
      updatedCount++;
    }
  }

  // Run all daily-menu updates in parallel, then save insight
  if (updatedCount > 0) {
    await Promise.all(dbUpdates);
    await aiRepository.saveInsight(insight);

    // Broadcast change to POS frontend
    const io = getIO();
    if (io) {
      io.emit("price-updated", {
        insightId,
        updates: updates.map((u) => ({
          foodItemId: u.foodItemId,
          status: u.status,
        })),
      });
    }
  }

  return aiRepository.findById(insightId);
};
