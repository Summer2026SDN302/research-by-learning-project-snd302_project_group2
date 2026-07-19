import AppError from "../../../shared/exceptions/AppError.js";
import * as dailyMenuRepository from "./daily-menu.repository.js";
import { triggerLowStockNotification } from "../../notification/notification.service.js";
import scheduledMenuRepository from "../scheduled_menu/scheduled_menu.repository.js";
import * as foodItemRepository from "../food_item/food_item.repository.js";
import {
  DATE_FORMAT_REGEX,
  DAYS_OF_WEEK,
  DAILY_MENU_ITEM_STATUS,
  PRICE_SOURCE,
} from "./daily-menu.constants.js";
import { USER_ROLES } from "../../user/user.constants.js";
import { getTodayVNDateString } from "../../../shared/helpers/date.helper.js";

const validateDateFormat = (date) => {
  if (!DATE_FORMAT_REGEX.test(date)) {
    throw new AppError("Invalid date format", 400, "INVALID_DATE_FORMAT");
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new AppError("Invalid date", 400, "INVALID_DATE_FORMAT");
  }
};

const getDayOfWeek = (dateString) => {
  const date = new Date(dateString);
  return DAYS_OF_WEEK[date.getDay()];
};

const normalizeExpiredMenuStatus = async (menu) => {
  if (!menu) return menu;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const menuDate = new Date(menu.date);
  menuDate.setHours(0, 0, 0, 0);

  if (menuDate.getTime() >= today.getTime()) {
    return menu;
  }

  const hasAvailableItems = menu.items.some(
    (item) => item.status === DAILY_MENU_ITEM_STATUS.AVAILABLE,
  );

  if (hasAvailableItems) {
    await dailyMenuRepository.expireMenuStatus(menu._id);
    menu.items = menu.items.map((item) => {
      if (item.status === DAILY_MENU_ITEM_STATUS.AVAILABLE) {
        item.status = DAILY_MENU_ITEM_STATUS.UNAVAILABLE;
      }
      return item;
    });
  }

  return menu;
};

export const getTodayMenu = async (role, query = {}) => {
  const todayDate = getTodayVNDateString();
  const filter = {};

  if (role === USER_ROLES.STAFF) {
    filter.isConfigured = true;
  } else if (query.isConfigured !== undefined && query.isConfigured !== "") {
    filter.isConfigured =
      query.isConfigured === "true" || query.isConfigured === true;
  }

  const menu = await dailyMenuRepository.findMenuByDate(todayDate, filter);

  return menu;
};

export const getMenuByDate = async (date) => {
  validateDateFormat(date);

  const menu = await dailyMenuRepository.findMenuByDate(date);

  if (!menu) {
    throw new AppError("Daily menu not found", 404, "DAILY_MENU_NOT_FOUND");
  }

  return await normalizeExpiredMenuStatus(menu);
};

