import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  exportRevenueReport,
  getDashboardSummary,
  getRevenueChart,
  getTopFoods,
  getSalesTrend,
  getTransactionReport,
  getOrderStatistics,
} from "../api/analyticsApi";
import {
  CHART_RANGE,
  DATE_PRESETS,
  REPORT_PAGE_SIZE,
} from "../constants/analyticsConstants";
import { getDateRangeFromPreset } from "../utils/dateRange";

const defaultDateRange = getDateRangeFromPreset(DATE_PRESETS.TODAY);

const initialReportFilters = {
  status: "",
  paymentMethod: "",
  from: defaultDateRange.from,
  to: defaultDateRange.to,
  search: "",
  datePreset: DATE_PRESETS.TODAY,
};

const initialState = {
  dashboardFilters: {
    preset: DATE_PRESETS.TODAY,
    from: getDateRangeFromPreset(DATE_PRESETS.TODAY).from,
    to: getDateRangeFromPreset(DATE_PRESETS.TODAY).to,
  },
  dashboard: {
    data: null,
    loading: false,
    error: null,
    lastFetchedAt: null,
  },
  revenueChart: {
    data: null,
    loading: false,
    error: null,
    range: CHART_RANGE.SEVEN_DAYS.value,
  },
  orderStats: {
    data: null,
    loading: false,
    error: null,
  },
  recentTransactions: {
    items: [],
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
  topFoodsReport: {
    items: [],
    loading: false,
    error: null,
  },
  salesTrend: {
    data: null,
    loading: false,
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

export const fetchRecentTransactions = createAsyncThunk(
  "analytics/fetchRecentTransactions",
  async (params = { page: 1, limit: 5 }, { rejectWithValue }) => {
    try {
      return await getTransactionReport(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải giao dịch gần đây",
      );
    }
  },
);

export const fetchTopFoodsReport = createAsyncThunk(
  "analytics/fetchTopFoodsReport",
  async (params, { rejectWithValue }) => {
    try {
      return await getTopFoods(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải báo cáo top món ăn",
      );
    }
  },
);

export const fetchSalesTrend = createAsyncThunk(
  "analytics/fetchSalesTrend",
  async (params, { rejectWithValue }) => {
    try {
      return await getSalesTrend(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải xu hướng doanh số",
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
    setDashboardFilters(state, action) {
      state.dashboardFilters = { ...state.dashboardFilters, ...action.payload };
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
        state.revenueChart.error = null;
      })
      .addCase(fetchRevenueChart.fulfilled, (state, action) => {
        state.revenueChart.loading = false;
        state.revenueChart.data = action.payload;
      })
      .addCase(fetchRevenueChart.rejected, (state, action) => {
        state.revenueChart.loading = false;
        state.revenueChart.error = action.payload;
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
      })
      .addCase(fetchRecentTransactions.pending, (state) => {
        state.recentTransactions.loading = true;
        state.recentTransactions.error = null;
      })
      .addCase(fetchRecentTransactions.fulfilled, (state, action) => {
        state.recentTransactions.loading = false;
        state.recentTransactions.items = action.payload.items;
      })
      .addCase(fetchRecentTransactions.rejected, (state, action) => {
        state.recentTransactions.loading = false;
        state.recentTransactions.error = action.payload;
      })
      .addCase(fetchTopFoodsReport.pending, (state) => {
        state.topFoodsReport.loading = true;
        state.topFoodsReport.error = null;
      })
      .addCase(fetchTopFoodsReport.fulfilled, (state, action) => {
        state.topFoodsReport.loading = false;
        state.topFoodsReport.items = action.payload?.items || [];
      })
      .addCase(fetchTopFoodsReport.rejected, (state, action) => {
        state.topFoodsReport.loading = false;
        state.topFoodsReport.error = action.payload;
      })
      .addCase(fetchSalesTrend.pending, (state) => {
        state.salesTrend.loading = true;
        state.salesTrend.error = null;
      })
      .addCase(fetchSalesTrend.fulfilled, (state, action) => {
        state.salesTrend.loading = false;
        state.salesTrend.data = action.payload;
      })
      .addCase(fetchSalesTrend.rejected, (state, action) => {
        state.salesTrend.loading = false;
        state.salesTrend.error = action.payload;
      });
  },
});

export const {
  setChartRange,
  setDashboardFilters,
  setReportFilters,
  setReportPage,
  resetReportFilters,
} = analyticsSlice.actions;

export const selectDashboardFilters = (state) => state.analytics.dashboardFilters;
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
export const selectRecentTransactions = (state) =>
  state.analytics.recentTransactions.items;
export const selectRecentTransactionsLoading = (state) =>
  state.analytics.recentTransactions.loading;
export const selectRevenueChartError = (state) =>
  state.analytics.revenueChart.error;

export const selectTopFoodsReportItems = (state) => state.analytics.topFoodsReport.items;
export const selectTopFoodsReportLoading = (state) => state.analytics.topFoodsReport.loading;
export const selectSalesTrendData = (state) => state.analytics.salesTrend.data;
export const selectSalesTrendLoading = (state) => state.analytics.salesTrend.loading;

export default analyticsSlice.reducer;
