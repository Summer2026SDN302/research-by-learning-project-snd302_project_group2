const normalizeId = (value) => {
  if (!value) return null;

  if (typeof value === "object" && value._id) {
    return value._id;
  }

  return value;
};

export const toFoodItemResponse = (foodItem) => ({
  _id: foodItem._id,
  categoryId: foodItem.categoryId,
  categoryName: foodItem.categoryName ?? null,

  name: foodItem.name,
  description: foodItem.description ?? null,
  basePrice: foodItem.basePrice,
  cost: foodItem.cost,

  isArchived: foodItem.isArchived,

  deletedAt: foodItem.deletedAt ?? null,
  deletedBy: normalizeId(foodItem.deletedBy),
  deletedByName:
    foodItem.deletedByName ??
    foodItem.deletedBy?.fullName ??
    null,
  deletedByEmail:
    foodItem.deletedByEmail ??
    foodItem.deletedBy?.email ??
    null,

  createdAt: foodItem.createdAt,
  updatedAt: foodItem.updatedAt,
});