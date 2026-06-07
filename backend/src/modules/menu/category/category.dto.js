export const ALLOWED_ICONS = [
  "local_dining",
  "local_bar",
  "bakery_dining",
  "icecream",
  "coffee",
  "cake",
  "breakfast_dining",
  "restaurant",
  "restaurant_menu",
];

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

export const sendSuccess = (res, statusCode, message, data) =>
  res.status(statusCode).json({
    success: true,
    message,
    data,
    error: null,
  });

export const sendError = (res, statusCode, message, code, details = []) =>
  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error: {
      code,
      details,
    },
  });
