import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import DayColumn from "../DayColumn";

const FOOD_ID = "507f1f77bcf86cd799439011";

const makeDay = (dayOfWeek, menuItems = []) => ({
  dayOfWeek,
  menuItems,
});

describe("DayColumn", () => {
  it("renders weekday label and item count", () => {
    render(
      <DayColumn
        day={makeDay("Monday", [{ foodItemId: { _id: FOOD_ID, name: "Phở Bò" } }])}
        onAddItem={vi.fn()}
        onRemoveItem={vi.fn()}
      />,
    );

    expect(screen.getByText("Thứ 2")).toBeInTheDocument();
    expect(screen.getByText("1 món")).toBeInTheDocument();
    expect(screen.getByText("Phở Bò")).toBeInTheDocument();
  });

  it("shows empty state for weekday without items", () => {
    render(
      <DayColumn day={makeDay("Wednesday")} onAddItem={vi.fn()} onRemoveItem={vi.fn()} />,
    );

    expect(screen.getByText("Chưa có món")).toBeInTheDocument();
  });

  it("shows weekend message for Saturday without items", () => {
    render(
      <DayColumn day={makeDay("Saturday")} onAddItem={vi.fn()} onRemoveItem={vi.fn()} />,
    );

    expect(screen.getByText("Nghỉ cuối tuần")).toBeInTheDocument();
  });

  it("calls onSaveDay when dirty save button is clicked", async () => {
    const user = userEvent.setup();
    const onSaveDay = vi.fn();

    render(
      <DayColumn
        day={makeDay("Friday")}
        isDirty
        onAddItem={vi.fn()}
        onRemoveItem={vi.fn()}
        onSaveDay={onSaveDay}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Lưu Thứ 6" }));

    expect(onSaveDay).toHaveBeenCalledWith("Friday");
  });

  it("calls onAddItem when clicking Thêm món", async () => {
    const user = userEvent.setup();
    const onAddItem = vi.fn();

    render(
      <DayColumn day={makeDay("Friday")} onAddItem={onAddItem} onRemoveItem={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: /Thêm món/i }));

    expect(onAddItem).toHaveBeenCalledWith("Friday");
  });

  it("calls onRemoveItem when clicking delete button", async () => {
    const user = userEvent.setup();
    const onRemoveItem = vi.fn();

    render(
      <DayColumn
        day={makeDay("Monday", [
          {
            foodItemId: {
              _id: FOOD_ID,
              name: "Phở Bò",
              categoryId: { name: "Ăn sáng" },
            },
          },
        ])}
        onAddItem={vi.fn()}
        onRemoveItem={onRemoveItem}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Xóa món" }));

    expect(onRemoveItem).toHaveBeenCalledWith("Monday", FOOD_ID);
  });
});
