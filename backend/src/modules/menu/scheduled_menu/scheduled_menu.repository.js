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
  async findByDayOfWeek(dayOfWeek) {
    return ScheduledMenu.findOne({ dayOfWeek })
      .populate("menuItems.foodItemId")
      .populate("createdBy", "-passwordHash")
      .populate("updatedBy", "-passwordHash");
  },

  async findAll() {
    return ScheduledMenu.find().populate(FOOD_ITEM_POPULATE).lean();
  },

  async findByDay(day) {
    return ScheduledMenu.findOne({ dayOfWeek: day })
      .populate(FOOD_ITEM_POPULATE)
      .lean();
  },

  async upsertByDay(day, menuItems, userId) {
    return ScheduledMenu.findOneAndUpdate(
      { dayOfWeek: day },
      {
        $set: {
          menuItems,
          updatedBy: toObjectId(userId),
        },
        $setOnInsert: {
          createdBy: toObjectId(userId),
        },
      },
      { upsert: true, returnDocument: "after", runValidators: true },
    )
      .populate(FOOD_ITEM_POPULATE)
      .lean();
  },

  async removeFoodItemFromAllSchedules(foodItemId) {
  return ScheduledMenu.updateMany(
    {
      "menuItems.foodItemId": toObjectId(foodItemId),
    },
    {
      $pull: {
        menuItems: {
          foodItemId: toObjectId(foodItemId),
        },
      },
    },
  );
},
};

export default scheduledMenuRepository;
