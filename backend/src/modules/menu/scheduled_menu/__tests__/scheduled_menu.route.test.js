import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AppError from "../../../../shared/exceptions/AppError.js";
import { errorHandler } from "../../../../middlewares/error.middleware.js";
import scheduledMenuService from "../scheduled_menu.service.js";
import scheduledMenuRoute from "../scheduled_menu.route.js";

vi.mock("../scheduled_menu.service.js", () => ({
  default: {
    getWeeklySchedule: vi.fn(),
    updateDaySchedule: vi.fn(),
  },
}));

const { mockAuthenticate } = vi.hoisted(() => {
  class TestAppError extends Error {
    constructor(message, statusCode, code) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
    }
  }

  return {
    mockAuthenticate: (req, _res, next) => {
      const role = req.headers["x-test-role"];

      if (!role) {
        return next(
          new TestAppError("Authentication required", 401, "AUTHENTICATION_REQUIRED"),
        );
      }

      req.user = { role };
      req.userId = "507f1f77bcf86cd799439099";
      return next();
    },
  };
});

vi.mock("../../../../middlewares/auth.middleware.js", () => ({
  authenticate: mockAuthenticate,
}));

const FOOD_ID = "507f1f77bcf86cd799439011";

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/scheduled-menu", scheduledMenuRoute);
  app.use(errorHandler);
  return app;
};

describe("scheduled menu routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/scheduled-menu", () => {
    it("returns weekly schedule for admin", async () => {
      const schedule = [{ dayOfWeek: "Monday", menuItems: [] }];
      scheduledMenuService.getWeeklySchedule.mockResolvedValue(schedule);

      const response = await request(createApp())
        .get("/api/scheduled-menu")
        .set("x-test-role", "Admin");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(schedule);
    });

    it("returns weekly schedule for manager", async () => {
      scheduledMenuService.getWeeklySchedule.mockResolvedValue([]);

      const response = await request(createApp())
        .get("/api/scheduled-menu")
        .set("x-test-role", "Manager");

      expect(response.status).toBe(200);
    });

    it("returns 401 when unauthenticated", async () => {
      const response = await request(createApp()).get("/api/scheduled-menu");

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe("AUTHENTICATION_REQUIRED");
    });

    it("returns 403 for staff role", async () => {
      const response = await request(createApp())
        .get("/api/scheduled-menu")
        .set("x-test-role", "Staff");

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("INSUFFICIENT_PERMISSIONS");
    });
  });

  describe("PUT /api/scheduled-menu/:dayOfWeek", () => {
    it("updates schedule for admin", async () => {
      const updated = {
        dayOfWeek: "Monday",
        menuItems: [{ foodItemId: { _id: FOOD_ID, name: "Phở Bò" } }],
      };
      scheduledMenuService.updateDaySchedule.mockResolvedValue(updated);

      const response = await request(createApp())
        .put("/api/scheduled-menu/Monday")
        .set("x-test-role", "Admin")
        .send({ foodItemIds: [FOOD_ID] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updated);
      expect(scheduledMenuService.updateDaySchedule).toHaveBeenCalledWith(
        "Monday",
        [FOOD_ID],
        "507f1f77bcf86cd799439099",
      );
    });

    it("returns 403 for manager role", async () => {
      const response = await request(createApp())
        .put("/api/scheduled-menu/Monday")
        .set("x-test-role", "Manager")
        .send({ foodItemIds: [FOOD_ID] });

      expect(response.status).toBe(403);
      expect(scheduledMenuService.updateDaySchedule).not.toHaveBeenCalled();
    });

    it("returns 400 for invalid dayOfWeek param", async () => {
      const response = await request(createApp())
        .put("/api/scheduled-menu/Funday")
        .set("x-test-role", "Admin")
        .send({ foodItemIds: [FOOD_ID] });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 for invalid foodItemIds body", async () => {
      const response = await request(createApp())
        .put("/api/scheduled-menu/Monday")
        .set("x-test-role", "Admin")
        .send({ foodItemIds: ["not-valid"] });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("propagates service DUPLICATE_FOOD_ITEM error", async () => {
      scheduledMenuService.updateDaySchedule.mockRejectedValue(
        new AppError(
          "Duplicate food item IDs are not allowed for the same day",
          400,
          "DUPLICATE_FOOD_ITEM",
        ),
      );

      const response = await request(createApp())
        .put("/api/scheduled-menu/Tuesday")
        .set("x-test-role", "Admin")
        .send({ foodItemIds: [FOOD_ID, FOOD_ID] });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("DUPLICATE_FOOD_ITEM");
    });

    it("propagates service FOOD_ITEM_NOT_FOUND error", async () => {
      scheduledMenuService.updateDaySchedule.mockRejectedValue(
        new AppError("One or more food items not found", 404, "FOOD_ITEM_NOT_FOUND"),
      );

      const response = await request(createApp())
        .put("/api/scheduled-menu/Wednesday")
        .set("x-test-role", "Admin")
        .send({ foodItemIds: [FOOD_ID] });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("FOOD_ITEM_NOT_FOUND");
    });
  });
});
