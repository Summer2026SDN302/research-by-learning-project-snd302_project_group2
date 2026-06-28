import { PAYMENT_METHOD_LABELS } from "../constants/analyticsConstants";
import { formatCurrency } from "@/utils/formatters";
import DashboardSkeleton from "./DashboardSkeleton";

const OrderStatisticsPanel = ({ data, loading = false }) => {
  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return null;
  }

  const maxStatusCount = Math.max(
    ...(data.byStatus?.map((row) => row.count) ?? [1]),
    1,
  );

  return (
    <div className="bg-surface rounded-xl border border-outline-variant shadow-soft p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h3 className="text-headline-sm font-bold text-on-surface">
          Thống Kê Đơn Hàng
        </h3>
        <div className="flex items-center gap-3 text-body-sm">
          <span className="text-on-surface-variant">
            Tỷ lệ thành công:{" "}
            <strong className="text-secondary">{data.payments?.successRate ?? 0}%</strong>
          </span>
          {(data.payments?.pendingCount ?? 0) > 0 && (
            <span className="text-error font-semibold">
              {data.payments.pendingCount} giao dịch chờ
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-3">
            Theo trạng thái
          </p>
          <div className="space-y-3">
            {(data.byStatus ?? []).map((row) => (
              <div key={row.status}>
                <div className="flex justify-between text-body-sm mb-1">
                  <span className="text-on-surface">{row.status}</span>
                  <span className="font-semibold">{row.count}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-container overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(row.count / maxStatusCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-3">
            Theo phương thức thanh toán
          </p>
          <div className="space-y-3">
            {(data.byPaymentMethod ?? []).map((row) => (
              <div
                key={row.method}
                className="flex items-center justify-between rounded-lg border border-outline-variant px-4 py-3"
              >
                <span className="text-body-sm text-on-surface">
                  {PAYMENT_METHOD_LABELS[row.method] ?? row.method}
                </span>
                <div className="text-right">
                  <p className="text-label-md font-bold">{row.count} GD</p>
                  <p className="text-body-sm text-on-surface-variant">
                    {formatCurrency(row.amount)}
                  </p>
                </div>
              </div>
            ))}
            {(data.byPaymentMethod ?? []).length === 0 && (
              <p className="text-body-sm text-on-surface-variant">
                Chưa có dữ liệu thanh toán.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatisticsPanel;
