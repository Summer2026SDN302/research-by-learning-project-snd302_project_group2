import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { generateDynamicPricingRecommendations, applyPricingRecommendations } from "../ai.service.js";
import * as aiRepository from "../ai.repository.js";
import * as dailyMenuRepository from "../../menu/daily-menu/daily-menu.repository.js";
import * as userRepository from "../../user/user.repository.js";
import AppError from "../../../shared/exceptions/AppError.js";

vi.mock("../ai.repository.js", () => {
  return {
    findLatestByDate: vi.fn(),
    findById: vi.fn(),
    saveInsight: vi.fn(),
  };
});

vi.mock("../../menu/daily-menu/daily-menu.repository.js", () => {
  return {
    findMenuByDate: vi.fn(),
    pushPriceHistoryAndUpdatePrice: vi.fn(),
  };
});

vi.mock("../../user/user.repository.js", () => {
  return {
    findUserById: vi.fn(),
  };
});

describe("AiService.generateDynamicPricingRecommendations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should throw if no insight found", async () => {
    aiRepository.findLatestByDate.mockResolvedValue(null);
    await expect(generateDynamicPricingRecommendations("2026-06-25")).rejects.toThrow(
      new AppError("AI Insight not found. Cannot generate pricing recommendations.", 404, "INSIGHT_NOT_FOUND")
    );
  });

  it("should calculate D_remain and apply floor price correctly", async () => {
    // Local 18:30 — service uses Date#getHours() (machine timezone)
    const localEvening = new Date();
    localEvening.setHours(18, 30, 0, 0);
    vi.setSystemTime(localEvening);

    const mockInsight = {
      _id: "insight123",
      targetDate: new Date("2026-06-25"),
      forecasts: [
        {
          foodItemId: "food1",
          predictedDemand: 100, // Forecast
        }
      ]
    };
    aiRepository.findLatestByDate.mockResolvedValue(mockInsight);

    const mockDailyMenu = {
      isConfigured: true,
      items: [
        {
          foodItemId: { _id: "food1", cost: 20000, name: "Food 1" },
          originalPrice: 30000,
          currentPrice: 30000,
          soldQuantity: 80, // Sold today
          remainingQuantity: 40, // I
          status: "Available"
        }
      ]
    };
    dailyMenuRepository.findMenuByDate.mockResolvedValue(mockDailyMenu);

    // D_remain = max(0, 100 - 80) = 20
    // Excess = max(0, 40 - 20) = 20
    // Excess Ratio = 20 / 40 = 0.5 (50%)
    // Since < 2 hours remaining and excess ratio 0.5 -> Discount is 30%
    // 30% of 30000 = 21000
    // Floor price = 20000 * 1.05 = 21000
    // Recommended Price = max(21000, 21000) = 21000

    const result = await generateDynamicPricingRecommendations("2026-06-25");

    expect(result.pricingRecommendations).toHaveLength(1);
    expect(result.pricingRecommendations[0]).toMatchObject({
      foodItemId: "food1",
      name: "Food 1",
      currentRemaining: 40,
      originalPrice: 30000,
      recommendedPrice: 21000,
      recommendedDiscountPercentage: 30,
      status: "Pending"
    });
    expect(aiRepository.saveInsight).toHaveBeenCalledWith(result);
  });
  
  it("should use floor price if discount is too deep", async () => {
    const localEvening = new Date();
    localEvening.setHours(18, 30, 0, 0);
    vi.setSystemTime(localEvening);

    const mockInsight = {
      _id: "insight123",
      targetDate: new Date("2026-06-25"),
      forecasts: [
        {
          foodItemId: "food2",
          predictedDemand: 100,
        }
      ]
    };
    aiRepository.findLatestByDate.mockResolvedValue(mockInsight);

    const mockDailyMenu = {
      isConfigured: true,
      items: [
        {
          foodItemId: { _id: "food2", cost: 20000, name: "Food 2" },
          originalPrice: 25000, // smaller margin
          currentPrice: 25000,
          soldQuantity: 30, // D_remain = 70
          remainingQuantity: 100, // Excess = 30 -> ratio = 0.3 -> Discount 20%
          status: "Available"
        }
      ]
    };
    // Let's force >60% excess
    mockDailyMenu.items[0].remainingQuantity = 200; // Excess = 130 -> ratio 0.65 -> Discount 50%
    dailyMenuRepository.findMenuByDate.mockResolvedValue(mockDailyMenu);

    // Discount 50% of 25000 = 12500
    // Floor price = 20000 * 1.05 = 21000
    // Recommended Price = 21000

    const result = await generateDynamicPricingRecommendations("2026-06-25");

    expect(result.pricingRecommendations).toHaveLength(1);
    expect(result.pricingRecommendations[0].recommendedPrice).toBe(21000); // Floor price wins
    expect(result.pricingRecommendations[0].recommendedDiscountPercentage).toBe(50);
  });
});

describe("AiService.applyPricingRecommendations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userRepository.findUserById.mockResolvedValue({
      _id: "user123",
      username: "tester",
      fullName: "Tester",
      role: "Manager",
    });
  });

  it("should apply pricing without double discounting", async () => {
    const mockInsight = {
      _id: "insight123",
      targetDate: new Date("2026-06-25"),
      pricingRecommendations: [
        {
          foodItemId: "food1",
          originalPrice: 30000,
          recommendedPrice: 24000,
          status: "Pending"
        }
      ]
    };
    aiRepository.findById.mockResolvedValue(mockInsight);

    const mockDailyMenu = {
      _id: "menu123",
      items: [
        {
          foodItemId: { _id: "food1" },
          originalPrice: 30000,
          currentPrice: 28000, // Someone changed price before
        }
      ]
    };
    dailyMenuRepository.findMenuByDate.mockResolvedValue(mockDailyMenu);

    const updates = [{ foodItemId: "food1", status: "Applied" }];
    const result = await applyPricingRecommendations("insight123", updates, "user123");

    expect(result.pricingRecommendations[0].status).toBe("Applied");
    
    // Check that pushPriceHistoryAndUpdatePrice was called with 24000
    expect(dailyMenuRepository.pushPriceHistoryAndUpdatePrice).toHaveBeenCalledWith(
      "menu123",
      "food1",
      24000,
      expect.objectContaining({
        oldValue: 28000, // Should use the current currentPrice as oldValue if present
        newValue: 24000,
        changedBy: "user123",
        source: "AI",
        recommendationId: "insight123"
      })
    );
    expect(aiRepository.saveInsight).toHaveBeenCalled();
  });
});
