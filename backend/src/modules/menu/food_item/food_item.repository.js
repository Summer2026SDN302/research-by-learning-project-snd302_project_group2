import mongoose from "mongoose";

import DailyMenu from "../daily_menu/daily_menu.model.js";
import ScheduledMenu from "../scheduled_menu/scheduled_menu.model.js";
import Order from "../../order/order.model.js";
import { escapeRegex } from "../../../shared/helpers/regex.helper.js";
import FoodItem from "./food_item.model.js";

const buildListFilter = ({ search, categoryId, isArchived }) => {
  const filter = { deletedAt: null };

  if (search) {
    filter.name = { $regex: escapeRegex(search), $options: "i" };
  }

  if (categoryId) {
    filter.categoryId = new mongoose.Types.ObjectId(categoryId);
  }

  if (isArchived !== undefined) {
    filter.isArchived = isArchived;
  }

  return filter;
};

const categoryLookupStages = [
  {
    $lookup: {
      from: "categories",
      localField: "categoryId",
      foreignField: "_id",
      as: "category",
    },
  },
  {
    $addFields: {
      categoryName: {
        $ifNull: [{ $arrayElemAt: ["$category.name", 0] }, null],
      },
    },
  },
  {
    $project: {
      category: 0,
    },
  },
];

const foodItemRepository = {
  async findAll({ search, page, limit, categoryId, isArchived }) {
    const filter = buildListFilter({ search, categoryId, isArchived });
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      FoodItem.aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        ...categoryLookupStages,
        { $skip: skip },
        { $limit: limit },
      ]),
      FoodItem.countDocuments(filter),
    ]);

    return { items, total };
  },

  async findById(id) {
    return FoodItem.findOne({ _id: id, deletedAt: null });
  },

  async findByIdWithCategory(id) {
    const [foodItem] = await FoodItem.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id), deletedAt: null } },
      ...categoryLookupStages,
    ]);

    return foodItem ?? null;
  },

  async create(data) {
    return FoodItem.create(data);
  },

  async updateById(id, data) {
    return FoodItem.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: data },
      { new: true, runValidators: true },
    );
  },

  async updateArchiveById(id, isArchived) {
    return FoodItem.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { isArchived } },
      { new: true, runValidators: true },
    );
  },

  async softDeleteById(id, deletedBy) {
    return FoodItem.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date(), deletedBy } },
      { new: true },
    );
  },

  async isReferencedInMenusOrOrders(foodItemId) {
    const objectId = new mongoose.Types.ObjectId(foodItemId);

    const [dailyMenuCount, scheduledMenuCount, orderCount] = await Promise.all([
      DailyMenu.countDocuments({ "items.foodItemId": objectId }),
      ScheduledMenu.countDocuments({ "menuItems.foodItemId": objectId }),
      Order.countDocuments({ "items.foodItemId": objectId }),
    ]);

    return dailyMenuCount + scheduledMenuCount + orderCount > 0;
  },
};

export default foodItemRepository;
