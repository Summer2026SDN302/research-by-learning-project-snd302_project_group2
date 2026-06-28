import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { errorHandler } from "../../../middlewares/error.middleware.js";
import analyticsRoute from "../analytics.route.js";
import * as analyticsService from "../analytics.service.js";

vi.mock("../analytics.service.js", () => ({
  getDashboardSummary: vi.fn(),
  getRevenueChart: vi.fn(),
  getTopFoods: vi.fn(),
  getSalesTrend: vi.fn(),
  getOrderStatistics: vi.fn(),
  getTransactionReport: vi.fn(),
  exportRevenueReport: vi.fn(),
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
          new TestAppError(
            "Authentication required",
            401,
            "AUTHENTICATION_REQUIRED",
          ),
        );
      }

      req.user = { role };
      req.userId = "507f1f77bcf86cd799439099";
      return next();
    },
  };
});

vi.mock("../../../middlewares/auth.middleware.js", () => ({
  authenticate: mockAuthenticate,
}));

const dashboardPayload = {
  meta: { date: "2026-06-24", generatedAt: "2026-06-24T10:00:00.000Z" },
  kpis: {
    todayRevenue: 0,
    revenueChangePercent: null,
    todayOrderCount: 0,
    orderCountDelta: 0,
    averageOrderValue: 0,
    averageOrderValueChangePercent: null,
  },
  revenueChart: { range: "7d", labels: [], values: [], unit: "VND" },
  topFoods: [],
};

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/analytics", analyticsRoute);
  app.use(errorHandler);
  return app;
};

describe("analytics routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    analyticsService.getDashboardSummary.mockResolvedValue(dashboardPayload);
  });

  describe("GET /api/analytics/dashboard/summary", () => {
    it("returns dashboard summary for manager", async () => {
      const response = await request(createApp())
        .get("/api/analytics/dashboard/summary")
        .set("x-test-role", "Manager");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(dashboardPayload);
    });

    it("returns dashboard summary for admin", async () => {
      const response = await request(createApp())
        .get("/api/analytics/dashboard/summary")
        .set("x-test-role", "Admin");

      expect(response.status).toBe(200);
    });

    it("returns 401 when unauthenticated", async () => {
      const response = await request(createApp()).get(
        "/api/analytics/dashboard/summary",
      );

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe("AUTHENTICATION_REQUIRED");
    });

    it("returns 403 for staff role", async () => {
      const response = await request(createApp())
        .get("/api/analytics/dashboard/summary")
        .set("x-test-role", "Staff");

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("INSUFFICIENT_PERMISSIONS");
    });

    it("returns 400 for invalid date", async () => {
      const response = await request(createApp())
        .get("/api/analytics/dashboard/summary")
        .query({ date: "24-06-2026" })
        .set("x-test-role", "Manager");

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/analytics/reports/revenue/export", () => {
    it("returns CSV attachment for manager", async () => {
      analyticsService.exportRevenueReport.mockResolvedValue(
        "\uFEFFMã GD,Mã đơn\nTXN-1,ORD-1",
      );

      const response = await request(createApp())
        .get("/api/analytics/reports/revenue/export")
        .set("x-test-role", "Manager");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("text/csv");
      expect(response.text).toContain("TXN-1");
    });
  });
});
