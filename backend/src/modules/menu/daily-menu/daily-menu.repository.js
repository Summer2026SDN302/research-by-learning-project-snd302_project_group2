import mongoose from "mongoose";
import DailyMenu from "./daily-menu.model.js";

export const findMenuByDate = async (date) => {
  return DailyMenu.findOne({ date })
    .populate("createdBy", "-passwordHash")
    .populate("items.foodItemId")
    .populate("items.priceHistory.changedBy", "-passwordHash");
};

export const findMenuById = async (menuId) => {
  return DailyMenu.findById(menuId)
    .populate("createdBy", "-passwordHash")
    .populate("items.foodItemId")
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
    .populate("items.foodItemId")
    .populate("items.priceHistory.changedBy", "-passwordHash");

  if (!result) {
    throw new Error("UPDATE_FAILED");
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
    .populate("items.foodItemId")
    .populate("items.priceHistory.changedBy", "-passwordHash");
  if (!result) throw new Error("UPDATE_FAILED");
  return result;
};

export const updateMenuIsConfigured = async (menuId) => {
  const result = await DailyMenu.findByIdAndUpdate(
    menuId,
    { $set: { isConfigured: true } },
    { new: true },
  );
  return result;
};

export const addMenuItem = async (menuId, newItem) => {
  const result = await DailyMenu.findByIdAndUpdate(
    menuId,
    { $push: { items: newItem } },
    { new: true },
  )
    .populate("createdBy", "-passwordHash")
    .populate("items.foodItemId")
    .populate("items.priceHistory.changedBy", "-passwordHash");

  if (!result) {
    throw new Error("UPDATE_FAILED");
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
    .populate("items.foodItemId")
    .populate("items.priceHistory.changedBy", "-passwordHash");

  if (!result) {
    throw new Error("UPDATE_FAILED");
  }

  return result;
};

export const decrementSoldQuantity = async (menuId, foodItemId, quantity) => {
  const result = await DailyMenu.findByIdAndUpdate(
    menuId,
    {
      $inc: {
        "items.$[item].soldQuantity": quantity,
        "items.$[item].remainingQuantity": -quantity,
      },
    },
    {
      arrayFilters: [
        {
          "item.foodItemId": new mongoose.Types.ObjectId(foodItemId),
          "item.remainingQuantity": { $gte: quantity },
        },
      ],
      new: true,
    },
  );

  if (!result) throw new Error("UPDATE_FAILED");
  return result;
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
