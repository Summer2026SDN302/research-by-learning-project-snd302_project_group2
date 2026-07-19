import asyncHandler from "../../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../../shared/response/responseFormatter.js";
import scheduledMenuService from "./scheduled_menu.service.js";

export const getWeeklySchedule = asyncHandler(async (req, res) => {
  const data = await scheduledMenuService.getWeeklySchedule();
  return successResponse(res, data, "Weekly schedule retrieved successfully");
});

export const updateDaySchedule = asyncHandler(async (req, res) => {
  const { dayOfWeek } = req.params;
  const { foodItemIds } = req.body;
  const data = await scheduledMenuService.updateDaySchedule(
    dayOfWeek,
    foodItemIds,
    req.userId,
  );
  return successResponse(res, data, "Schedule updated successfully");
});

export const batchUpdateSchedule = asyncHandler(async (req, res) => {
  const { days } = req.body;
  const data = await scheduledMenuService.batchUpdateSchedule(days, req.userId);
  return successResponse(res, data, "Weekly schedule updated successfully");
});
