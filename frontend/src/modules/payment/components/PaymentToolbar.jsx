import SearchBar from "@/components/search/SearchBar";
import FilterBar from "@/components/search/FilterBar";
import {
  STATUS_FILTERS,
  PAYMENT_METHOD_OPTIONS,
} from "../constants/paymentConstants";

/**
 * PaymentToolbar
 *
 * Renders search bar and filters.
 */
const PaymentToolbar = ({
  filters,
  searchInput,
  onSearchInputChange,
  onClearSearch,
  onFilterChange,
}) => {
  const filterConfig = [
    {
      key: "paymentStatus",
      label: "Trạng thái",
      options: STATUS_FILTERS.map((opt) => ({
        value: opt.value,
        label: opt.value === "" ? "Tất cả trạng thái" : opt.label,
      })),
    },
    {
      key: "paymentMethod",
      label: "Phương thức",
      options: [
        { value: "", label: "Tất cả phương thức" },
        ...PAYMENT_METHOD_OPTIONS,
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Pickers */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
            calendar_today
          </span>
          <input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => onFilterChange({ startDate: e.target.value })}
            className="bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer"
            title="Từ ngày"
          />
        </div>
        <span className="text-on-surface-variant text-body-sm">đến</span>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
            calendar_today
          </span>
          <input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => onFilterChange({ endDate: e.target.value })}
            className="bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer"
            title="Đến ngày"
          />
        </div>

        <SearchBar
          placeholder="Mã thanh toán/ Mã GD/ Đơn hàng..."
          value={searchInput}
          onChange={onSearchInputChange}
          onClear={onClearSearch}
          className="min-w-[320px]"
        />

        <FilterBar
          filters={filterConfig}
          values={{
            paymentStatus: filters.paymentStatus,
            paymentMethod: filters.paymentMethod,
          }}
          onChange={(key, val) => onFilterChange({ [key]: val })}
        />
      </div>
    </div>
  );
};

export default PaymentToolbar;
