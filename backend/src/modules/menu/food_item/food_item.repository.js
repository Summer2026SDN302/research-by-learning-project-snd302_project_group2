import FoodItem from "./food_item.model.js";

export const findFoodItemsByIds = async (ids) => {
  return FoodItem.find({
    _id: { $in: ids },
    isArchived: false,
  }).select("_id basePrice name");
};

export const findFoodItemById = async (id) => {
  return FoodItem.findOne({
    _id: id,
    isArchived: false,
  }).select("_id basePrice name");
};
