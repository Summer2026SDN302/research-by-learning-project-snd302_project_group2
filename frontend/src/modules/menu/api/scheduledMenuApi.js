import apiClient from "../../../services/apiClient";

export const getWeeklySchedule = async () => {
  const res = await apiClient.get("/scheduled-menu");
  return res.data.data;
};

export const updateDaySchedule = async (dayOfWeek, foodItemIds) => {
  const res = await apiClient.put(`/scheduled-menu/${dayOfWeek}`, { foodItemIds });
  return res.data.data;
};

export const getFoodItems = async (params) => {
  const res = await apiClient.get("/food-items", { params });
  return res.data.data;
};

export const fetchAllFoodItems = async (params = {}) => {
  const allItems = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const data = await getFoodItems({
      ...params,
      page,
      limit: 50,
      isArchived: "false",
    });
    allItems.push(...(data?.items || []));
    totalPages = data?.pagination?.totalPages || 1;
    page += 1;
  }

  return allItems;
};

export const getCategories = async () => {
  const res = await apiClient.get("/categories");
  return res.data.data;
};
