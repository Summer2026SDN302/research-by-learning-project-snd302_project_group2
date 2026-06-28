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
const OrderListPage = lazy(() => import("../modules/order/pages/OrderListPage"));
const PaymentListPage = lazy(
  () => import("../modules/payment/pages/PaymentListPage"),
);
const AdminReceiptPage = lazy(
  () => import("../modules/invoice/pages/AdminReceiptPage"),
);

const AdminRoutes = () => (
  <Route path="/admin" element={<MainLayout role="admin" />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<PlaceholderPage title="Tong quan Admin" />} />
    <Route path="users" element={<UserManagementPage />} />
    <Route
      path="categories"
      element={<CategoryListPage title="Danh muc mon an" />}
    />
    <Route path="food-items" element={<FoodItemListPage title="Mon an" />} />
    <Route path="scheduled-menu" element={<ScheduledMenuPage />} />
    <Route path="daily-menu" element={<DailyMenuPage />} />
    <Route path="orders" element={<OrderListPage />} />
    <Route path="payments" element={<PaymentListPage />} />
    <Route path="receipts/:paymentId" element={<AdminReceiptPage />} />
    <Route path="ai" element={<PlaceholderPage title="Phan tich va du bao" />} />
    <Route path="profile" element={<ProfilePage />} />
    <Route path="change-password" element={<ChangePasswordPage />} />
  </Route>
);

export default AdminRoutes;
