import { beforeEach, describe, expect, it, vi } from "vitest";

import { calcPercentChange } from "../../../shared/helpers/analytics.helper.js";
import * as analyticsRepository from "../analytics.repository.js";
import * as analyticsService from "../analytics.service.js";

vi.mock("../analytics.repository.js", () => ({
  countPaidPayments: vi.fn(),
  sumRevenueForDate: vi.fn(),
  sumRevenueByDateRange: vi.fn(),
  getRevenueGroupedByDay: vi.fn(),
  getTopFoods: vi.fn(),
  getOrdersByStatus: vi.fn(),
  getPaymentsByMethod: vi.fn(),
  getPaymentStats: vi.fn(),
  findTransactions: vi.fn(),
  findTransactionsForExport: vi.fn(),
  getTransactionSummary: vi.fn(),
}));

describe("analytics.helper calcPercentChange", () => {
  it("returns null when previous is zero", () => {
    expect(calcPercentChange(100, 0)).toBeNull();
  });

  it("rounds to one decimal place", () => {
    expect(calcPercentChange(108.5, 100)).toBe(8.5);
  });
});

describe("analyticsService.getDashboardSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    analyticsRepository.countPaidPayments.mockResolvedValue(0);
    analyticsRepository.sumRevenueForDate.mockResolvedValue({
      revenue: 0,
      orderCount: 0,
    });
    analyticsRepository.getRevenueGroupedByDay.mockResolvedValue([]);
    analyticsRepository.getTopFoods.mockResolvedValue([]);
  });

  it("returns zeroed dashboard when database is empty", async () => {
    const result = await analyticsService.getDashboardSummary({
      date: "2026-06-24",
    });

    expect(result.kpis.todayRevenue).toBe(0);
    expect(result.kpis.revenueChangePercent).toBeNull();
    expect(result.kpis.todayOrderCount).toBe(0);
    expect(result.topFoods).toEqual([]);
    expect(result.revenueChart.values).toHaveLength(7);
  });

  it("calculates KPI change when yesterday has revenue", async () => {
    analyticsRepository.sumRevenueForDate
      .mockResolvedValueOnce({ revenue: 12450000, orderCount: 342 })
      .mockResolvedValueOnce({ revenue: 11470000, orderCount: 330 });

    const result = await analyticsService.getDashboardSummary({
      date: "2026-06-24",
    });

    expect(result.kpis.todayRevenue).toBe(12450000);
    expect(result.kpis.revenueChangePercent).toBe(8.5);
    expect(result.kpis.orderCountDelta).toBe(12);
  });
});

describe("analyticsService.exportRevenueReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws EXPORT_TOO_LARGE when rows exceed limit", async () => {
    analyticsRepository.findTransactionsForExport.mockResolvedValue(
      Array.from({ length: 10_001 }, (_, index) => ({
        paymentNumber: `TXN-${index}`,
        orderNumber: `ORD-${index}`,
        paidAt: new Date("2026-06-24T10:00:00.000Z"),
        paymentMethod: "Cash",
        finalAmount: 1000,
        paymentStatus: "Paid",
      })),
    );

    await expect(analyticsService.exportRevenueReport({})).rejects.toEqual(
      expect.objectContaining({
        code: "EXPORT_TOO_LARGE",
        statusCode: 413,
      }),
    );
  });

  it("returns UTF-8 CSV with BOM", async () => {
    analyticsRepository.findTransactionsForExport.mockResolvedValue([
      {
        paymentNumber: "TXN-1",
        orderNumber: "ORD-1",
        paidAt: new Date("2026-06-24T10:00:00.000Z"),
        paymentMethod: "Cash",
        finalAmount: 35000,
        paymentStatus: "Paid",
      },
    ]);

    const csv = await analyticsService.exportRevenueReport({});

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("Mã GD");
    expect(csv).toContain("TXN-1");
    expect(csv).toContain("35000");
  });
});

describe("analyticsService.getTransactionReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    analyticsRepository.findTransactions.mockResolvedValue({ items: [], total: 0 });
    analyticsRepository.getTransactionSummary.mockResolvedValue({
      totalRevenue: 0,
      successCount: 0,
      pendingCount: 0,
      successRate: 0,
    });
    analyticsRepository.countPaidPayments.mockResolvedValue(0);
    analyticsRepository.sumRevenueByDateRange.mockResolvedValue({
      revenue: 0,
      orderCount: 0,
    });
  });

  it("rejects invalid date range", async () => {
    await expect(
      analyticsService.getTransactionReport({
        from: "2026-06-10",
        to: "2026-06-01",
      }),
    ).rejects.toEqual(
      expect.objectContaining({
        code: "VALIDATION_ERROR",
        statusCode: 400,
      }),
    );
  });
});
