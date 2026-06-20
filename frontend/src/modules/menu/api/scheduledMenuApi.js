import apiClient from "../../../services/apiClient";

export const getWeeklySchedule = async () => {
  const res = await apiClient.get("/scheduled-menu");
  return res.data.data;
};

export const updateDaySchedule = async (dayOfWeek, foodItemIds) => {
  const res = await apiClient.put(`/scheduled-menu/${dayOfWeek}`, { foodItemIds });
  return res.data.data;
};

