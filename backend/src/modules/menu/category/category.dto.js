export const toCategoryResponse = (category) => ({
  _id: category._id,
  name: category.name,
  description: category.description ?? null,
  icon: category.icon ?? "restaurant_menu",
  isActive: category.isActive,
  foodItemCount: category.foodItemCount ?? 0,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
});
