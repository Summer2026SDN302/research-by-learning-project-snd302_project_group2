import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { DASHBOARD_POLL_INTERVAL_MS } from "../constants/analyticsConstants";
import {
  fetchDashboardSummary,
  fetchOrderStatistics,
  selectDashboardData,
  selectDashboardError,
  selectDashboardLoading,
  selectOrderStats,
  selectOrderStatsLoading,
} from "../redux/analyticsSlice";

const useDashboard = () => {
  const dispatch = useDispatch();
  const data = useSelector(selectDashboardData);
  const loading = useSelector(selectDashboardLoading);
  const dashboardError = useSelector(selectDashboardError);
  const orderStats = useSelector(selectOrderStats);
  const orderStatsLoading = useSelector(selectOrderStatsLoading);

  const refresh = useCallback(() => {
    dispatch(fetchDashboardSummary());
    dispatch(fetchOrderStatistics());
  }, [dispatch]);

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
    refresh,
  };
};

export default useDashboard;
