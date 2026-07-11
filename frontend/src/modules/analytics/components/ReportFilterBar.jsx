import FilterBar from "../../../components/search/FilterBar";
import SearchBar from "../../../components/search/SearchBar";
import {
  DATE_PRESET_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  REPORT_STATUS_FILTERS,
} from "../constants/analyticsConstants";

const ReportFilterBar = ({
  filters,
  searchInput,
  onStatusChange,
  onPaymentMethodChange,
  onDatePresetChange,
  onSearchChange,
}) => {
  const filterConfigs = [
    {
      key: "datePreset",
      options: DATE_PRESET_OPTIONS,
    },
    {
      key: "paymentMethod",
      options: PAYMENT_METHOD_OPTIONS,
    },
  ];

  const filterValues = {
    datePreset: filters.datePreset,
    paymentMethod: filters.paymentMethod,
  };

  const handleFilterChange = (key, value) => {
    if (key === "datePreset") {
      onDatePresetChange(value);
    } else if (key === "paymentMethod") {
      onPaymentMethodChange(value);
    }
  };

  return (
    <div className="p-6 border-b border-outline-variant flex flex-wrap gap-4 items-center bg-surface-container-lowest">
      <div className="flex flex-wrap gap-2">
        {REPORT_STATUS_FILTERS.map((option) => (
          <button
            key={option.value || "all"}
            type="button"
            onClick={() => onStatusChange(option.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              filters.status === option.value
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <span className="text-body-sm text-on-surface-variant">Lọc theo:</span>
        <FilterBar
          filters={filterConfigs}
          values={filterValues}
          onChange={handleFilterChange}
        />
        <SearchBar
          placeholder="Tìm mã GD..."
          value={searchInput}
          onChange={onSearchChange}
          className="min-w-[180px]"
        />
      </div>
    </div>
  );
};

export default ReportFilterBar;
