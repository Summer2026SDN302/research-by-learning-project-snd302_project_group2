import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AppError from "../../../shared/exceptions/AppError.js";
import { errorHandler } from "../../../middlewares/error.middleware.js";
import {
  generateDailyInsight,
  getInsightByDate,
  applyForecasts,
  generateDynamicPricingRecommendations,
  applyPricingRecommendations,
} from "../ai.service.js";
import aiRoute from "../ai.route.js";

vi.mock("../ai.service.js", () => ({
  generateDailyInsight: vi.fn(),
  getInsightByDate: vi.fn(),
  applyForecasts: vi.fn(),
  generateDynamicPricingRecommendations: vi.fn(),
  applyPricingRecommendations: vi.fn(),
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

vi.mock("../../../middlewares/auth.middleware.js", () => ({
  authenticate: mockAuthenticate,
}));

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/ai", aiRoute);
  app.use(errorHandler);
  return app;
};

describe("AI Insight Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/ai/generate-insight", () => {
    it("returns 201 and generated insight for Manager", async () => {
      const mockInsight = {
        _id: "507f1f77bcf86cd799439099",
        targetDate: "2026-06-25",
        version: "1.0.0",
        forecasts: [],
        pricingRecommendations: [],
        generatedAt: "2026-06-22T10:00:00.000Z",
      };
      generateDailyInsight.mockResolvedValue(mockInsight);

      const response = await request(createApp())
        .post("/api/ai/generate-insight")
        .set("x-test-role", "Manager")
        .send({ targetDate: "2026-06-25" });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockInsight);
      expect(generateDailyInsight).toHaveBeenCalledWith("2026-06-25");
    });

    it("returns 403 for Staff", async () => {
      const response = await request(createApp())
        .post("/api/ai/generate-insight")
        .set("x-test-role", "Staff")
        .send({ targetDate: "2026-06-25" });

      expect(response.status).toBe(403);
    });

    it("returns 422 when no forecasts are generated", async () => {
      generateDailyInsight.mockRejectedValue(
        new AppError(
          "AI could not generate forecasts. No sales history available for the requested date.",
          422,
          "AI_NO_FORECAST_DATA",
        ),
      );

      const response = await request(createApp())
        .post("/api/ai/generate-insight")
        .set("x-test-role", "Manager")
        .send({ targetDate: "2026-06-25" });

      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe("AI_NO_FORECAST_DATA");
      expect(response.body.message).toBe(
        "AI could not generate forecasts. No sales history available for the requested date.",
      );
    });

    it("returns 400 for invalid targetDate", async () => {
      const response = await request(createApp())
        .post("/api/ai/generate-insight")
        .set("x-test-role", "Manager")
        .send({ targetDate: "invalid-date" });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/ai/insight/:targetDate", () => {
    it("returns 200 and the insight for Manager", async () => {
      const mockInsight = {
        _id: "507f1f77bcf86cd799439099",
        targetDate: "2026-06-25",
        version: "1.0.0",
        forecasts: [],
        pricingRecommendations: [],
        generatedAt: "2026-06-22T10:00:00.000Z",
      };
      getInsightByDate.mockResolvedValue(mockInsight);

      const response = await request(createApp())
        .get("/api/ai/insight/2026-06-25")
        .set("x-test-role", "Manager");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockInsight);
      expect(getInsightByDate).toHaveBeenCalledWith("2026-06-25");
    });

    it("returns 403 for Staff", async () => {
      const response = await request(createApp())
        .get("/api/ai/insight/2026-06-25")
        .set("x-test-role", "Staff");

      expect(response.status).toBe(403);
    });

    it("returns 400 for invalid targetDate param", async () => {
      const response = await request(createApp())
        .get("/api/ai/insight/invalid-date")
        .set("x-test-role", "Manager");

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 404 when insight not found", async () => {
      getInsightByDate.mockRejectedValue(new AppError("AI Insight not found.", 404, "INSIGHT_NOT_FOUND"));

      const response = await request(createApp())
        .get("/api/ai/insight/2026-06-25")
        .set("x-test-role", "Manager");

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("INSIGHT_NOT_FOUND");
    });
  });

  describe("PUT /api/ai/insight/:insightId/forecasts", () => {
    const INSIGHT_ID = "507f1f77bcf86cd799439099";
    const FOOD_ID = "507f1f77bcf86cd799439011";

    it("applies forecasts and returns updated insight for Admin", async () => {
      const mockInsight = {
        _id: INSIGHT_ID,
        targetDate: "2026-06-25",
        version: "1.0.0",
        forecasts: [],
        pricingRecommendations: [],
        generatedAt: "2026-06-22T10:00:00.000Z",
      };
      applyForecasts.mockResolvedValue(mockInsight);

      const response = await request(createApp())
        .put(`/api/ai/insight/${INSIGHT_ID}/forecasts`)
        .set("x-test-role", "Admin")
        .send({
          updates: [{ foodItemId: FOOD_ID, status: "Applied" }]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockInsight);
      expect(applyForecasts).toHaveBeenCalledWith(
        INSIGHT_ID,
        [{ foodItemId: FOOD_ID, status: "Applied" }],
        "507f1f77bcf86cd799439099"
      );
    });

    it("returns 403 for Staff role", async () => {
      const response = await request(createApp())
        .put(`/api/ai/insight/${INSIGHT_ID}/forecasts`)
        .set("x-test-role", "Staff")
        .send({
          updates: [{ foodItemId: FOOD_ID, status: "Applied" }]
        });

      expect(response.status).toBe(403);
    });

    it("returns 400 for invalid insightId param", async () => {
      const response = await request(createApp())
        .put(`/api/ai/insight/invalid-id/forecasts`)
        .set("x-test-role", "Admin")
        .send({
          updates: [{ foodItemId: FOOD_ID, status: "Applied" }]
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 for invalid updates body", async () => {
      const response = await request(createApp())
        .put(`/api/ai/insight/${INSIGHT_ID}/forecasts`)
        .set("x-test-role", "Admin")
        .send({
          updates: [{ foodItemId: "invalid-food-id", status: "InvalidStatus" }]
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/ai/pricing/recommendations", () => {
    it("returns 201 and generated pricing recommendations for Manager", async () => {
      const mockInsight = {
        _id: "507f1f77bcf86cd799439099",
        targetDate: "2026-06-25",
        version: 1,
        forecasts: [],
        pricingRecommendations: [
          {
            foodItemId: "507f1f77bcf86cd799439011",
            name: "Food 1",
            currentRemaining: 10,
            originalPrice: 10000,
            recommendedPrice: 9000,
            recommendedDiscountPercentage: 10,
            reason: "Reason",
            status: "Pending",
            appliedBy: null,
            appliedAt: null,
          }
        ],
        generatedAt: "2026-06-22T10:00:00.000Z",
      };
      generateDynamicPricingRecommendations.mockResolvedValue(mockInsight);

      const response = await request(createApp())
        .post("/api/ai/pricing/recommendations")
        .set("x-test-role", "Manager")
        .send({ targetDate: "2026-06-25" });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        _id: mockInsight._id,
        targetDate: mockInsight.targetDate,
        version: mockInsight.version,
        forecasts: mockInsight.forecasts,
        pricingRecommendations: [
          {
            foodItemId: "507f1f77bcf86cd799439011",
            name: "Food 1",
            currentRemaining: 10,
            originalPrice: 10000,
            recommendedPrice: 9000,
            recommendedDiscountPercentage: 10,
            reason: "Reason",
            status: "Pending",
            appliedBy: null,
            appliedAt: null,
          }
        ],
        generatedAt: mockInsight.generatedAt,
      });
      expect(generateDynamicPricingRecommendations).toHaveBeenCalledWith("2026-06-25");
    });

    it("returns 400 for invalid targetDate body", async () => {
      const response = await request(createApp())
        .post("/api/ai/pricing/recommendations")
        .set("x-test-role", "Manager")
        .send({ targetDate: "invalid-date" });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("PUT /api/ai/pricing/recommendations/:insightId/apply", () => {
    const INSIGHT_ID = "507f1f77bcf86cd799439099";
    const FOOD_ID = "507f1f77bcf86cd799439011";

    it("applies pricing recommendations and returns updated insight for Manager", async () => {
      const mockInsight = {
        _id: INSIGHT_ID,
        targetDate: "2026-06-25",
        version: 1,
        forecasts: [],
        pricingRecommendations: [
          {
            foodItemId: FOOD_ID,
            name: "Food 1",
            currentRemaining: 10,
            originalPrice: 10000,
            recommendedPrice: 9000,
            recommendedDiscountPercentage: 10,
            reason: "Reason",
            status: "Applied",
          }
        ],
        generatedAt: "2026-06-22T10:00:00.000Z",
      };
      applyPricingRecommendations.mockResolvedValue(mockInsight);

      const response = await request(createApp())
        .put(`/api/ai/pricing/recommendations/${INSIGHT_ID}/apply`)
        .set("x-test-role", "Manager")
        .send({
          updates: [{ foodItemId: FOOD_ID, status: "Applied" }]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(applyPricingRecommendations).toHaveBeenCalledWith(
        INSIGHT_ID,
        [{ foodItemId: FOOD_ID, status: "Applied" }],
        "507f1f77bcf86cd799439099"
      );
    });

    it("returns 400 for invalid insightId param", async () => {
      const response = await request(createApp())
        .put(`/api/ai/pricing/recommendations/invalid-id/apply`)
        .set("x-test-role", "Manager")
        .send({
          updates: [{ foodItemId: FOOD_ID, status: "Applied" }]
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });
});