export const generateDailyMenu = async (date, createdBy = null) => {
  validateDateFormat(date);

  // Check if menu already exists
  const existingMenu = await dailyMenuRepository.findMenuByDate(date);
  if (existingMenu) {
    throw new AppError(
      "Daily menu already exists for this date",
      409,
      "DAILY_MENU_ALREADY_EXISTS",
    );
  }

  // Get the day of week
  const dayOfWeek = getDayOfWeek(date);

  // Get scheduled menu for this day
  const scheduledMenu =
    await scheduledMenuRepository.findByDayOfWeek(dayOfWeek);

  if (!scheduledMenu) {
    throw new AppError(
      "No scheduled menu found for this day",
      404,
      "SCHEDULED_MENU_NOT_FOUND",
    );
  }

  // Extract all foodItemIds from scheduled menu
  const foodItemIds = scheduledMenu.menuItems
    .map((item) => {
      if (typeof item.foodItemId === "object" && item.foodItemId._id) {
        return item.foodItemId._id.toString();
      }
      return item.foodItemId.toString();
    })
    .filter((id) => id);

  // Batch query all food items at once
  const foodItems = await foodItemRepository.findFoodItemsByIds(foodItemIds);

  // Create a map for O(1) lookup
  const foodItemMap = new Map(
    foodItems.map((item) => [item._id.toString(), item]),
  );

  // Map food items from scheduled menu to daily menu items
  const dailyMenuItems = scheduledMenu.menuItems
    .map((scheduledItem) => {
      let foodItemId;
      if (
        typeof scheduledItem.foodItemId === "object" &&
        scheduledItem.foodItemId._id
      ) {
        foodItemId = scheduledItem.foodItemId._id.toString();
      } else {
        foodItemId = scheduledItem.foodItemId.toString();
      }
      const foodItem = foodItemMap.get(foodItemId);

      // Skip if food item not found or is deleted
      if (!foodItem) {
        return null;
      }

      return {
        foodItemId: foodItem._id,
        originalPrice: foodItem.basePrice,
        currentPrice: foodItem.basePrice,
        preparedQuantity: 0,
        soldQuantity: 0,
        remainingQuantity: 0,
        status: DAILY_MENU_ITEM_STATUS.AVAILABLE,
        priceHistory: [],
        quantityAdjustedBy: null,
        adjustedAt: null,
      };
    })
    .filter((item) => item !== null);

  if (dailyMenuItems.length === 0) {
    throw new AppError(
      "No active food items found in the scheduled menu for this day",
      400,
      "SCHEDULED_MENU_EMPTY",
    );
  }

  // Create and return new daily menu
  const newMenu = await dailyMenuRepository.createMenu({
    date,
    isConfigured: false,
    items: dailyMenuItems,
    createdBy,
  });

  return await dailyMenuRepository.findMenuById(newMenu._id);
};

export const publishDailyMenu = async (menuId) => {
  const menu = await dailyMenuRepository.findMenuById(menuId);
  if (!menu) {
    throw new AppError("Daily menu not found", 404, "DAILY_MENU_NOT_FOUND");
  }

  if (menu.isConfigured) {
    throw new AppError(
      "Daily menu is already published",
      409,
      "DAILY_MENU_ALREADY_PUBLISHED",
    );
  }

  return await dailyMenuRepository.updateMenuIsConfigured(menuId);
};

export const updateDailyMenuItem = async (menuId, itemId, payload, userId) => {
  // Validate payload
  if (
    payload.preparedQuantity !== undefined &&
    (typeof payload.preparedQuantity !== "number" ||
      payload.preparedQuantity < 1)
  ) {
    throw new AppError(
      "Prepared quantity must be a positive number",
      400,
      "INVALID_QUANTITY",
    );
  }

  if (
    payload.currentPrice !== undefined &&
    (typeof payload.currentPrice !== "number" || payload.currentPrice <= 0)
  ) {
    throw new AppError(
      "Current price must be a positive number",
      400,
      "INVALID_PRICE",
    );
  }

  if (
    payload.status &&
    !Object.values(DAILY_MENU_ITEM_STATUS).includes(payload.status)
  ) {
    throw new AppError(
      "Status must be either 'Available' or 'Unavailable'",
      400,
      "INVALID_STATUS",
    );
  }

  // Find the menu to get current item state
  const menu = await dailyMenuRepository.findMenuById(menuId);
  if (!menu) {
    throw new AppError("Daily menu not found", 404, "DAILY_MENU_NOT_FOUND");
  }

  // Find the item
  const item = menu.items.find((i) => i.foodItemId._id.toString() === itemId);
  if (!item) {
    throw new AppError(
      "Item not found in daily menu",
      404,
      "DAILY_MENU_ITEM_NOT_FOUND",
    );
  }
  if (
    payload.preparedQuantity !== undefined &&
    payload.preparedQuantity < item.soldQuantity
  ) {
    throw new AppError(
      "Prepared quantity cannot be less than sold quantity",
      400,
      "INVALID_PREPARED_QUANTITY",
    );
  }

  const fieldsToUpdate = {};

  // Handle prepared quantity update
  if (payload.preparedQuantity !== undefined) {
    fieldsToUpdate.preparedQuantity = payload.preparedQuantity;
    fieldsToUpdate.remainingQuantity =
      payload.preparedQuantity - item.soldQuantity;
    fieldsToUpdate.quantityAdjustedBy = userId;
    fieldsToUpdate.adjustedAt = new Date();
  }

  // Handle status update
  if (payload.status !== undefined) {
    fieldsToUpdate.status = payload.status;
  }

  // Handle price update with history
  if (payload.currentPrice !== undefined) {
    const priceHistoryEntry = {
      oldValue: item.currentPrice,
      newValue: payload.currentPrice,
      changedBy: userId,
      changedAt: new Date(),
      source: PRICE_SOURCE.MANUAL,
      recommendationId: null,
      reason: payload.reason || null,
    };

    fieldsToUpdate.currentPrice = payload.currentPrice;
    fieldsToUpdate.priceHistory = [...item.priceHistory, priceHistoryEntry];
  }

  try {
    // ATOMIC UPDATE: single field-by-field $set operation
    const updatedMenu = await dailyMenuRepository.updateMenuItemFields(
      menuId,
      itemId,
      fieldsToUpdate,
    );

    const updatedItem = updatedMenu.items.find((i) => i.foodItemId._id.toString() === itemId);
    if (updatedItem && fieldsToUpdate.preparedQuantity !== undefined) {
      triggerLowStockNotification(
        updatedMenu.date,
        updatedItem.foodItemId._id.toString(),
        updatedItem.foodItemId.name,
        updatedItem.remainingQuantity
      ).catch((err) => console.error("Error triggering low stock notification:", err));
    }

    return updatedMenu;
  } catch (error) {
    if (error.message === "UPDATE_FAILED") {
      throw new AppError(
        "Item not found in daily menu",
        404,
        "DAILY_MENU_ITEM_NOT_FOUND",
      );
    }
    throw error;
  }
};

