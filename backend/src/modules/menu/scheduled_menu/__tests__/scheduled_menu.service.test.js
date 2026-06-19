import { beforeEach, describe, expect, it, vi } from "vitest";

import AppError from "../../../../shared/exceptions/AppError.js";
import foodItemRepository from "../../food_item/food_item.repository.js";
import scheduledMenuRepository from "../scheduled_menu.repository.js";
import scheduledMenuService from "../scheduled_menu.service.js";
import { DAY_OF_WEEK } from "../scheduled_menu.constants.js";

vi.mock("../scheduled_menu.repository.js", () => ({
  default: {
    findAll: vi.fn(),
    findByDay: vi.fn(),
    upsertByDay: vi.fn(),
  },
}));

vi.mock("../../food_item/food_item.repository.js", () => ({
  default: {
    countActiveByIds: vi.fn(),
  },
}));

const FOOD_ID_1 = "507f1f77bcf86cd799439011";
const FOOD_ID_2 = "507f1f77bcf86cd799439012";
const USER_ID = "507f1f77bcf86cd799439099";

describe("scheduledMenuService.getWeeklySchedule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all 7 days in Monday-Sunday order", async () => {
    scheduledMenuRepository.findAll.mockResolvedValue([
      {
        dayOfWeek: "Monday",
        menuItems: [{ foodItemId: { _id: FOOD_ID_1, name: "Phở Bò" } }],
        createdAt: "2026-06-14T00:00:00.000Z",
        updatedAt: "2026-06-14T00:00:00.000Z",
      },
      {
        dayOfWeek: "Wednesday",
        menuItems: [{ foodItemId: { _id: FOOD_ID_2, name: "Cơm gà" } }],
        createdAt: "2026-06-14T00:00:00.000Z",
        updatedAt: "2026-06-14T00:00:00.000Z",
      },
    ]);

    const result = await scheduledMenuService.getWeeklySchedule();

    expect(result).toHaveLength(7);
    expect(result.map((day) => day.dayOfWeek)).toEqual(DAY_OF_WEEK);
    expect(result[0].menuItems).toHaveLength(1);
    expect(result[1]).toEqual({
      dayOfWeek: "Tuesday",
      menuItems: [],
      createdAt: null,
      updatedAt: null,
    });
    expect(result[2].menuItems).toHaveLength(1);
  });

  it("fills missing days with empty menuItems", async () => {
    scheduledMenuRepository.findAll.mockResolvedValue([]);

    const result = await scheduledMenuService.getWeeklySchedule();

    expect(result).toEqual(
      DAY_OF_WEEK.map((day) => ({
        dayOfWeek: day,
        menuItems: [],
        createdAt: null,
        updatedAt: null,
      })),
    );
  });
});

describe("scheduledMenuService.updateDaySchedule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("upserts schedule when food items exist", async () => {
    foodItemRepository.countActiveByIds.mockResolvedValue(2);
    const savedDoc = {
      dayOfWeek: "Monday",
      menuItems: [{ foodItemId: { _id: FOOD_ID_1, name: "Phở Bò" } }],
      createdAt: "2026-06-14T00:00:00.000Z",
      updatedAt: "2026-06-14T00:00:00.000Z",
    };
    scheduledMenuRepository.upsertByDay.mockResolvedValue(savedDoc);

    const result = await scheduledMenuService.updateDaySchedule(
      "Monday",
      [FOOD_ID_1, FOOD_ID_2],
      USER_ID,
    );

    expect(foodItemRepository.countActiveByIds).toHaveBeenCalledWith([
      FOOD_ID_1,
      FOOD_ID_2,
    ]);
    expect(scheduledMenuRepository.upsertByDay).toHaveBeenCalledWith(
      "Monday",
      [{ foodItemId: FOOD_ID_1 }, { foodItemId: FOOD_ID_2 }],
      USER_ID,
    );
    expect(result.dayOfWeek).toBe("Monday");
    expect(result.menuItems).toHaveLength(1);
  });

  it("allows empty foodItemIds to clear a day", async () => {
    const savedDoc = {
      dayOfWeek: "Friday",
      menuItems: [],
      createdAt: "2026-06-14T00:00:00.000Z",
      updatedAt: "2026-06-14T00:00:00.000Z",
    };
    scheduledMenuRepository.upsertByDay.mockResolvedValue(savedDoc);

    const result = await scheduledMenuService.updateDaySchedule("Friday", [], USER_ID);

    expect(foodItemRepository.countActiveByIds).not.toHaveBeenCalled();
    expect(scheduledMenuRepository.upsertByDay).toHaveBeenCalledWith("Friday", [], USER_ID);
    expect(result.menuItems).toEqual([]);
  });

  it("throws VALIDATION_ERROR for invalid day", async () => {
    await expect(
      scheduledMenuService.updateDaySchedule("NotADay", [FOOD_ID_1], USER_ID),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
  });

  it("throws DUPLICATE_FOOD_ITEM when ids are duplicated", async () => {
    await expect(
      scheduledMenuService.updateDaySchedule(
        "Tuesday",
        [FOOD_ID_1, FOOD_ID_1],
        USER_ID,
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: "DUPLICATE_FOOD_ITEM",
    });

    expect(foodItemRepository.countActiveByIds).not.toHaveBeenCalled();
    expect(scheduledMenuRepository.upsertByDay).not.toHaveBeenCalled();
  });

  it("throws FOOD_ITEM_NOT_FOUND when some ids do not exist", async () => {
    foodItemRepository.countActiveByIds.mockResolvedValue(1);

    await expect(
      scheduledMenuService.updateDaySchedule(
        "Thursday",
        [FOOD_ID_1, FOOD_ID_2],
        USER_ID,
      ),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: "FOOD_ITEM_NOT_FOUND",
    });
  });
});

describe("AppError contract", () => {
  it("creates operational errors with code and status", () => {
    const error = new AppError("test", 400, "TEST_CODE");
    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("TEST_CODE");
  });
});
