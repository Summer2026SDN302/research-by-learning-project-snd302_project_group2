import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchRevenueChart,
  selectChartRange,
  selectDashboardData,
  selectRevenueChartData,
  selectRevenueChartLoading,
  setChartRange,
} from "../redux/analyticsSlice";

const useRevenueChart = () => {
  const dispatch = useDispatch();
  const dashboardData = useSelector(selectDashboardData);
  const chartData = useSelector(selectRevenueChartData);
  const chartLoading = useSelector(selectRevenueChartLoading);
  const range = useSelector(selectChartRange);

  const displayChart = useMemo(() => {
    if (chartData?.points?.length) {
      return {
        labels: chartData.points.map((point) => point.label),
        values: chartData.points.map((point) => point.revenue),
      };
    }

    if (dashboardData?.revenueChart) {
      return {
        labels: dashboardData.revenueChart.labels,
        values: dashboardData.revenueChart.values,
      };
    }

    return { labels: [], values: [] };
  }, [chartData, dashboardData]);

  const onRangeChange = useCallback(
    (nextRange) => {
      dispatch(setChartRange(nextRange));
      dispatch(fetchRevenueChart({ range: nextRange }));
    },
    [dispatch],
  );

  return {
    labels: displayChart.labels,
    values: displayChart.values,
    range,
    chartLoading,
    onRangeChange,
  };
};

export default useRevenueChart;
