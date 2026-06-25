/**
 * CategoryTabs
 *
 * Pill-shaped tab bar for filtering menu items by category.
 * "Tất cả" tab is always first and uses empty string as value.
 *
 * Props:
 *   categories  {Array}  – [{ id, name }]
 *   active      {string} – active category ID ("" = all)
 *   onChange     {fn}    – (categoryId: string) => void
 */
const CategoryTabs = ({ categories = [], active = "", onChange }) => {
  const tabs = [{ id: "", name: "Tất cả" }, ...categories];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((cat) => {
        const isActive = active === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange?.(cat.id)}
            className={`
              px-5 py-2.5 rounded-full text-body-sm font-semibold
              transition-all duration-200 whitespace-nowrap
              ${
                isActive
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container hover:text-on-surface"
              }
            `}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;
