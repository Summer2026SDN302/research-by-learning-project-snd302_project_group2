import { beforeEach, describe, expect, it, vi } from "vitest";
import AppError from "../../../../shared/exceptions/AppError.js";
import foodItemService from "../food_item.service.js";
import foodItemRepository from "../food_item.repository.js";
import scheduledMenuRepository from "../../scheduled_menu/scheduled_menu.repository.js";
import * as dailyMenuRepository from "../../daily-menu/daily-menu.repository.js";

vi.mock("../food_item.repository.js", () => ({
  default: {
    findByIdWithCategory: vi.fn(),
    patchById: vi.fn(),
    findByIdWithCategoryAfterPatch: vi.fn(),
  },
}));

vi.mock("../../scheduled_menu/scheduled_menu.repository.js", () => ({
  default: {
    countByFoodItemId: vi.fn(),
  },
}));

vi.mock("../../daily-menu/daily-menu.repository.js", () => ({
  countActiveByFoodItemId: vi.fn(),
}));

const FOOD_ID = "507f1f77bcf86cd799439011";
const USER_ID = "507f1f77bcf86cd799439099";

describe("foodItemService.updateFoodItemArchive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks archiving when food item is in use by a scheduled menu", async () => {
    foodItemRepository.findByIdWithCategory.mockResolvedValue({
      _id: FOOD_ID,
      name: "Phở Bò",
      categoryName: "Món Nước",
    });
    scheduledMenuRepository.countByFoodItemId.mockResolvedValue(1);

    await expect(
      foodItemService.updateFoodItemArchive(FOOD_ID, true, USER_ID)
    ).rejects.toThrowError(
      expect.objectContaining({
        statusCode: 409,
        code: "FOODITEM_IN_USE",
      })
    );

    expect(scheduledMenuRepository.countByFoodItemId).toHaveBeenCalledWith(FOOD_ID);
    expect(foodItemRepository.patchById).not.toHaveBeenCalled();
  });

  it("blocks archiving when food item is in use by active daily menus", async () => {
    foodItemRepository.findByIdWithCategory.mockResolvedValue({
      _id: FOOD_ID,
      name: "Phở Bò",
      categoryName: "Món Nước",
    });
    scheduledMenuRepository.countByFoodItemId.mockResolvedValue(0);
    dailyMenuRepository.countActiveByFoodItemId.mockResolvedValue(1);

    await expect(
      foodItemService.updateFoodItemArchive(FOOD_ID, true, USER_ID)
    ).rejects.toThrowError(
      expect.objectContaining({
        statusCode: 409,
        code: "FOODITEM_IN_USE",
      })
    );

    expect(dailyMenuRepository.countActiveByFoodItemId).toHaveBeenCalledWith(
      FOOD_ID,
      expect.any(String)
    );
    expect(foodItemRepository.patchById).not.toHaveBeenCalled();
  });

  it("archives successfully when there are no references", async () => {
    foodItemRepository.findByIdWithCategory.mockResolvedValue({
      _id: FOOD_ID,
      name: "Phở Bò",
      categoryName: "Món Nước",
    });
    scheduledMenuRepository.countByFoodItemId.mockResolvedValue(0);
    dailyMenuRepository.countActiveByFoodItemId.mockResolvedValue(0);
    foodItemRepository.patchById.mockResolvedValue({
      _id: FOOD_ID,
      name: "Phở Bò",
      categoryId: { _id: "cat1", name: "Món Nước" },
      isArchived: true,
    });

    const result = await foodItemService.updateFoodItemArchive(FOOD_ID, true, USER_ID);

    expect(foodItemRepository.patchById).toHaveBeenCalledWith(
      FOOD_ID,
      expect.objectContaining({
        isArchived: true,
        deletedBy: USER_ID,
      })
    );
    expect(result.isArchived).toBe(true);
  });

  it("unarchives successfully and clears archive fields without reference checks", async () => {
    foodItemRepository.findByIdWithCategory.mockResolvedValue({
      _id: FOOD_ID,
      name: "Phở Bò",
      categoryName: "Món Nước",
    });
    foodItemRepository.patchById.mockResolvedValue({
      _id: FOOD_ID,
      name: "Phở Bò",
      categoryId: { _id: "cat1", name: "Món Nước" },
      isArchived: false,
      deletedAt: null,
      deletedBy: null,
    });

    const result = await foodItemService.updateFoodItemArchive(FOOD_ID, false, USER_ID);

    expect(scheduledMenuRepository.countByFoodItemId).not.toHaveBeenCalled();
    expect(dailyMenuRepository.countActiveByFoodItemId).not.toHaveBeenCalled();
    expect(foodItemRepository.patchById).toHaveBeenCalledWith(
      FOOD_ID,
      expect.objectContaining({
        isArchived: false,
        deletedAt: null,
        deletedBy: null,
      })
    );
    expect(result.isArchived).toBe(false);
  });
});
