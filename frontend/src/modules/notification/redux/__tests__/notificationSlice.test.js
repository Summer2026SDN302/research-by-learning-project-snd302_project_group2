import { describe, expect, it } from "vitest";
import notificationReducer, {
  setNotifications,
  setLoading,
  setMarkingAll,
  markSingleReadOptimistic,
  markAllReadOptimistic,
  rollbackOptimistic,
  clearNotifications,
} from "../notificationSlice";

describe("notificationSlice reducers", () => {
  it("returns the initial state", () => {
    expect(notificationReducer(undefined, { type: undefined })).toEqual({
      items: [],
      unreadCount: 0,
      isLoading: false,
      isMarkingAll: false,
      error: null,
      cachedItems: [],
      cachedUnreadCount: 0,
    });
  });

  it("handles setNotifications", () => {
    const previousState = { items: [], unreadCount: 0 };
    const payload = {
      items: [{ id: "1", title: "Test", isRead: false }],
      unreadCount: 1,
    };
    expect(notificationReducer(previousState, setNotifications(payload))).toEqual({
      items: [{ id: "1", title: "Test", isRead: false }],
      unreadCount: 1,
      error: null,
    });
  });

  it("handles markSingleReadOptimistic", () => {
    const previousState = {
      items: [
        { id: "1", isRead: false },
        { id: "2", isRead: true },
      ],
      unreadCount: 1,
    };
    const state = notificationReducer(previousState, markSingleReadOptimistic("1"));
    expect(state.items[0].isRead).toBe(true);
    expect(state.unreadCount).toBe(0);
    expect(state.cachedItems).toEqual(previousState.items);
    expect(state.cachedUnreadCount).toBe(1);
  });

  it("handles rollbackOptimistic", () => {
    const previousState = {
      items: [{ id: "1", isRead: true }],
      unreadCount: 0,
      cachedItems: [{ id: "1", isRead: false }],
      cachedUnreadCount: 1,
    };
    expect(notificationReducer(previousState, rollbackOptimistic())).toEqual({
      items: [{ id: "1", isRead: false }],
      unreadCount: 1,
      cachedItems: [{ id: "1", isRead: false }],
      cachedUnreadCount: 1,
    });
  });
});
