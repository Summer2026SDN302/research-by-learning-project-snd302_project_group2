import { useCallback, useEffect, useState } from "react";
import { getStaffDashboardSummary } from "../api/analyticsApi";

const useStaffDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await getStaffDashboardSummary();
      setData(summary);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const summary = await getStaffDashboardSummary();
        if (active) {
          setData(summary);
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || "Không thể tải dữ liệu dashboard");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => {
      active = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refresh,
  };
};

export default useStaffDashboard;
