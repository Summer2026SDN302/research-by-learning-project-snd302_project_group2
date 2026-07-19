import dayjs from "dayjs";
import StatusBadge from "../../../components/data-display/StatusBadge";
import EmptyState from "../../../components/data-display/EmptyState";
import DashboardSkeleton from "./DashboardSkeleton";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_BADGE,
  PAYMENT_STATUS_LABELS,
} from "../constants/analyticsConstants";
import { formatCurrency } from "@/utils/formatters";

const RecentTransactionsList = ({
  items = [],
  loading = false,
  title = "Lịch sử giao dịch",
  limit,
}) => {
  if (loading) {
    return (
      <div className="bg-surface rounded-xl border border-outline-variant shadow-soft p-6 space-y-4">
        <h3 className="text-headline-sm font-bold text-on-surface mb-6">
          {title}
        </h3>
        <DashboardSkeleton />
        <DashboardSkeleton />
      </div>
    );
  }

  const displayItems = limit ? items.slice(0, limit) : items;

  return (
    <div className="bg-surface rounded-xl border border-outline-variant shadow-soft p-6 flex flex-col h-full">
      <h3 className="text-headline-sm font-bold text-on-surface mb-6">
        {title}
      </h3>

      {displayItems.length === 0 ? (
        <EmptyState
          compact
          icon="payments"
          title="Chưa có giao dịch"
          message="Không có giao dịch nào phù hợp."
        />
      ) : (
        <div className="flex-1 space-y-4">
          {displayItems.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between p-3 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-white">
                    {item.paymentMethod === "Cash" ? "payments" : "credit_card"}
                  </span>
                </div>
                <div>
                  <h4 className="text-label-md font-bold text-on-surface">
                    {item.paymentNumber}
                  </h4>
                  <p className="text-body-sm text-on-surface-variant">
                    {PAYMENT_METHOD_LABELS[item.paymentMethod] ??
                      item.paymentMethod}{" "}
                    •{" "}
                    {dayjs(item.paidAt || item.createdAt).format(
                      "HH:mm:ss DD/MM/YYYY",
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="font-bold text-on-surface text-label-md">
                  {formatCurrency(item.finalAmount)}
                </span>
                <StatusBadge
                  status={PAYMENT_STATUS_BADGE[item.paymentStatus] ?? "pending"}
                  label={
                    PAYMENT_STATUS_LABELS[item.paymentStatus] ??
                    item.paymentStatus
                  }
                  size="sm"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentTransactionsList;
