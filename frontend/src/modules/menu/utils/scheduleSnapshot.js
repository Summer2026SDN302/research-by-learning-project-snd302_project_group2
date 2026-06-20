export const extractFoodItemIds = (menuItems = []) =>
  menuItems.map((item) => String(item.foodItemId?._id || item.foodItemId));

export const buildSavedSnapshot = (schedule = []) => {
  const snapshot = {};

  for (const day of schedule) {
    snapshot[day.dayOfWeek] = extractFoodItemIds(day.menuItems);
  }

  return snapshot;
};

export const isDayDirty = (dayOfWeek, schedule, savedSnapshot) => {
  const day = schedule.find((entry) => entry.dayOfWeek === dayOfWeek);
  if (!day) return false;

  const current = extractFoodItemIds(day.menuItems);
  const saved = savedSnapshot[dayOfWeek] || [];

  if (current.length !== saved.length) return true;

  const sortedCurrent = [...current].sort();
  const sortedSaved = [...saved].sort();

  return sortedCurrent.some((id, index) => id !== sortedSaved[index]);
};

export const getDirtyDays = (schedule, savedSnapshot) =>
  schedule
    .filter((day) => isDayDirty(day.dayOfWeek, schedule, savedSnapshot))
    .map((day) => day.dayOfWeek);
