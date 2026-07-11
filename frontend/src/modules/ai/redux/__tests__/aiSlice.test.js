import { describe, expect, it } from "vitest";
import reducer, {
  setInsight,
  clearInsight,
  setLoading,
  setMutating,
  setError,
  setSelectedDate,
  setActiveTab,
  setVersions,
  resetAiState,
} from "../aiSlice";

describe("aiSlice", () => {
  it("should return the initial state", () => {
    const state = reducer(undefined, { type: "@@INIT" });
    expect(state.insight).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.isMutating).toBe(false);
    expect(state.error).toBeNull();
    expect(state.activeTab).toBe("forecast");
    expect(state.selectedDate).toBeDefined();
    expect(state.versions).toEqual([]);
  });

  it("should handle setInsight", () => {
    const mockInsight = {
      _id: "insight_123",
      targetDate: "2026-06-25",
      forecasts: [],
      pricingRecommendations: [],
    };
    const state = reducer(undefined, setInsight(mockInsight));
    expect(state.insight).toEqual(mockInsight);
    expect(state.error).toBeNull();
  });

  it("should handle clearInsight", () => {
    const previousState = {
      insight: { _id: "insight_123" },
      error: "Some error",
      isLoading: false,
    };
    const state = reducer(previousState, clearInsight());
    expect(state.insight).toBeNull();
    expect(state.error).toBeNull();
  });

  it("should handle setLoading", () => {
    const state = reducer(undefined, setLoading(true));
    expect(state.isLoading).toBe(true);
  });

  it("should handle setMutating", () => {
    const state = reducer(undefined, setMutating(true));
    expect(state.isMutating).toBe(true);
  });

  it("should handle setError", () => {
    const state = reducer(undefined, setError("Lỗi kết nối"));
    expect(state.error).toBe("Lỗi kết nối");
    expect(state.isLoading).toBe(false);
    expect(state.isMutating).toBe(false);
  });

  it("should handle setSelectedDate", () => {
    const state = reducer(undefined, setSelectedDate("2026-07-01"));
    expect(state.selectedDate).toBe("2026-07-01");
  });

  it("should handle setActiveTab", () => {
    const state = reducer(undefined, setActiveTab("pricing"));
    expect(state.activeTab).toBe("pricing");
  });

  it("should handle setVersions", () => {
    const mockVersions = ["v1", "v2"];
    const state = reducer(undefined, setVersions(mockVersions));
    expect(state.versions).toEqual(mockVersions);
  });

  it("should handle resetAiState", () => {
    const previousState = {
      insight: { _id: "1" },
      isLoading: true,
      isMutating: true,
      error: "Error",
      selectedDate: "2026-01-01",
      activeTab: "pricing",
      versions: ["v1"],
    };
    const state = reducer(previousState, resetAiState());
    expect(state.insight).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.isMutating).toBe(false);
    expect(state.error).toBeNull();
    expect(state.activeTab).toBe("forecast");
    expect(state.versions).toEqual([]);
  });
});
