import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DashboardPage from "../DashboardPage";

vi.mock("../../hooks/useDashboard", () => ({
  default: () => ({
    data: {
      kpis: {
        todayRevenue: 12450000,
        revenueChangePercent: 8.5,
        todayOrderCount: 342,
        orderCountDelta: 12,
        averageOrderValue: 36400,
        averageOrderValueChangePercent: 0,
      },
      topFoods: [{ foodItemId: "1", name: "Phở Bò", quantity: 10, revenue: 450000, changePercent: 5 }],
      revenueChart: {
        labels: ["T2", "T3"],
        values: [1000000, 2000000],
      },
    },
    loading: false,
    error: null,
    orderStats: { byStatus: [], byPaymentMethod: [], payments: { successRate: 98 } },
    orderStatsLoading: false,
    refresh: vi.fn(),
  }),
}));

vi.mock("../../hooks/useRevenueChart", () => ({
  default: () => ({
    labels: ["T2", "T3"],
    values: [1000000, 2000000],
    range: "7d",
    chartLoading: false,
    onRangeChange: vi.fn(),
  }),
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

describe("DashboardPage", () => {
  it("renders dashboard heading and KPI labels", () => {
    render(<DashboardPage />);

    expect(screen.getByText("Tổng quan hôm nay")).toBeInTheDocument();
    expect(screen.getByText("Doanh thu hôm nay")).toBeInTheDocument();
    expect(screen.getByText("Số lượng đơn hàng")).toBeInTheDocument();
    expect(screen.getByText("Món Bán Chạy Nhất")).toBeInTheDocument();
    expect(screen.getByText("Phở Bò")).toBeInTheDocument();
  });
});
