import { useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import useStaffDashboard from "../hooks/useStaffDashboard";
import StatisticCard from "../../../components/data-display/StatisticCard";
import DashboardSkeleton from "../components/DashboardSkeleton";
import EmptyState from "../../../components/data-display/EmptyState";

const StaffDashboardPage = () => {
  const { data, loading, error, refresh } = useStaffDashboard();

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <header className="flex justify-between items-center">
          <div className="h-8 w-48 bg-outline-variant animate-pulse rounded" />
          <div className="h-10 w-10 bg-outline-variant animate-pulse rounded-full" />
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardSkeleton />
          <DashboardSkeleton />
          <DashboardSkeleton />
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <EmptyState
        icon="error"
        title="Không thể tải dashboard"
        message={error}
        action={
          <button
            type="button"
            onClick={refresh}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold"
          >
            Thử lại
          </button>
        }
      />
    );
  }

  const { orders = {}, menu = {}, topFoods = [] } = data || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">
            Tổng quan hoạt động
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            {(() => {
              const formatted = dayjs()
                .locale("vi")
                .format("dddd, [ngày] D [tháng] M, YYYY");
              return formatted.charAt(0).toUpperCase() + formatted.slice(1);
            })()}
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="p-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center"
          aria-label="Làm mới dữ liệu"
        >
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </header>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatisticCard
          icon="payments"
          label="Đơn hàng chờ thanh toán"
          value={`${orders.pending ?? 0} đơn`}
          variant="secondary"
          change=""
        />
        <StatisticCard
          icon="check_circle"
          label="Đơn hoàn thành hôm nay"
          value={`${orders.completedToday ?? 0} đơn`}
          variant="tertiary"
          change=""
        />
        <StatisticCard
          icon="restaurant_menu"
          label="Thực đơn hôm nay"
          value={`${menu.active ?? 0} món`}
          changeSuffix="đang phục vụ"
          change={menu.soldOut > 0 ? `-${menu.soldOut} món đã hết` : ""}
          variant={menu.soldOut > 0 ? "error" : "primary"}
        />
      </div>

      {/* Main Grid: Top Selling and Operational Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top selling foods */}
        <div className="bg-surface rounded-xl border border-outline-variant shadow-soft p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-headline-sm font-bold text-on-surface">
              Món ăn bán chạy hôm nay
            </h3>
            <span className="material-symbols-outlined text-on-surface-variant">
              trending_up
            </span>
          </div>

          {topFoods.length === 0 ? (
            <EmptyState
              compact
              icon="local_dining"
              title="Chưa có món bán chạy"
              message="Đang đợi đơn hàng đầu tiên của ngày hôm nay."
            />
          ) : (
            <div className="divide-y divide-outline-variant">
              {topFoods.map((item, index) => (
                <div
                  key={item.foodItemId}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-title-medium font-bold text-primary w-6">
                      #{index + 1}
                    </span>
                    <span className="text-body-md font-medium text-on-surface">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-title-medium font-bold text-on-surface-variant">
                    {item.quantity} phần
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Operational Guidelines & Quick Links */}
        <div className="bg-surface rounded-xl border border-outline-variant shadow-soft p-6 space-y-6">
          <h3 className="text-headline-sm font-bold text-on-surface">
            Nhiệm vụ hàng ngày
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-primary mt-0.5">
                task_alt
              </span>
              <div>
                <p className="text-body-md font-semibold text-on-surface">
                  Gọi món và thanh toán tại quầy
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  Sử dụng màn hình POS để hỗ trợ khách hàng gọi món và thực hiện thanh toán trực tiếp tại quầy.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-primary mt-0.5">
                task_alt
              </span>
              <div>
                <p className="text-body-md font-semibold text-on-surface">
                  Theo dõi và phục vụ đơn hàng
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  Kiểm tra danh sách đơn hàng đã nhận trong phần &quot;Đơn hàng của tôi&quot; để bàn giao chính xác cho khách.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-primary mt-0.5">
                task_alt
              </span>
              <div>
                <p className="text-body-md font-semibold text-on-surface">
                  Báo cáo cập nhật thực đơn
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  Thông báo hoặc phối hợp với Canteen Manager để cập nhật kịp thời các món ăn hết hàng trong ngày.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboardPage;
