import { beforeEach, describe, expect, it, vi } from "vitest";
import { getInsightByDate, applyForecasts } from "../ai.service.js";
import * as aiRepository from "../ai.repository.js";
import * as dailyMenuRepository from "../../menu/daily-menu/daily-menu.repository.js";
import * as userRepository from "../../user/user.repository.js";
import AppError from "../../../shared/exceptions/AppError.js";

vi.mock("../ai.repository.js", () => {
  return {
    findLatestByDate: vi.fn(),
    findById: vi.fn(),
    createInsight: vi.fn(),
    saveInsight: vi.fn(),
  };
});

vi.mock("../../menu/daily-menu/daily-menu.repository.js", () => {
  return {
    findMenuByDate: vi.fn(),
    updateMenuItemFields: vi.fn(),
  };
});

vi.mock("../../user/user.repository.js", () => {
  return {
    findUserById: vi.fn(),
  };
});

describe("AiService.getInsightByDate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should query aiRepository by date", async () => {
    const mockInsight = { targetDate: new Date("2026-06-25") };
    aiRepository.findLatestByDate.mockResolvedValue(mockInsight);

    const result = await getInsightByDate("2026-06-25");

    expect(aiRepository.findLatestByDate).toHaveBeenCalledWith("2026-06-25");
    expect(result).toEqual(mockInsight);
  });

  it("should throw error if insight is not found", async () => {
    aiRepository.findLatestByDate.mockResolvedValue(null);

    await expect(
      getInsightByDate("2026-06-25")
    ).rejects.toThrow(new AppError("AI Insight not found.", 404, "INSIGHT_NOT_FOUND"));
  });
});

describe("AiService.applyForecasts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userRepository.findUserById.mockResolvedValue({
      _id: "user123",
      username: "tester",
      fullName: "Tester",
      role: "Manager",
    });
  });

  it("should throw error if insight is not found", async () => {
    aiRepository.findById.mockResolvedValue(null);

    await expect(
      applyForecasts("insight123", [], "user123")
    ).rejects.toThrow(new AppError("AI Insight not found.", 404, "INSIGHT_NOT_FOUND"));
  });

  it("should throw error if daily menu is not found", async () => {
    aiRepository.findById.mockResolvedValue({
      _id: "insight123",
      targetDate: new Date("2026-06-25"),
    });
    dailyMenuRepository.findMenuByDate.mockResolvedValue(null);

    await expect(
      applyForecasts("insight123", [], "user123")
    ).rejects.toThrow(
      new AppError(
        "Daily Menu for date 2026-06-25 does not exist. Please generate the daily menu first before applying forecasts.",
        400,
        "DAILY_MENU_NOT_FOUND"
      )
    );
  });

  it("should update forecast status and apply to DailyMenu items", async () => {
    const mockInsight = {
      _id: "insight123",
      targetDate: new Date("2026-06-25"),
      forecasts: [
        {
          foodItemId: "food1",
          recommendedQuantity: 15,
          status: "Pending",
        },
        {
          foodItemId: "food2",
          recommendedQuantity: 20,
          status: "Pending",
        },
      ],
    };
    aiRepository.findById.mockResolvedValue(mockInsight);

    const mockDailyMenu = {
      _id: "menu123",
      items: [
        {
          foodItemId: { _id: "food1" },
          soldQuantity: 2,
        },
        {
          foodItemId: { _id: "food2" },
          soldQuantity: 5,
        },
      ],
    };
    dailyMenuRepository.findMenuByDate.mockResolvedValue(mockDailyMenu);

    const updates = [
      { foodItemId: "food1", status: "Applied" },
      { foodItemId: "food2", status: "Rejected" },
    ];

    const result = await applyForecasts("insight123", updates, "user123");

    // check forecast updates in insight document
    expect(mockInsight.forecasts[0].status).toBe("Applied");
    expect(mockInsight.forecasts[0].appliedBy).toBe("user123");
    expect(mockInsight.forecasts[0].appliedAt).toBeInstanceOf(Date);

    expect(mockInsight.forecasts[1].status).toBe("Rejected");
    expect(mockInsight.forecasts[1].rejectedBy).toBe("user123");
    expect(mockInsight.forecasts[1].rejectedAt).toBeInstanceOf(Date);
    expect(mockInsight.forecasts[1].appliedBy).toBeNull();

    expect(aiRepository.saveInsight).toHaveBeenCalledWith(mockInsight);

    // check dailyMenuRepository calls
    expect(dailyMenuRepository.updateMenuItemFields).toHaveBeenCalledTimes(1);
    expect(dailyMenuRepository.updateMenuItemFields).toHaveBeenCalledWith(
      "menu123",
      "food1",
      {
        preparedQuantity: 15,
        remainingQuantity: 13, // 15 - 2 sold
        quantityAdjustedBy: "user123",
        adjustedAt: expect.any(Date),
      }
    );

    expect(result).toBe(mockInsight);
  });
});
