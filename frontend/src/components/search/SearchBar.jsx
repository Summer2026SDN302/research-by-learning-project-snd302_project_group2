import { useState } from "react";

/**
 * SearchBar
 *
 * Props:
 *   placeholder {string}
 *   value       {string}      – controlled value (optional)
 *   onChange    {fn}          – (value: string) => void
 *   onClear     {fn}
 *   className   {string}
 */

const noop = () => {};

const SearchBar = ({
  placeholder = "Tìm kiếm...",
  value: controlledValue,
  onChange = noop,
  onClear,
  className = "",
}) => {
  const [internalValue, setInternalValue] = useState("");
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (e) => {
    if (controlledValue === undefined) setInternalValue(e.target.value);
    onChange(e.target.value);
  };

  const handleClear = () => {
    if (controlledValue === undefined) setInternalValue("");
    onChange("");
    onClear?.();
  };

  return (
    <div className={`relative ${className}`}>
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-10 text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
          aria-label="Clear search"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      )}
    </div>
  );
};

export default SearchBar;
