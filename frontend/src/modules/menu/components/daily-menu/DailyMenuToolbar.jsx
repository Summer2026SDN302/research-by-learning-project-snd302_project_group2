import SearchBar from "../../../../components/search/SearchBar";
import FilterBar from "../../../../components/search/FilterBar";
import { DAILY_MENU_ITEM_STATUS_OPTIONS } from "../../constants/daily-menu/dailyMenuConstants";

/**
 * DailyMenuToolbar
 *
 * Props:
 *   date             {string}
 *   onDateChange     {fn}
 *   searchTerm       {string}
 *   onSearch         {fn}
 *   statusFilter     {string}
 *   onFilterChange   {fn}
 *   onResetFilters   {fn}
 *   onGenerate       {fn}
 *   onAddItem        {fn}
 *   hasMenu          {boolean}
 *   isLoading        {boolean}
 */
const DailyMenuToolbar = ({
  date,
  onDateChange,
  searchTerm,
  onSearch,
  statusFilter,
  onFilterChange,
  onResetFilters,
  onGenerate,
  onAddItem,
  hasMenu,
  isLoading,
}) => {
  const filters = [
    {
      key: "status",
      label: "Trạng thái",
      options: DAILY_MENU_ITEM_STATUS_OPTIONS,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1: Date + Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date picker */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
            calendar_today
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action buttons */}
        {hasMenu && (
          <button
            onClick={onAddItem}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-primary/30 text-body-sm font-semibold text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              add_circle
            </span>
            Thêm món
          </button>
        )}

        {!hasMenu && (
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-body-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              auto_awesome
            </span>
            Tạo thực đơn
          </button>
        )}
      </div>

      {/* Row 2: Search + Filter (only when menu exists) */}
      {hasMenu && (
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar
            placeholder="Tìm món ăn..."
            value={searchTerm}
            onChange={onSearch}
            className="w-72"
          />
          <FilterBar
            filters={filters}
            values={{ status: statusFilter }}
            onChange={onFilterChange}
            onReset={onResetFilters}
          />
        </div>
      )}
    </div>
  );
};

export default DailyMenuToolbar;
