import apiClient from "../../../services/apiClient";

export const getDashboardSummary = (params = {}) =>
  apiClient
    .get("/analytics/dashboard/summary", { params })
    .then((response) => response.data.data);

export const getRevenueChart = (params = {}) =>
  apiClient
    .get("/analytics/revenue/chart", { params })
    .then((response) => response.data.data);

export const getTopFoods = (params = {}) =>
  apiClient
    .get("/analytics/foods/top", { params })
    .then((response) => response.data.data);

export const getSalesTrend = (params = {}) =>
  apiClient
    .get("/analytics/sales/trend", { params })
    .then((response) => response.data.data);

export const getOrderStatistics = (params = {}) =>
  apiClient
    .get("/analytics/orders/statistics", { params })
    .then((response) => response.data.data);

export const getTransactionReport = (params = {}) =>
  apiClient
    .get("/analytics/reports/transactions", { params })
    .then((response) => response.data.data);

export const exportRevenueReport = (params = {}) =>
  apiClient
    .get("/analytics/reports/revenue/export", {
      params,
      responseType: "blob",
    })
    .then((response) => response.data);

export const getStaffDashboardSummary = (params = {}) =>
  apiClient
    .get("/analytics/staff/summary", { params })
    .then((response) => response.data.data);
