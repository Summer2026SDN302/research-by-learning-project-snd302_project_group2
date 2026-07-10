import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";

import PlaceholderPage from "../components/feedback/PlaceholderPage";
import MainLayout from "../layouts/MainLayout";
const ProfilePage = lazy(() => import("../modules/user/pages/ProfilePage"));
const ChangePasswordPage = lazy(
  () => import("../modules/user/pages/ChangePasswordPage"),
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

const ManagerRoutes = () => (
  <Route path="/manager" element={<MainLayout role="manager" />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route
      path="dashboard"
      element={<PlaceholderPage title="Tổng quan Manager" />}
    />
    <Route path="create-order" element={<PlaceholderPage title="POS" />} />
    <Route
      path="my-orders"
      element={<PlaceholderPage title="Đơn hàng của tôi" />}
    />
    <Route path="daily-menu" element={<DailyMenuPage />} />
    <Route
      path="scheduled-menu"
      element={<ScheduledMenuPage title="Thực đơn theo lịch" />}
    />
    <Route path="pricing" element={<Navigate to="../ai" replace />} />
    <Route path="ai" element={<AiDashboardPage />} />
    <Route path="orders" element={<PlaceholderPage title="Đơn hàng" />} />
    <Route path="payments" element={<PlaceholderPage title="Thanh toán" />} />
    <Route path="profile" element={<ProfilePage />} />
    <Route path="change-password" element={<ChangePasswordPage />} />
    <Route
      path="categories"
      element={<CategoryListPage title="Danh mục món ăn" />}
    />
    <Route path="food-items" element={<FoodItemListPage title="Món ăn" />} />
  </Route>
);

export default ManagerRoutes;
