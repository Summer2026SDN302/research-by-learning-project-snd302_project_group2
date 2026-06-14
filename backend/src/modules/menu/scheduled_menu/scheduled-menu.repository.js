import ScheduledMenu from "./scheduled_menu.model.js";

export const findByDayOfWeek = async (dayOfWeek) => {
  return ScheduledMenu.findOne({ dayOfWeek })
    .populate("menuItems.foodItemId")
    .populate("createdBy", "-passwordHash")
    .populate("updatedBy", "-passwordHash");
};
