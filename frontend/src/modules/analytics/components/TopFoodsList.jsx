import EmptyState from "../../../components/data-display/EmptyState";
import { formatCurrency } from "@/utils/formatters";
import DashboardSkeleton from "./DashboardSkeleton";
import SalesTrendBadge from "./SalesTrendBadge";

const TopFoodsList = ({ items = [], loading = false }) => (
  <div className="bg-surface rounded-xl border border-outline-variant shadow-soft p-6 flex flex-col h-full">
    <h3 className="text-headline-sm font-bold text-on-surface mb-6">
      Món Bán Chạy Nhất
    </h3>

    {loading ? (
      <div className="space-y-4">
        <DashboardSkeleton />
        <DashboardSkeleton />
      </div>
    ) : items.length === 0 ? (
      <EmptyState
        compact
        icon="restaurant"
        title="Chưa có dữ liệu"
        message="Chưa có đơn hàng hoàn thành."
      />
    ) : (
      <div className="flex-1 space-y-4">
        {items.map((item) => (
          <div key={item.foodItemId ?? item.name} className="flex items-center gap-4">
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

export default TopFoodsList;
