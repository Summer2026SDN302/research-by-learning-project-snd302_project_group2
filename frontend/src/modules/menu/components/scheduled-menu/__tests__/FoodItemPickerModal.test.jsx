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
  initialSelectedIds: [],
  onSearch: vi.fn(),
  onCategory: vi.fn(),
  onAdd: vi.fn(),
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

  it("allows selecting food items and clicking Add button", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(<FoodItemPickerModal {...defaultProps} onAdd={onAdd} />);

    // Click on Phở Bò to check it
    await user.click(screen.getByText("Phở Bò"));

    // The Add button should now show "Thêm (1) món" and be enabled
    const addButton = screen.getByRole("button", { name: /Thêm \(1\) món/i });
    expect(addButton).toBeEnabled();

    // Click add button
    await user.click(addButton);

    // expect onAdd to be called with Phở Bò item
    expect(onAdd).toHaveBeenCalledWith([items[0]]);
  });

  it("disables items that are already in the schedule", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(
      <FoodItemPickerModal
        {...defaultProps}
        initialSelectedIds={["food1"]}
        onAdd={onAdd}
      />
    );

    // Phở Bò (food1) should be marked as added and its checkbox disabled
    expect(screen.getByText("Đã thêm")).toBeInTheDocument();
    const checkbox = screen.getAllByRole("checkbox")[0];
    expect(checkbox).toBeDisabled();

    // Clicking Phở Bò should not select it
    await user.click(screen.getByText("Phở Bò"));

    // Add button should remain disabled because no new item is selected
    const addButton = screen.getByRole("button", { name: "Thêm món" });
    expect(addButton).toBeDisabled();
  });

  it("calls onClose when clicking close button in header", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<FoodItemPickerModal {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Đóng" }));

    expect(onClose).toHaveBeenCalled();
  });
});
