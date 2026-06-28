import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import RevenueReportPage from "../RevenueReportPage";

const mockHook = {
  summary: {
    totalRevenue: 45280000,
    revenueChangePercent: 12,
    successCount: 1248,
    pendingCount: 2,
    successRate: 98.5,
  },
  items: [
    {
      _id: "1",
      paymentNumber: "TXN-8842",
      paidAt: "2026-06-24T14:32:10.000Z",
      paymentMethod: "Cash",
      finalAmount: 35000,
      paymentStatus: "Paid",
    },
  ],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
  filters: {
    status: "",
    paymentMethod: "",
    from: "2026-06-18",
    to: "2026-06-24",
    search: "",
    datePreset: "7d",
  },
  loading: false,
  exportLoading: false,
  searchInput: "",
  setSearchInput: vi.fn(),
  setStatusFilter: vi.fn(),
  setPaymentMethod: vi.fn(),
  setDatePreset: vi.fn(),
  setPage: vi.fn(),
  handleExport: vi.fn(),
};

vi.mock("../../hooks/useRevenueReport", () => ({
  default: () => mockHook,
}));

describe("RevenueReportPage", () => {
  it("renders report header and summary cards", () => {
    render(<RevenueReportPage />);

    expect(
      screen.getByRole("heading", { name: "Báo cáo doanh thu" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Tổng doanh thu")).toBeInTheDocument();
    expect(screen.getByText("TXN-8842")).toBeInTheDocument();
  });

  it("calls export handler when clicking export button", async () => {
    const user = userEvent.setup();
    render(<RevenueReportPage />);

    await user.click(screen.getByRole("button", { name: /Xuất báo cáo/i }));
    expect(mockHook.handleExport).toHaveBeenCalled();
  });
});
