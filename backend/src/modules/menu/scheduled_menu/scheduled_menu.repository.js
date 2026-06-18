import { toObjectId } from "../../../shared/helpers/mongo.helper.js";
import ScheduledMenu from "./scheduled_menu.model.js";

const FOOD_ITEM_POPULATE = {
  path: "menuItems.foodItemId",
  select: "name basePrice categoryId",
  populate: { path: "categoryId", select: "name" },
};

const scheduledMenuRepository = {
  async countByFoodItemId(foodItemId) {
    return ScheduledMenu.countDocuments({
      "menuItems.foodItemId": toObjectId(foodItemId),
    });
  },

  async findAll() {
    return ScheduledMenu.find().populate(FOOD_ITEM_POPULATE).lean();
  },

  async findByDay(day) {
    return ScheduledMenu.findOne({ dayOfWeek: day }).populate(FOOD_ITEM_POPULATE).lean();
  },

  async upsertByDay(day, menuItems, userId) {
    const existing = await ScheduledMenu.findOne({ dayOfWeek: day });

    if (existing) {
      existing.menuItems = menuItems;
      existing.updatedBy = toObjectId(userId);
      await existing.save();
      return ScheduledMenu.findById(existing._id).populate(FOOD_ITEM_POPULATE).lean();
    }

    const created = await ScheduledMenu.create({
      dayOfWeek: day,
      menuItems,
      createdBy: toObjectId(userId),
      updatedBy: null,
    });

    return ScheduledMenu.findById(created._id).populate(FOOD_ITEM_POPULATE).lean();
  },
};

export default scheduledMenuRepository;
