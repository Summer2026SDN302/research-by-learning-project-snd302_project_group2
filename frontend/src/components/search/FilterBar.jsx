/**
 * FilterBar
 *
 * Props:
 *   filters   {Array<{key, label, options: [{value, label}]}>}
 *   values    {object}  – { [key]: selectedValue }
 *   onChange  {fn}      – (key, value) => void
 *   onReset   {fn}
 */
const MOCK_FILTERS = [
  {
    key: 'role',
    label: 'Vai trò',
    options: [
      { value: '', label: 'Tất cả vai trò' },
      { value: 'admin', label: 'Admin' },
      { value: 'manager', label: 'Manager' },
      { value: 'staff', label: 'Staff' },
    ],
  },
  {
    key: 'status',
    label: 'Trạng thái',
    options: [
      { value: '', label: 'Tất cả trạng thái' },
      { value: 'active', label: 'Đang hoạt động' },
      { value: 'inactive', label: 'Tạm khóa' },
    ],
  },
];

const noop = () => {};

const FilterBar = ({
  filters = MOCK_FILTERS,
  values = {},
  onChange = noop,
  onReset,
}) => {
  const hasActiveFilters = Object.values(values).some(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {filters.map((filter) => (
        <div key={filter.key} className="relative">
          <select
            value={values[filter.key] ?? ''}
            onChange={(e) => onChange(filter.key, e.target.value)}
            className="appearance-none bg-surface-container-low border border-outline-variant rounded-lg pl-3 pr-8 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer"
          >
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none">
            expand_more
          </span>
        </div>
      ))}

      {/* Reset Button */}
      {hasActiveFilters && onReset && (
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-3 py-2 text-body-sm text-error border border-error/30 rounded-lg hover:bg-error-container/20 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
          Reset
        </button>
      )}
    </div>
  );
};

export default FilterBar;
