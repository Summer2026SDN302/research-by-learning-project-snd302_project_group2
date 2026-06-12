export const toFoodItemResponse = (foodItem) => ({
  _id: foodItem._id,
  categoryId: foodItem.categoryId,
  categoryName: foodItem.categoryName ?? null,
  name: foodItem.name,
  description: foodItem.description ?? null,
  basePrice: foodItem.basePrice,
  cost: foodItem.cost,
  isActive: foodItem.isActive,
  isArchived: foodItem.isArchived,
  createdAt: foodItem.createdAt,
  updatedAt: foodItem.updatedAt,
});
