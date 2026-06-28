import StatisticCard from "../../../components/data-display/StatisticCard";
import PaginationControl from "../../../components/navigation/PaginationControl";
import ExportReportButton from "../components/ExportReportButton";
import ReportFilterBar from "../components/ReportFilterBar";
import TransactionReportTable from "../components/TransactionReportTable";
import useRevenueReport from "../hooks/useRevenueReport";
import { formatCurrency } from "@/utils/formatters";
import { formatPercent } from "../utils/formatPercent";

const RevenueReportPage = () => {
  const {
    summary,
    items,
    pagination,
    filters,
    loading,
    exportLoading,
    searchInput,
    setSearchInput,
    setStatusFilter,
    setPaymentMethod,
    setDatePreset,
    setPage,
    handleExport,
  } = useRevenueReport();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex text-label-md text-on-surface-variant mb-2">
            <span>Quản lý</span>
            <span className="mx-2 text-outline-variant">&gt;</span>
            <span className="text-primary font-bold">Báo cáo doanh thu</span>
          </nav>
          <h1 className="text-headline-lg font-bold text-on-surface">
            Báo cáo doanh thu
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Theo dõi doanh thu và lịch sử giao dịch tại quầy.
          </p>
        </div>
        <ExportReportButton onClick={handleExport} loading={exportLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatisticCard
          icon="payments"
          label="Tổng doanh thu"
          value={formatCurrency(summary?.totalRevenue ?? 0)}
          change={formatPercent(summary?.revenueChangePercent)}
          variant="primary"
        />
        <StatisticCard
          icon="check_circle"
          label="Giao dịch thành công"
          value={summary?.successCount ?? 0}
          change={
            summary?.successRate != null ? `${summary.successRate}%` : ""
          }
          changeSuffix="tỷ lệ thành công"
          variant="secondary"
        />
        <StatisticCard
          icon="schedule"
          label="Giao dịch chờ"
          value={summary?.pendingCount ?? 0}
          change={(summary?.pendingCount ?? 0) > 0 ? "Cần xử lý" : ""}
          changeSuffix=""
          variant="error"
        />
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft overflow-hidden">
        <ReportFilterBar
          filters={filters}
          searchInput={searchInput}
          onStatusChange={setStatusFilter}
          onPaymentMethodChange={setPaymentMethod}
          onDatePresetChange={setDatePreset}
          onSearchChange={setSearchInput}
        />
        <div className="p-0">
          <TransactionReportTable items={items} loading={loading} />
        </div>
        {pagination.totalPages > 1 && (
          <div className="flex justify-end p-4 border-t border-outline-variant">
            <PaginationControl
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueReportPage;
