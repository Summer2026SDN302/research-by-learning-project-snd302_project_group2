import { describe, expect, it } from "vitest";

import reducer, {
  markDaysSaved,
  revertDayItems,
  resetError,
  setError,
  setLoading,
  setSaving,
  setSchedule,
  updateDayItems,
} from "../scheduledMenuSlice";

const FOOD_ID_1 = "507f1f77bcf86cd799439011";
const FOOD_ID_2 = "507f1f77bcf86cd799439012";

const initialSchedule = [
  { dayOfWeek: "Monday", menuItems: [{ foodItemId: { _id: FOOD_ID_1 } }] },
  { dayOfWeek: "Tuesday", menuItems: [] },
];

describe("scheduledMenuSlice", () => {
  it("has correct initial state", () => {
    const state = reducer(undefined, { type: "@@INIT" });

    expect(state).toEqual({
      schedule: [],
      savedSnapshot: {},
      savedItemsSnapshot: {},
      isLoading: false,
      isSaving: false,
      error: null,
    });
  });

  it("setSchedule stores schedule and snapshot", () => {
    const state = reducer(undefined, setSchedule(initialSchedule));

    expect(state.schedule).toEqual(initialSchedule);
    expect(state.savedSnapshot).toEqual({
      Monday: [FOOD_ID_1],
      Tuesday: [],
    });
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("updateDayItems updates only target day", () => {
    const withSchedule = reducer(undefined, setSchedule(initialSchedule));
    const updatedItems = [
      { foodItemId: { _id: FOOD_ID_1 } },
      { foodItemId: { _id: FOOD_ID_2 } },
    ];

    const state = reducer(
      withSchedule,
      updateDayItems({ dayOfWeek: "Monday", menuItems: updatedItems }),
    );

    expect(state.schedule[0].menuItems).toEqual(updatedItems);
    expect(state.schedule[1].menuItems).toEqual([]);
    expect(state.savedSnapshot.Monday).toEqual([FOOD_ID_1]);
  });

  it("revertDayItems restores day items to savedItemsSnapshot", () => {
    const withSchedule = reducer(undefined, setSchedule(initialSchedule));
    const changed = reducer(
      withSchedule,
      updateDayItems({
        dayOfWeek: "Monday",
        menuItems: [{ foodItemId: { _id: FOOD_ID_2 } }],
      }),
    );

    expect(changed.schedule[0].menuItems).toEqual([{ foodItemId: { _id: FOOD_ID_2 } }]);

    const state = reducer(changed, revertDayItems("Monday"));

    expect(state.schedule[0].menuItems).toEqual(initialSchedule[0].menuItems);
  });

  it("markDaysSaved updates snapshot for saved days", () => {
    const withSchedule = reducer(undefined, setSchedule(initialSchedule));
    const changed = reducer(
      withSchedule,
      updateDayItems({
        dayOfWeek: "Tuesday",
        menuItems: [{ foodItemId: { _id: FOOD_ID_2 } }],
      }),
    );

    const state = reducer(changed, markDaysSaved(["Tuesday"]));

    expect(state.savedSnapshot.Tuesday).toEqual([FOOD_ID_2]);
    expect(state.savedSnapshot.Monday).toEqual([FOOD_ID_1]);
  });

  it("setLoading toggles loading and clears error", () => {
    const withError = reducer(undefined, setError("failed"));
    const state = reducer(withError, setLoading(true));

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("setSaving toggles saving flag", () => {
    const state = reducer(undefined, setSaving(true));
    expect(state.isSaving).toBe(true);
  });

  it("setError stores message and stops loading/saving", () => {
    const loading = reducer(reducer(undefined, setLoading(true)), setSaving(true));
    const state = reducer(loading, setError("Lỗi mạng"));

    expect(state.error).toBe("Lỗi mạng");
    expect(state.isLoading).toBe(false);
    expect(state.isSaving).toBe(false);
  });

  it("resetError clears error", () => {
    const withError = reducer(undefined, setError("Lỗi"));
    const state = reducer(withError, resetError());

    expect(state.error).toBeNull();
  });
});
