import EmptyState from "../../../components/data-display/EmptyState";
import { formatCurrency } from "@/utils/formatters";
import DashboardSkeleton from "./DashboardSkeleton";
import SalesTrendBadge from "./SalesTrendBadge";

const TopFoodsList = ({
  items = [],
  loading = false,
  sortBy = "quantity",
  onSortByChange,
}) => {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="bg-surface rounded-xl border border-outline-variant shadow-soft p-6 flex flex-col h-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <h3 className="text-headline-sm font-bold text-on-surface">
          Món Bán Chạy Nhất
        </h3>
        {onSortByChange && (
          <div className="flex bg-surface-container-low rounded-lg p-0.5 border border-outline-variant">
            <button
              type="button"
              onClick={() => onSortByChange("quantity")}
              className={`px-2.5 py-1 text-sm font-semibold rounded-md transition-all ${
                sortBy === "quantity"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Số lượng
            </button>
            <button
              type="button"
              onClick={() => onSortByChange("revenue")}
              className={`px-2.5 py-1 text-sm font-semibold rounded-md transition-all ${
                sortBy === "revenue"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Doanh thu
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          <DashboardSkeleton />
          <DashboardSkeleton />
        </div>
      ) : safeItems.length === 0 ? (
        <EmptyState
          compact
          icon="restaurant"
          title="Chưa có dữ liệu"
          message="Chưa có đơn hàng hoàn thành."
        />
      ) : (
        <div className="flex-1 space-y-4">
          {safeItems.map((item) => (
            <div
              key={item.foodItemId ?? item.name}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-surface-variant overflow-hidden shrink-0 flex items-center justify-center">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant">
                    restaurant
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-label-md font-bold text-on-surface truncate">
                  {item.name}
                </h4>
                <p className="text-body-sm text-on-surface-variant">
                  {item.quantity} phần
                </p>
              </div>
              <div className="text-right">
                <p className="text-label-md font-bold text-on-surface">
                  {formatCurrency(item.revenue)}
                </p>
                <SalesTrendBadge value={item.changePercent} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopFoodsList;
