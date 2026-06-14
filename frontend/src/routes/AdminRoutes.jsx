import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";

import PlaceholderPage from "../components/feedback/PlaceholderPage";
import MainLayout from "../layouts/MainLayout";

const ProfilePage = lazy(() => import("../modules/user/pages/ProfilePage"));
const ChangePasswordPage = lazy(() => import("../modules/user/pages/ChangePasswordPage"));
const UserManagementPage = lazy(() => import("../modules/user/pages/UserManagementPage"));

const AdminRoutes = () => (
  <Route path="/admin" element={<MainLayout role="admin" />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<PlaceholderPage title="Tổng quan Admin" />} />
    <Route path="users" element={<UserManagementPage />} />
    <Route path="categories" element={<PlaceholderPage title="Danh mục món ăn" />} />
    <Route path="food-items" element={<PlaceholderPage title="Món ăn" />} />
    <Route path="scheduled-menu" element={<PlaceholderPage title="Thực đơn theo lịch" />} />
    <Route path="daily-menu" element={<PlaceholderPage title="Thực đơn hôm nay" />} />
    <Route path="orders" element={<PlaceholderPage title="Đơn hàng" />} />
    <Route path="payments" element={<PlaceholderPage title="Thanh toán" />} />
    <Route path="ai" element={<PlaceholderPage title="Phân tích & Dự báo" />} />
    <Route path="profile" element={<ProfilePage />} />
    <Route path="change-password" element={<ChangePasswordPage />} />
  </Route>
);

export default AdminRoutes;
