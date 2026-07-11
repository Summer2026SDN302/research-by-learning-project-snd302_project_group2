import { toObjectId } from "../../../shared/helpers/mongo.helper.js";
import mongoose from "mongoose";
import DailyMenu from "./daily-menu.model.js";
import { DAILY_MENU_ITEM_STATUS } from "./daily-menu.constants.js";
import AppError from "../../../shared/exceptions/AppError.js";

export const countByFoodItemId = async (foodItemId) => {
  return DailyMenu.countDocuments({
    "items.foodItemId": toObjectId(foodItemId),
  });
};
export const countActiveByFoodItemId = async (foodItemId, fromDate) => {
  return DailyMenu.countDocuments({
    date: { $gte: fromDate },
    items: {
      $elemMatch: {
        foodItemId: toObjectId(foodItemId),
        status: "Available",
      },
    },
  });
};

export const findMenuByDate = async (date, filter = {}) => {
  return DailyMenu.findOne({ date, ...filter })
    .populate("createdBy", "-passwordHash")
    .populate({
      path: "items.foodItemId",
      populate: {
        path: "categoryId",
        select: "name icon",
      },
    })
    .populate("items.priceHistory.changedBy", "-passwordHash");
};

export const findMenuById = async (menuId) => {
  return DailyMenu.findById(menuId)
    .populate("createdBy", "-passwordHash")
    .populate({
      path: "items.foodItemId",
      populate: {
        path: "categoryId",
        select: "name icon",
      },
    })
    .populate("items.priceHistory.changedBy", "-passwordHash");
};

export const createMenu = async (payload) => {
  return DailyMenu.create(payload);
};

export const saveMenu = async (menu) => {
  return menu.save();
};

export const updateMenuItemFields = async (
  menuId,
  foodItemId,
  fieldsToUpdate,
) => {
  // Build $set object with prefixed field paths
  const updateObj = {};
  Object.keys(fieldsToUpdate).forEach((key) => {
    updateObj[`items.$[item].${key}`] = fieldsToUpdate[key];
  });

  const result = await DailyMenu.findByIdAndUpdate(
    menuId,
    {
      $set: updateObj,
    },
    {
      arrayFilters: [
        { "item.foodItemId": new mongoose.Types.ObjectId(foodItemId) },
      ],
      new: true,
    },
  )
    .populate("createdBy", "-passwordHash")
    .populate({
      path: "items.foodItemId",
      populate: {
        path: "categoryId",
        select: "name",
      },
    })
    .populate("items.priceHistory.changedBy", "-passwordHash");

  if (!result) {
    throw new AppError("Update failed", 500, "UPDATE_FAILED");
  }

  return result;
};

export const pushPriceHistoryAndUpdatePrice = async (
  menuId,
  foodItemId,
  currentPrice,
  priceHistoryEntry,
) => {
  const result = await DailyMenu.findByIdAndUpdate(
    menuId,
    {
      $set: { "items.$[item].currentPrice": currentPrice },
      $push: { "items.$[item].priceHistory": priceHistoryEntry },
    },
    {
      arrayFilters: [
        { "item.foodItemId": new mongoose.Types.ObjectId(foodItemId) },
      ],
      new: true,
    },
  )
    .populate("createdBy", "-passwordHash")
    .populate({
      path: "items.foodItemId",
      populate: {
        path: "categoryId",
        select: "name icon",
      },
    })
    .populate("items.priceHistory.changedBy", "-passwordHash");
  if (!result) throw new AppError("Update failed", 500, "UPDATE_FAILED");
  return result;
};

export const updateMenuIsConfigured = async (menuId) => {
  const result = await DailyMenu.findByIdAndUpdate(
    menuId,
    { $set: { isConfigured: true } },
    { new: true },
  )
    .populate("createdBy", "-passwordHash")
    .populate({
      path: "items.foodItemId",
      populate: {
        path: "categoryId",
        select: "name icon",
      },
    })
    .populate("items.priceHistory.changedBy", "-passwordHash");
  return result;
};