export const applyAiQuantity = async (
  menuId,
  itemId,
  recommendedQuantity,
  userId,
) => {
  // Validate
  if (typeof recommendedQuantity !== "number" || recommendedQuantity <= 0) {
    throw new AppError(
      "Recommended quantity must be a positive integer",
      400,
      "INVALID_QUANTITY",
    );
  }

  // Find the menu to get current item state
  const menu = await dailyMenuRepository.findMenuById(menuId);
  if (!menu) {
    throw new AppError("Daily menu not found", 404, "DAILY_MENU_NOT_FOUND");
  }

  // Find the item
  const item = menu.items.find((i) => i.foodItemId._id.toString() === itemId);
  if (!item) {
    throw new AppError(
      "Item not found in daily menu",
      404,
      "DAILY_MENU_ITEM_NOT_FOUND",
    );
  }

  try {
    // ATOMIC UPDATE: single field-by-field $set operation
    const updatedMenu = await dailyMenuRepository.updateMenuItemFields(
      menuId,
      itemId,
      {
        preparedQuantity: recommendedQuantity,
        remainingQuantity: recommendedQuantity - item.soldQuantity,
        quantityAdjustedBy: userId,
        adjustedAt: new Date(),
      },
    );

    const updatedItem = updatedMenu.items.find((i) => i.foodItemId._id.toString() === itemId);
    if (updatedItem) {
      triggerLowStockNotification(
        updatedMenu.date,
        updatedItem.foodItemId._id.toString(),
        updatedItem.foodItemId.name,
        updatedItem.remainingQuantity
      ).catch((err) => console.error("Error triggering low stock notification:", err));
    }

    return updatedMenu;
  } catch (error) {
    if (error.message === "UPDATE_FAILED") {
      throw new AppError(
        "Item not found in daily menu",
        404,
        "DAILY_MENU_ITEM_NOT_FOUND",
      );
    }
    throw error;
  }
};

