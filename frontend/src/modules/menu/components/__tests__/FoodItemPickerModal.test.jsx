import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import FoodItemPickerModal from "../FoodItemPickerModal";

const categories = [{ _id: "cat1", name: "Ăn sáng" }];
const items = [
  {
    _id: "food1",
    name: "Phở Bò",
    basePrice: 35000,
    categoryId: { _id: "cat1", name: "Ăn sáng" },
  },
  {
    _id: "food2",
    name: "Cơm gà",
    basePrice: 30000,
    categoryId: { _id: "cat1", name: "Ăn sáng" },
  },
];

const defaultProps = {
  open: true,
  day: "Monday",
  search: "",
  category: "",
  categories,
  items,
  onSearch: vi.fn(),
  onCategory: vi.fn(),
  onSelect: vi.fn(),
  onClose: vi.fn(),
};

describe("FoodItemPickerModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<FoodItemPickerModal {...defaultProps} open={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders title with day label and food items", () => {
    render(<FoodItemPickerModal {...defaultProps} />);

    expect(screen.getByText("Thêm món — Thứ 2")).toBeInTheDocument();
    expect(screen.getByText("Phở Bò")).toBeInTheDocument();
    expect(screen.getByText("Cơm gà")).toBeInTheDocument();
  });

  it("shows empty state when no items match filter", () => {
    render(<FoodItemPickerModal {...defaultProps} items={[]} />);

    expect(screen.getByText("Không tìm thấy món")).toBeInTheDocument();
  });

  it("calls onSelect when clicking a food item", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<FoodItemPickerModal {...defaultProps} onSelect={onSelect} />);

    await user.click(screen.getByRole("button", { name: /Phở Bò/i }));

    expect(onSelect).toHaveBeenCalledWith(items[0]);
  });

  it("calls onClose when clicking close buttons", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<FoodItemPickerModal {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Đóng" }));

    expect(onClose).toHaveBeenCalled();
  });
});
