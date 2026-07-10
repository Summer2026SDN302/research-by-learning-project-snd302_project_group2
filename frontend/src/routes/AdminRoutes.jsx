import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";

import PlaceholderPage from "../components/feedback/PlaceholderPage";
import MainLayout from "../layouts/MainLayout";

const ProfilePage = lazy(() => import("../modules/user/pages/ProfilePage"));
const ChangePasswordPage = lazy(
  () => import("../modules/user/pages/ChangePasswordPage"),
);
const UserManagementPage = lazy(
  () => import("../modules/user/pages/UserManagementPage"),
);
const ScheduledMenuPage = lazy(
  () => import("../modules/menu/pages/ScheduledMenuPage"),
);
const CategoryListPage = lazy(
  () => import("../modules/menu/pages/CategoryListPage"),
);
const FoodItemListPage = lazy(
  () => import("../modules/menu/pages/FoodItemListPage"),
);
const DailyMenuPage = lazy(
  () => import("../modules/menu/pages/DailyMenuPage"),
);
const AiDashboardPage = lazy(
  () => import("../modules/ai/pages/AiDashboardPage"),
);

const AdminRoutes = () => (
  <Route path="/admin" element={<MainLayout role="admin" />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route
      path="dashboard"
      element={<PlaceholderPage title="Tổng quan Admin" />}
    />
    <Route path="users" element={<UserManagementPage />} />
    <Route
      path="categories"
      element={<CategoryListPage title="Danh mục món ăn" />}
    />
    <Route path="food-items" element={<FoodItemListPage title="Món ăn" />} />
    <Route path="scheduled-menu" element={<ScheduledMenuPage />} />
    <Route path="daily-menu" element={<DailyMenuPage />} />
    <Route path="orders" element={<PlaceholderPage title="Đơn hàng" />} />
    <Route path="payments" element={<PlaceholderPage title="Thanh toán" />} />
    <Route path="pricing" element={<Navigate to="../ai" replace />} />
    <Route path="ai" element={<AiDashboardPage />} />
    <Route path="profile" element={<ProfilePage />} />
    <Route path="change-password" element={<ChangePasswordPage />} />
  </Route>
);

export default AdminRoutes;
