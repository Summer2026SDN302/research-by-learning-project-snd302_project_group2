import SearchBar from "../../../components/common/SearchBar";

const CategorySearchBar = ({ value, onChange }) => (
  <div className="mb-6 max-w-md">
    <SearchBar
      placeholder="Tìm kiếm danh mục..."
      value={value}
      onChange={onChange}
    />
  </div>
);

export default CategorySearchBar;