export const addMenuItem = async (menuId, newItem) => {
  const updateObj = Array.isArray(newItem)
    ? { $push: { items: { $each: newItem } } }
    : { $push: { items: newItem } };

  const result = await DailyMenu.findByIdAndUpdate(menuId, updateObj, {
    new: true,
  })
    .populate("createdBy", "-passwordHash")
    .populate({
      path: "items.foodItemId",
      populate: {
        path: "categoryId",
        select: "name icon",
      },
    })
    .populate("items.priceHistory.changedBy", "-passwordHash");

  if (!result) {
    throw new AppError("Update failed", 500, "UPDATE_FAILED");
  }

  return result;
};

export const removeMenuItem = async (menuId, foodItemId) => {
  const result = await DailyMenu.findByIdAndUpdate(
    menuId,
    {
      $pull: { items: { foodItemId: new mongoose.Types.ObjectId(foodItemId) } },
    },
    { new: true },
  )
    .populate("createdBy", "-passwordHash")
    .populate({
      path: "items.foodItemId",
      populate: {
        path: "categoryId",
        select: "name icon",
      },
    })
    .populate("items.priceHistory.changedBy", "-passwordHash");

  if (!result) {
    throw new AppError("Update failed", 500, "UPDATE_FAILED");
  }

  return result;
};

/**
 * Decrement soldQuantity and remainingQuantity for a single item in a daily menu.
 * Returns the Mongoose UpdateResult (contains matchedCount, modifiedCount).
 */
export const decrementItemSoldQuantity = async (
  menuId,
  foodItemId,
  quantity,
  session,
) => {
  return DailyMenu.updateOne(
    { _id: menuId, "items.foodItemId": toObjectId(foodItemId) },
    {
      $inc: {
        "items.$.soldQuantity": quantity,
        "items.$.remainingQuantity": -quantity,
      },
    },
    session ? { session } : {},
  );
};

export const incrementSoldQuantity = async (
  menuId,
  foodItemId,
  quantity,
  session,
) => {
  return DailyMenu.findByIdAndUpdate(
    menuId,
    {
      $inc: {
        "items.$[item].soldQuantity": -quantity,
        "items.$[item].remainingQuantity": quantity,
      },
    },
    {
      // Guard: chỉ hoàn trả nếu soldQuantity đủ lớn, tránh để giá trị âm.
      // Trường hợp soldQuantity < quantity là bất thường (dữ liệu bị lệch),
      // giữ nguyên thay vì tạo giá trị âm.
      arrayFilters: [
        {
          "item.foodItemId": toObjectId(foodItemId),
          "item.soldQuantity": { $gte: quantity },
        },
      ],
      new: true,
      session,
    },
  );
};

export const setItemUnavailable = async (menuId, foodItemId) => {
  return DailyMenu.findByIdAndUpdate(
    menuId,
    { $set: { "items.$[item].status": DAILY_MENU_ITEM_STATUS.UNAVAILABLE } },
    {
      arrayFilters: [
        { "item.foodItemId": new mongoose.Types.ObjectId(foodItemId) },
      ],
      new: true,
    },
  );
};

export const expireMenuStatus = async (menuId) => {
  return DailyMenu.updateOne(
    { _id: menuId },
    {
      $set: {
        "items.$[elem].status": "Unavailable",
      },
    },
    {
      arrayFilters: [{ "elem.status": "Available" }],
    },
  );
};

export const expireAllPastMenus = async (beforeDateStr) => {
  return DailyMenu.updateMany(
    { date: { $lt: beforeDateStr } },
    { $set: { "items.$[elem].status": DAILY_MENU_ITEM_STATUS.UNAVAILABLE } },
    { arrayFilters: [{ "elem.status": DAILY_MENU_ITEM_STATUS.AVAILABLE }] },
  );
};

export const setFoodItemUnavailableFromDate = async (foodItemId, fromDate) => {
  return DailyMenu.updateMany(
    {
      date: { $gte: fromDate },
      items: {
        $elemMatch: {
          foodItemId: toObjectId(foodItemId),
          status: DAILY_MENU_ITEM_STATUS.AVAILABLE,
        },
      },
    },
    {
      $set: {
        "items.$[item].status": DAILY_MENU_ITEM_STATUS.UNAVAILABLE,
      },
    },
    {
      arrayFilters: [
        {
          "item.foodItemId": toObjectId(foodItemId),
          "item.status": DAILY_MENU_ITEM_STATUS.AVAILABLE,
        },
      ],
    },
  );
};