export const applyAiPrice = async (
  menuId,
  itemId,
  recommendedPrice,
  recommendationId,
  userId,
) => {
  // Validate
  if (typeof recommendedPrice !== "number" || recommendedPrice <= 0) {
    throw new AppError(
      "Recommended price must be a positive number",
      400,
      "INVALID_PRICE",
    );
  }

  // Find the menu to get current item state
  const menu = await dailyMenuRepository.findMenuById(menuId);
  if (!menu) {
    throw new AppError("Daily menu not found", 404, "DAILY_MENU_NOT_FOUND");
  }

  // Find the item
  const item = menu.items.find((i) => i.foodItemId._id.toString() === itemId);
  if (!item) {
    throw new AppError(
      "Item not found in daily menu",
      404,
      "DAILY_MENU_ITEM_NOT_FOUND",
    );
  }

  const priceHistoryEntry = {
    oldValue: item.currentPrice,
    newValue: recommendedPrice,
    changedBy: userId,
    changedAt: new Date(),
    source: PRICE_SOURCE.AI,
    recommendationId: recommendationId || null,
    reason: null,
  };

  try {
    // Update history + price
    const updatedMenu =
      await dailyMenuRepository.pushPriceHistoryAndUpdatePrice(
        menuId,
        itemId,
        recommendedPrice,
        priceHistoryEntry,
      );
    return updatedMenu;
  } catch (error) {
    if (error.message === "UPDATE_FAILED") {
      throw new AppError(
        "Item not found in daily menu",
        404,
        "DAILY_MENU_ITEM_NOT_FOUND",
      );
    }
    throw error;
  }
};

export const addFoodItemToDailyMenu = async (menuId, foodItemId, userId) => {
  // Validate menu exists
  const menu = await dailyMenuRepository.findMenuById(menuId);
  if (!menu) {
    throw new AppError("Daily menu not found", 404, "DAILY_MENU_NOT_FOUND");
  }

  const ids = Array.isArray(foodItemId) ? foodItemId : [foodItemId];
  const newItems = [];

  for (const id of ids) {
    // Check item already in menu
    const existing = menu.items.find(
      (i) =>
        i.foodItemId?._id?.toString() === id || i.foodItemId?.toString() === id,
    );
    if (existing) {
      if (!Array.isArray(foodItemId)) {
        throw new AppError(
          "Food item already exists in daily menu",
          409,
          "DAILY_MENU_ITEM_ALREADY_EXISTS",
        );
      }
      continue;
    }

    // Validate food item exists and active
    const foodItem = await foodItemRepository.findFoodItemById(id);
    if (!foodItem) {
      if (!Array.isArray(foodItemId)) {
        throw new AppError(
          "Food item not found or is archived",
          404,
          "FOOD_ITEM_NOT_FOUND",
        );
      }
      continue;
    }

    newItems.push({
      foodItemId: foodItem._id,
      originalPrice: foodItem.basePrice,
      currentPrice: foodItem.basePrice,
      preparedQuantity: 0,
      soldQuantity: 0,
      remainingQuantity: 0,
      status: DAILY_MENU_ITEM_STATUS.AVAILABLE,
      priceHistory: [],
      quantityAdjustedBy: null,
      adjustedAt: null,
    });
  }

  if (newItems.length === 0) {
    if (Array.isArray(foodItemId)) {
      return menu;
    }
    throw new AppError("No items to add", 400, "NO_ITEMS_TO_ADD");
  }

  try {
    return await dailyMenuRepository.addMenuItem(
      menuId,
      Array.isArray(foodItemId) ? newItems : newItems[0],
    );
  } catch (error) {
    if (error.message === "UPDATE_FAILED") {
      throw new AppError("Daily menu not found", 404, "DAILY_MENU_NOT_FOUND");
    }
    throw error;
  }
};

export const removeFoodItemFromDailyMenu = async (menuId, itemId) => {
  const menu = await dailyMenuRepository.findMenuById(menuId);
  if (!menu) {
    throw new AppError("Daily menu not found", 404, "DAILY_MENU_NOT_FOUND");
  }

  const item = menu.items.find((i) => i.foodItemId._id.toString() === itemId);
  if (!item) {
    throw new AppError(
      "Item not found in daily menu",
      404,
      "DAILY_MENU_ITEM_NOT_FOUND",
    );
  }

  if (item.soldQuantity > 0) {
    throw new AppError(
      "Cannot remove item that has been sold, set status to Unavailable instead",
      409,
      "DAILY_MENU_ITEM_HAS_SALES",
    );
  }

  try {
    return await dailyMenuRepository.removeMenuItem(menuId, itemId);
  } catch (error) {
    if (error.message === "UPDATE_FAILED") {
      throw new AppError("Daily menu not found", 404, "DAILY_MENU_NOT_FOUND");
    }
    throw error;
  }
};
