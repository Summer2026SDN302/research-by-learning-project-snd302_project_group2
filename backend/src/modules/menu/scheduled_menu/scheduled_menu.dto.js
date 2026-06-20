export const toScheduledMenuFoodItemResponse = (menuItem) => {
  const food = menuItem?.foodItemId;

  if (!food || typeof food !== "object") {
    return { foodItemId: food ?? null };
  }

  const category = food.categoryId;

  return {
    foodItemId: {
      _id: food._id,
      name: food.name,
      basePrice: food.basePrice,
      categoryId: category
        ? {
            _id: category._id ?? category,
            name: category.name ?? null,
          }
        : null,
    },
  };
};

export const toScheduledMenuDayResponse = (doc) => ({
  dayOfWeek: doc.dayOfWeek,
  menuItems: (doc.menuItems || []).map(toScheduledMenuFoodItemResponse),
  createdAt: doc.createdAt ?? null,
  updatedAt: doc.updatedAt ?? null,
});

export const toEmptyScheduledMenuDayResponse = (dayOfWeek) => ({
  dayOfWeek,
  menuItems: [],
  createdAt: null,
  updatedAt: null,
});
