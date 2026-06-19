import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ScheduledMenuPage from "../ScheduledMenuPage";

const mockHook = {
  schedule: [
    { dayOfWeek: "Monday", menuItems: [{ foodItemId: { _id: "f1", name: "Phở Bò" } }] },
    { dayOfWeek: "Tuesday", menuItems: [] },
  ],
  isLoading: false,
  isSaving: false,
  hasUnsavedChanges: true,
  dirtyDays: ["Monday"],
  pickerOpen: false,
  pickerDay: null,
  pickerSearch: "",
  pickerCategory: "",
  filteredPickerItems: [],
  categories: [],
  openPicker: vi.fn(),
  closePicker: vi.fn(),
  addItemsToDay: vi.fn(),
  removeItemFromDay: vi.fn(),
  saveDaySchedule: vi.fn(),
  saveAllSchedule: vi.fn().mockResolvedValue(true),
  updatePickerFilters: vi.fn(),
};

vi.mock("../../hooks/scheduled-menu/useScheduledMenu", () => ({
  default: () => mockHook,
}));

vi.mock("react-redux", () => ({
  useSelector: vi.fn(() => ({ role: "admin" })),
}));

describe("ScheduledMenuPage", () => {
  it("renders page header and day columns", () => {
    render(<ScheduledMenuPage />);

    expect(screen.getByRole("heading", { name: "Thực đơn theo lịch" })).toBeInTheDocument();
    expect(screen.getByText("Thứ 2")).toBeInTheDocument();
    expect(screen.getByText("Phở Bò")).toBeInTheDocument();
  });

  it("opens confirm dialog and saves when confirmed", async () => {
    const user = userEvent.setup();
    render(<ScheduledMenuPage />);

    await user.click(screen.getByRole("button", { name: /Lưu thay đổi/i }));
    expect(screen.getByText("Lưu thay đổi lịch tuần?")).toBeInTheDocument();

    const confirmButtons = screen.getAllByRole("button", { name: /Lưu thay đổi/i });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(mockHook.saveAllSchedule).toHaveBeenCalled();
  });

  it("opens single-day confirm dialog and saves when confirmed", async () => {
    const user = userEvent.setup();
    render(<ScheduledMenuPage />);

    const saveMondayButton = screen.getByRole("button", { name: "Lưu Thứ 2" });
    await user.click(saveMondayButton);

    expect(screen.getByText("Lưu thay đổi lịch Thứ 2?")).toBeInTheDocument();

    const confirmButtons = screen.getAllByRole("button", { name: "Lưu thay đổi" });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(mockHook.saveDaySchedule).toHaveBeenCalledWith("Monday");
  });

  it("disables save button when there are no unsaved changes", () => {
    mockHook.hasUnsavedChanges = false;
    render(<ScheduledMenuPage />);

    expect(screen.getByRole("button", { name: /Lưu thay đổi/i })).toBeDisabled();
    mockHook.hasUnsavedChanges = true;
  });
});
