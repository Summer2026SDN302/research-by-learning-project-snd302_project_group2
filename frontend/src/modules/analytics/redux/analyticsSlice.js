import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  exportRevenueReport,
  getDashboardSummary,
  getOrderStatistics,
  getRevenueChart,
  getTransactionReport,
} from "../api/analyticsApi";
import {
  CHART_RANGE,
  DATE_PRESETS,
  REPORT_PAGE_SIZE,
} from "../constants/analyticsConstants";
import { getDateRangeFromPreset } from "../utils/dateRange";

const defaultDateRange = getDateRangeFromPreset(DATE_PRESETS.LAST_7_DAYS);

const initialReportFilters = {
  status: "",
  paymentMethod: "",
  from: defaultDateRange.from,
  to: defaultDateRange.to,
  search: "",
  datePreset: DATE_PRESETS.LAST_7_DAYS,
};

const initialState = {
  dashboard: {
    data: null,
    loading: false,
    error: null,
    lastFetchedAt: null,
  },
  revenueChart: {
    data: null,
    loading: false,
    range: CHART_RANGE.SEVEN_DAYS.value,
  },
  orderStats: {
    data: null,
    loading: false,
    error: null,
  },
  report: {
    summary: null,
    items: [],
    pagination: { page: 1, limit: REPORT_PAGE_SIZE, total: 0, totalPages: 0 },
    filters: initialReportFilters,
    loading: false,
    exportLoading: false,
    error: null,
  },
};

export const fetchDashboardSummary = createAsyncThunk(
  "analytics/fetchDashboardSummary",
  async (params, { rejectWithValue }) => {
    try {
      return await getDashboardSummary(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải dữ liệu dashboard",
      );
    }
  },
);

export const fetchRevenueChart = createAsyncThunk(
  "analytics/fetchRevenueChart",
  async (params, { rejectWithValue }) => {
    try {
      return await getRevenueChart(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải biểu đồ doanh thu",
      );
    }
  },
);

export const fetchOrderStatistics = createAsyncThunk(
  "analytics/fetchOrderStatistics",
  async (params, { rejectWithValue }) => {
    try {
      return await getOrderStatistics(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải thống kê đơn hàng",
      );
    }
  },
);

export const fetchTransactionReport = createAsyncThunk(
  "analytics/fetchTransactionReport",
  async (params, { rejectWithValue }) => {
    try {
      return await getTransactionReport(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải báo cáo giao dịch",
      );
    }
  },
);

export const exportRevenueReportThunk = createAsyncThunk(
  "analytics/exportRevenueReport",
  async (params, { rejectWithValue }) => {
    try {
      return await exportRevenueReport(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể xuất báo cáo",
      );
    }
  },
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    setChartRange(state, action) {
      state.revenueChart.range = action.payload;
    },
    setReportFilters(state, action) {
      state.report.filters = { ...state.report.filters, ...action.payload };
      state.report.pagination.page = 1;
    },
    setReportPage(state, action) {
      state.report.pagination.page = action.payload;
    },
    resetReportFilters(state) {
      state.report.filters = { ...initialReportFilters };
      state.report.pagination.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.dashboard.loading = true;
        state.dashboard.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.data = action.payload;
        state.dashboard.lastFetchedAt = Date.now();
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.error = action.payload;
      })
      .addCase(fetchRevenueChart.pending, (state) => {
        state.revenueChart.loading = true;
      })
      .addCase(fetchRevenueChart.fulfilled, (state, action) => {
        state.revenueChart.loading = false;
        state.revenueChart.data = action.payload;
      })
      .addCase(fetchRevenueChart.rejected, (state) => {
        state.revenueChart.loading = false;
      })
      .addCase(fetchOrderStatistics.pending, (state) => {
        state.orderStats.loading = true;
        state.orderStats.error = null;
      })
      .addCase(fetchOrderStatistics.fulfilled, (state, action) => {
        state.orderStats.loading = false;
        state.orderStats.data = action.payload;
      })
      .addCase(fetchOrderStatistics.rejected, (state, action) => {
        state.orderStats.loading = false;
        state.orderStats.error = action.payload;
      })
      .addCase(fetchTransactionReport.pending, (state) => {
        state.report.loading = true;
        state.report.error = null;
      })
      .addCase(fetchTransactionReport.fulfilled, (state, action) => {
        state.report.loading = false;
        state.report.summary = action.payload.summary;
        state.report.items = action.payload.items;
        state.report.pagination = action.payload.pagination;
      })
      .addCase(fetchTransactionReport.rejected, (state, action) => {
        state.report.loading = false;
        state.report.error = action.payload;
      })
      .addCase(exportRevenueReportThunk.pending, (state) => {
        state.report.exportLoading = true;
      })
      .addCase(exportRevenueReportThunk.fulfilled, (state) => {
        state.report.exportLoading = false;
      })
      .addCase(exportRevenueReportThunk.rejected, (state) => {
        state.report.exportLoading = false;
      });
  },
});

export const { setChartRange, setReportFilters, setReportPage, resetReportFilters } =
  analyticsSlice.actions;

export const selectDashboardData = (state) => state.analytics.dashboard.data;
export const selectDashboardLoading = (state) => state.analytics.dashboard.loading;
export const selectDashboardError = (state) => state.analytics.dashboard.error;
export const selectRevenueChartData = (state) => state.analytics.revenueChart.data;
export const selectRevenueChartLoading = (state) => state.analytics.revenueChart.loading;
export const selectChartRange = (state) => state.analytics.revenueChart.range;
export const selectOrderStats = (state) => state.analytics.orderStats.data;
export const selectOrderStatsLoading = (state) => state.analytics.orderStats.loading;
export const selectReportSummary = (state) => state.analytics.report.summary;
export const selectReportItems = (state) => state.analytics.report.items;
export const selectReportPagination = (state) => state.analytics.report.pagination;
export const selectReportFilters = (state) => state.analytics.report.filters;
export const selectReportLoading = (state) => state.analytics.report.loading;
export const selectReportExportLoading = (state) =>
  state.analytics.report.exportLoading;

export default analyticsSlice.reducer;
