import apiClient from "../../../services/apiClient";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale("vi");

const mapType = (type) => {
  const map = {
    System_Log: "system",
    Order_Update: "order",
    AI_Alert: "system",
  };
  return map[type] || "system";
};

export const mapNotificationDto = (item) => {
  return {
    id: item._id,
    title: item.title,
    message: item.content,
    time: dayjs(item.createdAt).tz("Asia/Ho_Chi_Minh").fromNow(),
    type: mapType(item.type),
    isRead: item.isRead,
  };
};

export const getNotifications = async (params = {}) => {
  const response = await apiClient.get("/notifications", { params });
  const { items, unreadCount } = response.data.data;
  return {
    items: items.map(mapNotificationDto),
    unreadCount,
  };
};

export const markAsRead = async (id) => {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return mapNotificationDto(response.data.data);
};

export const markAllAsRead = async () => {
  const response = await apiClient.patch("/notifications/read-all");
  return response.data.data;
};
