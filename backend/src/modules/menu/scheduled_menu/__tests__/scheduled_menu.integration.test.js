import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import mongoose from "mongoose";

import { connect, closeDatabase, clearDatabase } from "../../../../../test/db.js";
import FoodItem from "../../food_item/food_item.model.js";
import Category from "../../category/category.model.js";
import ScheduledMenu from "../scheduled_menu.model.js";
import scheduledMenuService from "../scheduled_menu.service.js";
import scheduledMenuRepository from "../scheduled_menu.repository.js";

const USER_ID = new mongoose.Types.ObjectId().toString();

describe("Scheduled Menu Integration Tests", () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    vi.restoreAllMocks();
  });

  it("batchUpdateSchedule_commitsMultipleDaysAtomically", async () => {
    // Seed Category and 2 active FoodItems
    const category = await Category.create({ name: "Món Ăn" });
    const item1 = await FoodItem.create({
      name: "Phở Bò",
      basePrice: 50000,
      cost: 30000,
      categoryId: category._id,
      isArchived: false,
    });
    const item2 = await FoodItem.create({
      name: "Cơm Gà",
      basePrice: 45000,
      cost: 25000,
      categoryId: category._id,
      isArchived: false,
    });

    const payload = [
      { dayOfWeek: "Monday", foodItemIds: [item1._id.toString()] },
      { dayOfWeek: "Wednesday", foodItemIds: [item2._id.toString()] },
    ];

    const result = await scheduledMenuService.batchUpdateSchedule(payload, USER_ID);

    // Verify response format
    expect(result).toHaveLength(7);
    
    // Assert both docs are in the database
    const monDoc = await ScheduledMenu.findOne({ dayOfWeek: "Monday" });
    const wedDoc = await ScheduledMenu.findOne({ dayOfWeek: "Wednesday" });
    
    expect(monDoc).toBeDefined();
    expect(monDoc.menuItems).toHaveLength(1);
    expect(monDoc.menuItems[0].foodItemId.toString()).toBe(item1._id.toString());
    
    expect(wedDoc).toBeDefined();
    expect(wedDoc.menuItems).toHaveLength(1);
    expect(wedDoc.menuItems[0].foodItemId.toString()).toBe(item2._id.toString());
  });

  it("batchUpdateSchedule_rejectsBeforeTransaction_noWrites", async () => {
    // Seed Category and Monday with item A
    const category = await Category.create({ name: "Món Ăn" });
    const itemA = await FoodItem.create({
      name: "Item A",
      basePrice: 40000,
      cost: 20000,
      categoryId: category._id,
      isArchived: false,
    });
    const itemB = await FoodItem.create({
      name: "Item B",
      basePrice: 45000,
      cost: 25000,
      categoryId: category._id,
      isArchived: false,
    });

    // Create existing Monday schedule in DB
    await ScheduledMenu.create({
      dayOfWeek: "Monday",
      menuItems: [{ foodItemId: itemA._id }],
      createdBy: USER_ID,
      updatedBy: USER_ID,
    });

    const invalidId = new mongoose.Types.ObjectId().toString();
    const payload = [
      { dayOfWeek: "Monday", foodItemIds: [itemB._id.toString()] },
      { dayOfWeek: "Wednesday", foodItemIds: [invalidId] },
    ];

    // The validation should fail pre-transaction (since invalidId is not active)
    await expect(
      scheduledMenuService.batchUpdateSchedule(payload, USER_ID)
    ).rejects.toMatchObject({
      statusCode: 404,
      code: "FOOD_ITEM_NOT_FOUND",
    });

    // Assert Monday is unchanged
    const monDoc = await ScheduledMenu.findOne({ dayOfWeek: "Monday" });
    expect(monDoc.menuItems).toHaveLength(1);
    expect(monDoc.menuItems[0].foodItemId.toString()).toBe(itemA._id.toString());

    // Wednesday must not be created
    const wedDoc = await ScheduledMenu.findOne({ dayOfWeek: "Wednesday" });
    expect(wedDoc).toBeNull();
  });

  it("batchUpdateSchedule_rollsBackOnMidBatchFailure", async () => {
    // Seed Category and Monday with item A
    const category = await Category.create({ name: "Món Ăn" });
    const itemA = await FoodItem.create({
      name: "Item A",
      basePrice: 40000,
      cost: 20000,
      categoryId: category._id,
      isArchived: false,
    });
    const itemB = await FoodItem.create({
      name: "Item B",
      basePrice: 45000,
      cost: 25000,
      categoryId: category._id,
      isArchived: false,
    });
    const itemC = await FoodItem.create({
      name: "Item C",
      basePrice: 50000,
      cost: 30000,
      categoryId: category._id,
      isArchived: false,
    });

    // Create existing Monday schedule in DB
    await ScheduledMenu.create({
      dayOfWeek: "Monday",
      menuItems: [{ foodItemId: itemA._id }],
      createdBy: USER_ID,
      updatedBy: USER_ID,
    });

    // Spy on scheduledMenuRepository.upsertByDay so the second call throws
    const originalUpsert = scheduledMenuRepository.upsertByDay;
    let callCount = 0;
    vi.spyOn(scheduledMenuRepository, "upsertByDay").mockImplementation(
      async (day, menuItems, userId, options) => {
        callCount++;
        if (callCount === 2) {
          throw new Error("Simulated mid-batch DB write failure");
        }
        return originalUpsert(day, menuItems, userId, options);
      }
    );

    const payload = [
      { dayOfWeek: "Monday", foodItemIds: [itemB._id.toString()] },
      { dayOfWeek: "Wednesday", foodItemIds: [itemC._id.toString()] },
    ];

    // The operation should throw
    await expect(
      scheduledMenuService.batchUpdateSchedule(payload, USER_ID)
    ).rejects.toThrow("Simulated mid-batch DB write failure");

    // Assert Monday is unchanged (rolled back from B to A)
    const monDoc = await ScheduledMenu.findOne({ dayOfWeek: "Monday" });
    expect(monDoc.menuItems).toHaveLength(1);
    expect(monDoc.menuItems[0].foodItemId.toString()).toBe(itemA._id.toString());

    // Wednesday must not be created
    const wedDoc = await ScheduledMenu.findOne({ dayOfWeek: "Wednesday" });
    expect(wedDoc).toBeNull();
  });
});
