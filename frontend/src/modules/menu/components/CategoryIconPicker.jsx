import { CATEGORY_ICONS } from "../constants/categoryConstants";

const CategoryIconPicker = ({ value, onChange }) => (
  <div className="grid grid-cols-5 sm:grid-cols-9 gap-2 p-3 bg-surface-container-low rounded-lg border border-outline-variant">
    {CATEGORY_ICONS.map((icon) => {
      const selected = value === icon;
      return (
        <button
          key={icon}
          type="button"
          onClick={() => onChange(icon)}
          className={`p-2.5 rounded-lg border transition-all flex items-center justify-center ${
            selected
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface-container-lowest border-outline-variant hover:border-primary text-on-surface-variant"
          }`}
          aria-label={icon}
          aria-pressed={selected}
        >
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </button>
      );
    })}
  </div>
);

export default CategoryIconPicker;
