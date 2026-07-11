import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import StaffDashboardPage from "../StaffDashboardPage";

vi.mock("../../../components/data-display/StatisticCard", () => ({
  default: ({ label, value }) => (
    <div data-testid="stat-card">
      <span>{label}</span>: <span>{value}</span>
    </div>
  ),
}));

vi.mock("../../hooks/useStaffDashboard", () => ({
  default: () => ({
    data: {
      orders: {
        pending: 3,
        completedToday: 12,
      },
      menu: {
        active: 10,
        soldOut: 1,
      },
      topFoods: [
        { foodItemId: "f1", name: "Bún Chả", quantity: 15 },
        { foodItemId: "f2", name: "Phở Gà", quantity: 8 },
      ],
    },
    loading: false,
    error: null,
    refresh: vi.fn(),
  }),
}));

describe("StaffDashboardPage", () => {
  it("renders staff operational heading and correct operational metrics", () => {
    render(<StaffDashboardPage />);

    expect(screen.getByText("Tổng quan hoạt động")).toBeInTheDocument();
    expect(screen.getByText("Món ăn bán chạy hôm nay")).toBeInTheDocument();
    expect(screen.getByText("Bún Chả")).toBeInTheDocument();
    expect(screen.getByText("15 phần")).toBeInTheDocument();
    expect(screen.getByText("Phở Gà")).toBeInTheDocument();
    expect(screen.getByText("8 phần")).toBeInTheDocument();
  });
});
