import SearchBar from '../../../components/common/SearchBar';

const FoodItemSearchBar = ({ value, onChange }) => (
  <SearchBar
    placeholder="Tìm kiếm món ăn..."
    value={value}
    onChange={onChange}
    className="w-full max-w-md"
  />
);

export default FoodItemSearchBar;
