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
}) => (
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

    <div className="ml-auto flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-body-sm text-on-surface-variant">Lọc theo:</span>
        <select
          value={filters.datePreset}
          onChange={(event) => onDatePresetChange(event.target.value)}
          className="border-outline-variant rounded-lg py-1.5 pl-3 pr-8 text-body-sm focus:border-primary focus:ring-1 focus:ring-primary bg-transparent"
        >
          {DATE_PRESET_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <select
        value={filters.paymentMethod}
        onChange={(event) => onPaymentMethodChange(event.target.value)}
        className="border-outline-variant rounded-lg py-1.5 pl-3 pr-8 text-body-sm focus:border-primary focus:ring-1 focus:ring-primary bg-transparent"
      >
        {PAYMENT_METHOD_OPTIONS.map((option) => (
          <option key={option.value || "all"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <input
        type="search"
        value={searchInput}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Tìm mã GD..."
        className="border border-outline-variant rounded-lg py-1.5 px-3 text-body-sm focus:border-primary focus:ring-1 focus:ring-primary bg-transparent min-w-[180px]"
      />
    </div>
  </div>
);

export default ReportFilterBar;
