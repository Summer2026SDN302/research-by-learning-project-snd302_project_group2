import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

import scheduledMenuReducer from "../../../redux/scheduledMenuSlice";
import useScheduledMenu from "../useScheduledMenu";
import * as scheduledMenuApi from "../../../api/scheduledMenuApi";
import * as foodItemApi from "../../../api/foodItemApi";
import * as categoryApi from "../../../api/categoryApi";

vi.mock("../../../api/scheduledMenuApi", () => ({
  getWeeklySchedule: vi.fn(),
  updateDaySchedule: vi.fn(),
}));

vi.mock("../../../api/foodItemApi", () => ({
  fetchAllFoodItems: vi.fn(),
}));

vi.mock("../../../api/categoryApi", () => ({
  getCategories: vi.fn(),
}));

const toastMock = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
};

vi.mock("../../../../../hooks/useAppToast", () => ({
  default: () => ({ toast: toastMock }),
}));

const FOOD_ID_1 = "507f1f77bcf86cd799439011";
const FOOD_ID_2 = "507f1f77bcf86cd799439012";

const weeklySchedule = [
  { dayOfWeek: "Monday", menuItems: [{ foodItemId: { _id: FOOD_ID_1, name: "Phở Bò" } }] },
  { dayOfWeek: "Tuesday", menuItems: [] },
];

const foodItems = [
  { _id: FOOD_ID_1, name: "Phở Bò", categoryId: { _id: "cat1" } },
  { _id: FOOD_ID_2, name: "Cơm gà", categoryId: { _id: "cat2" } },
];

const createWrapper = (preloadedState) => {
  const store = configureStore({
    reducer: { scheduledMenu: scheduledMenuReducer },
    preloadedState,
  });

  return ({ children }) => <Provider store={store}>{children}</Provider>;
};

describe("useScheduledMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    scheduledMenuApi.getWeeklySchedule.mockResolvedValue(weeklySchedule);
    foodItemApi.fetchAllFoodItems.mockResolvedValue(foodItems);
    categoryApi.getCategories.mockResolvedValue({ items: [{ _id: "cat1", name: "Ăn sáng" }] });
    scheduledMenuApi.updateDaySchedule.mockResolvedValue({});
  });

  it("loads schedule and picker data on mount", async () => {
    const { result } = renderHook(() => useScheduledMenu(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.schedule).toHaveLength(2);
    });

    expect(scheduledMenuApi.getWeeklySchedule).toHaveBeenCalled();
    expect(foodItemApi.fetchAllFoodItems).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it("adds items to day locally without duplicates", async () => {
    const { result } = renderHook(() => useScheduledMenu(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.schedule).toHaveLength(2));

    act(() => {
      result.current.addItemsToDay("Tuesday", [foodItems[1]]);
    });

    expect(result.current.schedule[1].menuItems).toHaveLength(1);
    expect(result.current.hasUnsavedChanges).toBe(true);
    expect(result.current.dirtyDays).toContain("Tuesday");

    act(() => {
      result.current.addItemsToDay("Tuesday", [foodItems[1]]);
    });

    expect(result.current.schedule[1].menuItems).toHaveLength(1);
  });

  it("removes item from day locally", async () => {
    const { result } = renderHook(() => useScheduledMenu(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.schedule).toHaveLength(2));

    act(() => {
      result.current.removeItemFromDay("Monday", FOOD_ID_1);
    });

    expect(result.current.schedule[0].menuItems).toHaveLength(0);
    expect(result.current.dirtyDays).toContain("Monday");
  });

  it("filters picker items by search and category", async () => {
    const { result } = renderHook(() => useScheduledMenu(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.filteredPickerItems).toHaveLength(2));

    act(() => {
      result.current.updatePickerFilters({ search: "cơm" });
    });
    expect(result.current.filteredPickerItems).toHaveLength(1);
    expect(result.current.filteredPickerItems[0].name).toBe("Cơm gà");

    act(() => {
      result.current.updatePickerFilters({ search: "", category: "cat1" });
    });
    expect(result.current.filteredPickerItems).toHaveLength(1);
    expect(result.current.filteredPickerItems[0].name).toBe("Phở Bò");
  });

  it("saveAllSchedule saves only dirty days and shows success toast", async () => {
    const { result } = renderHook(() => useScheduledMenu(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.schedule).toHaveLength(2));

    act(() => {
      result.current.addItemsToDay("Tuesday", [foodItems[1]]);
    });

    await act(async () => {
      await result.current.saveAllSchedule();
    });

    expect(scheduledMenuApi.updateDaySchedule).toHaveBeenCalledTimes(1);
    expect(scheduledMenuApi.updateDaySchedule).toHaveBeenCalledWith("Tuesday", [FOOD_ID_2]);
    expect(toastMock.success).toHaveBeenCalledWith(
      "Đã lưu",
      "Lịch thực đơn tuần đã được cập nhật.",
    );
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it("saveAllSchedule shows info toast when nothing changed", async () => {
    const { result } = renderHook(() => useScheduledMenu(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.schedule).toHaveLength(2));

    await act(async () => {
      await result.current.saveAllSchedule();
    });

    expect(scheduledMenuApi.updateDaySchedule).not.toHaveBeenCalled();
    expect(toastMock.info).toHaveBeenCalledWith(
      "Thông báo",
      "Không có thay đổi cần lưu.",
    );
  });

  it("cancelAllEdits reverts all local edits to saved snapshot", async () => {
    const { result } = renderHook(() => useScheduledMenu(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.schedule).toHaveLength(2));

    act(() => {
      result.current.addItemsToDay("Tuesday", [foodItems[1]]);
      result.current.removeItemFromDay("Monday", FOOD_ID_1);
    });

    expect(result.current.hasUnsavedChanges).toBe(true);

    act(() => {
      result.current.cancelAllEdits();
    });

    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(result.current.schedule[0].menuItems).toHaveLength(1);
    expect(result.current.schedule[1].menuItems).toHaveLength(0);
  });

  it("shows error toast when initial fetch fails", async () => {
    scheduledMenuApi.getWeeklySchedule.mockRejectedValue({
      response: { data: { message: "Server error" } },
    });

    renderHook(() => useScheduledMenu(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith("Lỗi", "Server error");
    });
  });
});
