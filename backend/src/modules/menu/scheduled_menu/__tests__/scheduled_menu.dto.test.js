import { describe, expect, it } from "vitest";

import {
  toEmptyScheduledMenuDayResponse,
  toScheduledMenuDayResponse,
  toScheduledMenuFoodItemResponse,
} from "../scheduled_menu.dto.js";

const FOOD_ID = "507f1f77bcf86cd799439011";
const CATEGORY_ID = "507f1f77bcf86cd799439022";

describe("scheduled_menu.dto", () => {
  it("maps populated food item fields", () => {
    const result = toScheduledMenuFoodItemResponse({
      foodItemId: {
        _id: FOOD_ID,
        name: "Phở Bò",
        basePrice: 35000,
        categoryId: { _id: CATEGORY_ID, name: "Ăn sáng" },
      },
    });

    expect(result).toEqual({
      foodItemId: {
        _id: FOOD_ID,
        name: "Phở Bò",
        basePrice: 35000,
        categoryId: { _id: CATEGORY_ID, name: "Ăn sáng" },
      },
    });
  });

  it("maps scheduled menu day response", () => {
    const result = toScheduledMenuDayResponse({
      dayOfWeek: "Monday",
      menuItems: [{ foodItemId: { _id: FOOD_ID, name: "Phở Bò", basePrice: 35000 } }],
      createdAt: "2026-06-14T00:00:00.000Z",
      updatedAt: "2026-06-14T00:00:00.000Z",
    });

    expect(result.dayOfWeek).toBe("Monday");
    expect(result.menuItems).toHaveLength(1);
    expect(result.createdAt).toBe("2026-06-14T00:00:00.000Z");
  });

  it("maps empty day response", () => {
    expect(toEmptyScheduledMenuDayResponse("Sunday")).toEqual({
      dayOfWeek: "Sunday",
      menuItems: [],
      createdAt: null,
      updatedAt: null,
    });
  });
});
