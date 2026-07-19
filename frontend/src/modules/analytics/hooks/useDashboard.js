import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { DASHBOARD_POLL_INTERVAL_MS } from "../constants/analyticsConstants";
import {
  fetchDashboardSummary,
  fetchOrderStatistics,
  fetchRecentTransactions,
  fetchRevenueChart,
  selectDashboardData,
  selectDashboardError,
  selectDashboardLoading,
  selectDashboardFilters,
  selectOrderStats,
  selectOrderStatsLoading,
  selectRecentTransactions,
  selectRecentTransactionsLoading,
} from "../redux/analyticsSlice";

const useDashboard = () => {
  const dispatch = useDispatch();
  const data = useSelector(selectDashboardData);
  const loading = useSelector(selectDashboardLoading);
  const dashboardError = useSelector(selectDashboardError);
  const orderStats = useSelector(selectOrderStats);
  const orderStatsLoading = useSelector(selectOrderStatsLoading);
  const recentTransactions = useSelector(selectRecentTransactions);
  const recentTransactionsLoading = useSelector(selectRecentTransactionsLoading);
  const filters = useSelector(selectDashboardFilters);

  const refresh = useCallback(() => {
    const params = {
      chartRange: filters.preset !== "custom" ? filters.preset : undefined,
      from: filters.from,
      to: filters.to,
    };
    dispatch(fetchDashboardSummary({ chartRange: params.chartRange }));
    dispatch(fetchOrderStatistics({ from: params.from, to: params.to }));
    dispatch(fetchRecentTransactions());
    dispatch(fetchRevenueChart({
      from: params.from,
      to: params.to,
      range: params.chartRange,
    }));
  }, [dispatch, filters]);

  useEffect(() => {
    refresh();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    }, DASHBOARD_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [refresh]);

  return {
    data,
    loading,
    error: dashboardError,
    orderStats,
    orderStatsLoading,
    recentTransactions,
    recentTransactionsLoading,
    refresh,
  };
};

export default useDashboard;
