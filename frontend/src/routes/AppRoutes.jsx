import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AdminRoutes from "./AdminRoutes";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="categories" replace />} />
          {AdminRoutes}
        </Route>
        <Route path="/" element={<Navigate to="/admin/categories" replace />} />
        <Route path="*" element={<Navigate to="/admin/categories" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
