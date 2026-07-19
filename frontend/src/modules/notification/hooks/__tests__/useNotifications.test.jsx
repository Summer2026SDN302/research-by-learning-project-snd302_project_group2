import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

import notificationReducer from "../../redux/notificationSlice";
import useNotifications from "../useNotifications";
import * as notificationApi from "../../api/notificationApi";

vi.mock("../../api/notificationApi", () => ({
  getNotifications: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
}));

const toastMock = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};

vi.mock("../../../hooks/useAppToast", () => ({
  default: () => ({ toast: toastMock }),
}));

const createWrapper = (preloadedState) => {
  const store = configureStore({
    reducer: { notification: notificationReducer },
    preloadedState,
  });

  return ({ children }) => <Provider store={store}>{children}</Provider>;
};

describe("useNotifications hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches notifications on mount", async () => {
    const mockData = {
      items: [{ id: "1", title: "Test", message: "Msg", time: "5 minutes ago", type: "system", isRead: false }],
      unreadCount: 1,
    };
    notificationApi.getNotifications.mockResolvedValue(mockData);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(result.current.notifications).toBe(1);
    });

    expect(result.current.notificationItems).toHaveLength(1);
    expect(notificationApi.getNotifications).toHaveBeenCalled();
  });

  it("performs optimistic update on markAsRead", async () => {
    const mockData = {
      items: [{ id: "1", title: "Test", message: "Msg", time: "5 minutes ago", type: "system", isRead: false }],
      unreadCount: 1,
    };
    notificationApi.getNotifications.mockResolvedValue(mockData);
    notificationApi.markAsRead.mockResolvedValue({ id: "1", isRead: true });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(result.current.notifications).toBe(1);
    });

    act(() => {
      result.current.onReadNotification("1");
    });

    // Check optimistic state change
    expect(result.current.notifications).toBe(0);
    expect(result.current.notificationItems[0].isRead).toBe(true);

    expect(notificationApi.markAsRead).toHaveBeenCalledWith("1");
  });
});
