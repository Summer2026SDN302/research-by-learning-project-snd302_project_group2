import { describe, expect, it } from "vitest";

import analyticsReducer, {
  fetchDashboardSummary,
  setChartRange,
  setReportFilters,
} from "../../redux/analyticsSlice";

describe("analyticsSlice", () => {
  it("updates chart range", () => {
    const state = analyticsReducer(undefined, setChartRange("month"));
    expect(state.revenueChart.range).toBe("month");
  });

  it("merges report filters and resets page", () => {
    const initial = analyticsReducer(undefined, { type: "init" });
    const withPage = {
      ...initial,
      report: {
        ...initial.report,
        pagination: { ...initial.report.pagination, page: 3 },
      },
    };

    const next = analyticsReducer(
      withPage,
      setReportFilters({ status: "Paid" }),
    );

    expect(next.report.filters.status).toBe("Paid");
    expect(next.report.pagination.page).toBe(1);
  });

  it("stores dashboard summary on fulfilled fetch", () => {
    const payload = {
      meta: { date: "2026-06-24" },
      kpis: { todayRevenue: 1000 },
      revenueChart: { labels: [], values: [] },
      topFoods: [],
    };

    const state = analyticsReducer(
      undefined,
      fetchDashboardSummary.fulfilled(payload),
    );

    expect(state.dashboard.data).toEqual(payload);
    expect(state.dashboard.loading).toBe(false);
  });
});
