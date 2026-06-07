import { Route } from "react-router-dom";
import CategoryListPage from "../modules/menu/pages/CategoryListPage";

const AdminRoutes = (
  <>
    <Route path="categories" element={<CategoryListPage />} />
  </>
);

export default AdminRoutes;
