import dayjs from "dayjs";

import DataTable from "../../../components/data-display/DataTable";
import StatusBadge from "../../../components/data-display/StatusBadge";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_BADGE,
  PAYMENT_STATUS_LABELS,
} from "../constants/analyticsConstants";
import { formatCurrency } from "@/utils/formatters";

const columns = [
  { key: "paymentNumber", label: "Mã GD", sortable: true },
  { key: "paidAt", label: "Thời gian", sortable: true },
  { key: "paymentMethod", label: "Phương thức", sortable: false },
  { key: "finalAmount", label: "Số tiền", sortable: true },
  { key: "paymentStatus", label: "Trạng thái", sortable: false },
];

const TransactionReportTable = ({ items = [], loading = false }) => (
  <DataTable
    columns={columns}
    rows={items}
    isLoading={loading}
    emptyTitle="Chưa có giao dịch"
    emptyMessage="Không có giao dịch phù hợp với bộ lọc hiện tại."
    renderCell={(key, value) => {
      if (key === "paymentNumber") {
        return <span className="font-bold text-primary">{value}</span>;
      }

      if (key === "paidAt") {
        return (
          <div>
            <div className="text-body-sm font-medium">
              {dayjs(value).format("HH:mm:ss")}
            </div>
            <div className="text-[11px] text-on-surface-variant">
              {dayjs(value).format("DD/MM/YYYY")}
            </div>
          </div>
        );
      }

      if (key === "paymentMethod") {
        return (
          <div className="flex items-center gap-2 text-body-sm">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              payments
            </span>
            <span>{PAYMENT_METHOD_LABELS[value] ?? value}</span>
          </div>
        );
      }

      if (key === "finalAmount") {
        return <span className="font-bold text-on-surface">{formatCurrency(value)}</span>;
      }

      if (key === "paymentStatus") {
        return (
          <StatusBadge
            status={PAYMENT_STATUS_BADGE[value] ?? "pending"}
            label={PAYMENT_STATUS_LABELS[value] ?? value}
            size="sm"
          />
        );
      }

      return value;
    }}
  />
);

export default TransactionReportTable;
