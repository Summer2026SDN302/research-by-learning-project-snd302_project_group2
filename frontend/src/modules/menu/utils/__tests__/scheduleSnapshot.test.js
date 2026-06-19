import { describe, expect, it } from "vitest";

import {
  buildSavedSnapshot,
  extractFoodItemIds,
  getDirtyDays,
  isDayDirty,
} from "../scheduleSnapshot";

const FOOD_ID_1 = "507f1f77bcf86cd799439011";
const FOOD_ID_2 = "507f1f77bcf86cd799439012";

const makeSchedule = (mondayItems = [], tuesdayItems = []) => [
  { dayOfWeek: "Monday", menuItems: mondayItems },
  { dayOfWeek: "Tuesday", menuItems: tuesdayItems },
];

describe("extractFoodItemIds", () => {
  it("extracts ids from populated and raw references", () => {
    const ids = extractFoodItemIds([
      { foodItemId: { _id: FOOD_ID_1 } },
      { foodItemId: FOOD_ID_2 },
    ]);

    expect(ids).toEqual([FOOD_ID_1, FOOD_ID_2]);
  });

  it("returns empty array for missing menuItems", () => {
    expect(extractFoodItemIds()).toEqual([]);
  });
});

describe("buildSavedSnapshot", () => {
  it("builds snapshot keyed by dayOfWeek", () => {
    const snapshot = buildSavedSnapshot(
      makeSchedule([{ foodItemId: { _id: FOOD_ID_1 } }], []),
    );

    expect(snapshot).toEqual({
      Monday: [FOOD_ID_1],
      Tuesday: [],
    });
  });
});

describe("isDayDirty", () => {
  const schedule = makeSchedule(
    [{ foodItemId: { _id: FOOD_ID_1 } }],
    [{ foodItemId: { _id: FOOD_ID_2 } }],
  );
  const savedSnapshot = buildSavedSnapshot(schedule);

  it("returns false when day matches saved snapshot", () => {
    expect(isDayDirty("Monday", schedule, savedSnapshot)).toBe(false);
  });

  it("returns true when items were added", () => {
    const changed = makeSchedule(
      [{ foodItemId: { _id: FOOD_ID_1 } }, { foodItemId: { _id: FOOD_ID_2 } }],
      [{ foodItemId: { _id: FOOD_ID_2 } }],
    );

    expect(isDayDirty("Monday", changed, savedSnapshot)).toBe(true);
  });

  it("returns true when items were removed", () => {
    const changed = makeSchedule([], [{ foodItemId: { _id: FOOD_ID_2 } }]);

    expect(isDayDirty("Monday", changed, savedSnapshot)).toBe(true);
  });

  it("returns false when items are in a different order but have the same set of IDs", () => {
    const scheduleWithMultiple = makeSchedule(
      [{ foodItemId: { _id: FOOD_ID_1 } }, { foodItemId: { _id: FOOD_ID_2 } }],
      []
    );
    const snapshotWithMultiple = buildSavedSnapshot(scheduleWithMultiple);
    const reorderedSchedule = makeSchedule(
      [{ foodItemId: { _id: FOOD_ID_2 } }, { foodItemId: { _id: FOOD_ID_1 } }],
      []
    );
    expect(isDayDirty("Monday", reorderedSchedule, snapshotWithMultiple)).toBe(false);
  });

  it("returns false for unknown day", () => {
    expect(isDayDirty("Sunday", schedule, savedSnapshot)).toBe(false);
  });
});

describe("getDirtyDays", () => {
  it("returns only changed days", () => {
    const schedule = makeSchedule(
      [{ foodItemId: { _id: FOOD_ID_1 } }],
      [{ foodItemId: { _id: FOOD_ID_2 } }],
    );
    const savedSnapshot = {
      Monday: [FOOD_ID_1],
      Tuesday: [],
    };

    expect(getDirtyDays(schedule, savedSnapshot)).toEqual(["Tuesday"]);
  });
});
