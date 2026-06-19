import { CATEGORY_PRESETS } from "../../constants/categoryConstants";

const CategoryIconPicker = ({ value, onChange }) => (
  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-3 bg-surface-container-low rounded-lg border border-outline-variant">
    {CATEGORY_PRESETS.map(([label, icon]) => {
      const selected = value === icon;
      return (
        <button
          key={icon}
          type="button"
          onClick={() => onChange(icon)}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
            selected
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface-container-lowest border-outline-variant hover:border-primary text-on-surface-variant"
          }`}
          aria-label={label}
          aria-pressed={selected}
        >
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
          <span className="text-[10px] font-semibold leading-tight text-center line-clamp-2">
            {label}
          </span>
        </button>
      );
    })}
  </div>
);

export default CategoryIconPicker;
