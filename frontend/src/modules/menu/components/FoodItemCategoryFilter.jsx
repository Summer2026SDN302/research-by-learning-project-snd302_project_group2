const FoodItemCategoryFilter = ({
  value = '',
  options = [],
  onChange = () => {},
  isLoading = false,
  isEmpty = false,
}) => (
  <div className="flex items-center gap-2">
    <label htmlFor="food-item-category-filter" className="text-label-md font-semibold text-on-surface-variant shrink-0">
      Danh mục:
    </label>
    <div className="relative">
      <select
        id="food-item-category-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading || isEmpty}
        className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-md pl-3 pr-8 py-1.5 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container min-w-[160px] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <option value="">Tất cả danh mục</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none">
        expand_more
      </span>
    </div>
    {isEmpty && (
      <span className="text-[11px] text-on-surface-variant hidden sm:inline">
        Chưa có danh mục
      </span>
    )}
  </div>
);

export default FoodItemCategoryFilter;
