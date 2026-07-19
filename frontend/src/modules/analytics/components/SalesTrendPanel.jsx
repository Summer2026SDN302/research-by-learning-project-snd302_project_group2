import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSalesTrend,
  selectSalesTrendData,
  selectSalesTrendLoading,
} from "../redux/analyticsSlice";
import { formatCurrency } from "@/utils/formatters";
import DashboardSkeleton from "./DashboardSkeleton";

const SalesTrendPanel = () => {
  const dispatch = useDispatch();
  const data = useSelector(selectSalesTrendData);
  const loading = useSelector(selectSalesTrendLoading);
  const [period, setPeriod] = useState("week"); // week, month

  useEffect(() => {
    dispatch(fetchSalesTrend({ period }));
  }, [dispatch, period]);

  const periodLabel = period === "week" ? "Tuần này" : "Tháng này";
  const prevPeriodLabel = period === "week" ? "Tuần trước" : "Tháng trước";

  if (loading && !data) {
    return (
      <div className="bg-surface rounded-xl border border-outline-variant shadow-soft p-6 space-y-4">
        <DashboardSkeleton />
      </div>
    );
  }

  const currentRevenue = data?.current?.revenue ?? 0;
  const prevRevenue = data?.previous?.revenue ?? 0;
  const currentOrders = data?.current?.orderCount ?? 0;
  const prevOrders = data?.previous?.orderCount ?? 0;
  const revenueChange = data?.changes?.revenuePercent ?? 0;
  const ordersChange = data?.changes?.orderCountPercent ?? 0;

  return (
    <div className="bg-surface rounded-xl border border-outline-variant shadow-soft p-6 flex flex-col h-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-headline-sm font-bold text-on-surface">
            So Sánh Hiệu Suất Chu Kỳ
          </h3>
          <p className="text-body-sm text-on-surface-variant mt-1">
            So sánh doanh thu và đơn hàng với chu kỳ trước
          </p>
        </div>
        <div className="flex bg-surface-container-low rounded-lg p-0.5 border border-outline-variant">
          <button
            type="button"
            onClick={() => setPeriod("week")}
            className={`px-3 py-1.5 text-label-sm font-semibold rounded-md transition-all ${
              period === "week"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Tuần qua
          </button>
          <button
            type="button"
            onClick={() => setPeriod("month")}
            className={`px-3 py-1.5 text-label-sm font-semibold rounded-md transition-all ${
              period === "month"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Tháng qua
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Revenue Card */}
        <div className="p-4 rounded-xl border border-outline-variant bg-surface-container-lowest flex flex-col justify-between">
          <div>
            <span className="text-body-sm text-on-surface-variant">Doanh thu ({periodLabel})</span>
            <h4 className="text-title-lg font-bold text-on-surface mt-1">
              {formatCurrency(currentRevenue)}
            </h4>
            <p className="text-body-xs text-on-surface-variant mt-1">
              So với {formatCurrency(prevRevenue)} ({prevPeriodLabel})
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-label-md font-bold px-2 py-0.5 rounded-full ${
                revenueChange >= 0
                  ? "bg-success-container text-success"
                  : "bg-error-container text-error"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {revenueChange >= 0 ? "trending_up" : "trending_down"}
              </span>
              {revenueChange >= 0 ? "+" : ""}{revenueChange}%
            </span>
            <span className="text-body-xs text-on-surface-variant">tăng trưởng doanh thu</span>
          </div>
        </div>

        {/* Orders Card */}
        <div className="p-4 rounded-xl border border-outline-variant bg-surface-container-lowest flex flex-col justify-between">
          <div>
            <span className="text-body-sm text-on-surface-variant">Đơn hàng ({periodLabel})</span>
            <h4 className="text-title-lg font-bold text-on-surface mt-1">
              {currentOrders} đơn
            </h4>
            <p className="text-body-xs text-on-surface-variant mt-1">
              So với {prevOrders} đơn ({prevPeriodLabel})
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-label-md font-bold px-2 py-0.5 rounded-full ${
                ordersChange >= 0
                  ? "bg-success-container text-success"
                  : "bg-error-container text-error"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {ordersChange >= 0 ? "trending_up" : "trending_down"}
              </span>
              {ordersChange >= 0 ? "+" : ""}{ordersChange}%
            </span>
            <span className="text-body-xs text-on-surface-variant">tăng trưởng đơn hàng</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesTrendPanel;
