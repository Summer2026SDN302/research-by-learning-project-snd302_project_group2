import { beforeEach, describe, expect, it, vi } from "vitest";
import * as notificationService from "../notification.service.js";
import * as notificationRepository from "../notification.repository.js";
import { findUsers } from "../../user/user.repository.js";
import AppError from "../../../shared/exceptions/AppError.js";

vi.mock("../notification.repository.js", () => ({
  findAll: vi.fn(),
  countDocuments: vi.fn(),
  findByIdAndUser: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  createMany: vi.fn(),
  deleteOlderThan: vi.fn(),
}));

vi.mock("../../user/user.repository.js", () => ({
  findUsers: vi.fn(),
}));

describe("notificationService.createForRecipients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves active recipients and triggers createMany", async () => {
    findUsers.mockResolvedValue([
      { _id: "admin-1", role: "Admin", isActive: true },
      { _id: "manager-1", role: "Manager", isActive: true },
    ]);

    notificationRepository.createMany.mockResolvedValue();

    await notificationService.createForRecipients({
      roleScope: ["Admin", "Manager"],
      type: "System_Log",
      title: "Title",
      content: "Content",
      dedupKey: "dedup-1",
    });

    expect(findUsers).toHaveBeenCalled();
    expect(notificationRepository.createMany).toHaveBeenCalledWith([
      {
        userId: "admin-1",
        title: "Title",
        content: "Content",
        type: "System_Log",
        isRead: false,
        metadata: { dedupKey: "dedup-1", actionType: null, actionPayload: null },
      },
      {
        userId: "manager-1",
        title: "Title",
        content: "Content",
        type: "System_Log",
        isRead: false,
        metadata: { dedupKey: "dedup-1", actionType: null, actionPayload: null },
      },
    ]);
  });

  it("swallows duplicate key errors silently", async () => {
    findUsers.mockResolvedValue([{ _id: "admin-1", role: "Admin", isActive: true }]);
    
    const dbError = new Error("Duplicate key error");
    dbError.code = 11000;
    notificationRepository.createMany.mockRejectedValue(dbError);

    await expect(
      notificationService.createForRecipients({
        roleScope: ["Admin"],
        type: "System_Log",
        title: "Title",
        content: "Content",
        dedupKey: "dedup-1",
      })
    ).resolves.not.toThrow();
  });
});

describe("notificationService.markAsRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks a notification read and returns it", async () => {
    const mockNotif = { _id: "notif-1", userId: "user-1", isRead: false };
    notificationRepository.findByIdAndUser.mockResolvedValue(mockNotif);
    notificationRepository.markAsRead.mockResolvedValue({ ...mockNotif, isRead: true });

    const result = await notificationService.markAsRead("notif-1", "user-1");
    expect(result.isRead).toBe(true);
  });

  it("throws 404 AppError if notification belongs to another user", async () => {
    notificationRepository.findByIdAndUser.mockResolvedValue(null);

    await expect(
      notificationService.markAsRead("notif-1", "user-2")
    ).rejects.toThrowError(new AppError("Notification not found", 404, "NOTIFICATION_NOT_FOUND"));
  });
});
