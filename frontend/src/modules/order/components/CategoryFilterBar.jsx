/**
 * CategoryFilterBar
 *
 * Props:
 *   categories          {Array}    - List of category objects: { _id, name }
 *   selectedCategoryId  {string}   - Active selected category ID
 *   onSelectCategory    {Function} - Callback when a category is clicked
 */
const CategoryFilterBar = ({
  categories = [],
  selectedCategoryId = "",
  onSelectCategory,
}) => {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide shrink-0">
      {/* "Tất cả" Button */}
      <button
        type="button"
        onClick={() => onSelectCategory("")}
        className={`px-6 py-2 rounded-full font-label-md text-label-md whitespace-nowrap transition-all duration-200 active:scale-95 ${
          selectedCategoryId === ""
            ? "bg-primary text-on-primary shadow-sm"
            : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:bg-surface-container"
        }`}
      >
        Tất cả
      </button>

      {/* Dynamic Category Buttons */}
      {categories.map((category) => (
        <button
          key={category._id}
          type="button"
          onClick={() => onSelectCategory(category._id)}
          className={`px-6 py-2 rounded-full font-label-md text-label-md whitespace-nowrap transition-all duration-200 active:scale-95 ${
            selectedCategoryId === category._id
              ? "bg-primary text-on-primary shadow-sm"
              : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:bg-surface-container"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilterBar;
