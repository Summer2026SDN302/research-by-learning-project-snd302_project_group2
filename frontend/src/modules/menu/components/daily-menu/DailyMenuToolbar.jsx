import SearchBar from "../../../../components/search/SearchBar";
import FilterBar from "../../../../components/search/FilterBar";
import { DAILY_MENU_ITEM_STATUS_OPTIONS } from "../../constants/dailyMenuConstants";

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
  hasMenu,
}) => {
  const filters = [
    {
      key: "status",
      label: "Trạng thái",
      options: DAILY_MENU_ITEM_STATUS_OPTIONS,
    },
  ];

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
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

      {/* Search + Filter (only when menu exists) */}
      {hasMenu && (
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar
            placeholder="Tìm món ăn..."
            value={searchTerm}
            onChange={onSearch}
            className="min-w-[240px] flex-1"
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
