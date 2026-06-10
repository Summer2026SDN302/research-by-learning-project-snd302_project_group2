import { Route } from "react-router-dom";
import CategoryListPage from "../modules/menu/pages/CategoryListPage";
import FoodItemListPage from "../modules/menu/pages/FoodItemListPage";

const AdminRoutes = (
  <>
    <Route path="categories" element={<CategoryListPage />} />
    <Route path="food-items" element={<FoodItemListPage />} />
  </>
);

export default AdminRoutes;
