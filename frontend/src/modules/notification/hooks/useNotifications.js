import { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "@/services/socket";
import * as notificationApi from "../api/notificationApi";
import {
  setNotifications,
  setLoading,
  setMarkingAll,
  setError,
  markSingleReadOptimistic,
  markAllReadOptimistic,
  rollbackOptimistic,
} from "../redux/notificationSlice";
import useAppToast from "../../../hooks/useAppToast";
import { getApiErrorMsg } from "../../../utils/errorUtils";
import { NOTIFICATION_ERROR_MAP } from "../constants/notificationConstants";

export const useNotifications = () => {
  const dispatch = useDispatch();
  const { toast } = useAppToast();

  const { items, unreadCount, isLoading, isMarkingAll } = useSelector(
    (state) => state.notification
  );
  const currentUser = useSelector((state) => state.auth.user);

  const abortControllerRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchNotifications = useCallback(
    async (isSilent = false) => {
      // Abort in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      if (!isSilent) {
        dispatch(setLoading(true));
      }

      try {
        const data = await notificationApi.getNotifications({
          limit: 50,
          page: 1,
        });
        dispatch(setNotifications(data));
      } catch (err) {
        // Ignore aborted requests
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          dispatch(setError(err.message));
          if (!isSilent) {
            toast.error(
              "Lỗi",
              getApiErrorMsg(NOTIFICATION_ERROR_MAP, err, "Không thể tải thông báo.")
            );
          }
        }
      } finally {
        if (!isSilent) {
          dispatch(setLoading(false));
        }
      }
    },
    [dispatch, toast]
  );

  const startPolling = useCallback(() => {
    // Clear existing
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Initial silent fetch and register timer
    fetchNotifications(true);

    intervalRef.current = setInterval(() => {
      fetchNotifications(true);
    }, 60000);
  }, [fetchNotifications]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Handle visibility changes
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") {
      startPolling();
    } else {
      stopPolling();
    }
  }, [startPolling, stopPolling]);

  // Hook mounting & polling lifecycle
  useEffect(() => {
    // Initial load
    fetchNotifications(false);

    // Visibility Listener registration
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial polling registration if active
    if (document.visibilityState === "visible") {
      startPolling();
    }

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchNotifications, handleVisibilityChange, startPolling, stopPolling]);

  // Socket room joining and real-time event listener
  useEffect(() => {
    if (currentUser?._id) {
      socket.emit("join-room", currentUser._id);
    }
  }, [currentUser]);

  useEffect(() => {
    const handleNotificationReceived = (notification) => {
      if (currentUser?._id && notification.userId === currentUser._id) {
        fetchNotifications(true);
      }
    };

    socket.on("notification-received", handleNotificationReceived);

    return () => {
      socket.off("notification-received", handleNotificationReceived);
    };
  }, [currentUser, fetchNotifications]);

  // Mark single as read (optimistic)
  const markAsRead = useCallback(
    async (id) => {
      const item = items.find((n) => n.id === id);
      // Skip if not found or already read
      if (!item || item.isRead) {
        return;
      }

      dispatch(markSingleReadOptimistic(id));

      try {
        await notificationApi.markAsRead(id);
      } catch (err) {
        dispatch(rollbackOptimistic());
        toast.error(
          "Lỗi",
          getApiErrorMsg(NOTIFICATION_ERROR_MAP, err, "Không thể cập nhật trạng thái thông báo.")
        );
      }
    },
    [dispatch, items, toast]
  );

  // Mark all as read (optimistic)
  const markAllAsRead = useCallback(async () => {
    if (unreadCount === 0) {
      return;
    }

    dispatch(setMarkingAll(true));
    dispatch(markAllReadOptimistic());

    try {
      await notificationApi.markAllAsRead();
    } catch (err) {
      dispatch(rollbackOptimistic());
      toast.error(
        "Lỗi",
        getApiErrorMsg(NOTIFICATION_ERROR_MAP, err, "Không thể cập nhật trạng thái thông báo.")
      );
    } finally {
      dispatch(setMarkingAll(false));
    }
  }, [dispatch, unreadCount, toast]);

  return {
    notifications: unreadCount,
    notificationItems: items,
    isLoading,
    isMarkingAll,
    onReadNotification: markAsRead,
    onReadAllNotifications: markAllAsRead,
    refetch: fetchNotifications,
  };
};

export default useNotifications;
