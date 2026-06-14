import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";

import PlaceholderPage from "../components/feedback/PlaceholderPage";
import MainLayout from "../layouts/MainLayout";

const ProfilePage = lazy(() => import("../modules/user/pages/ProfilePage"));
const ChangePasswordPage = lazy(() => import("../modules/user/pages/ChangePasswordPage"));

const ManagerRoutes = () => (
  <Route path="/manager" element={<MainLayout role="manager" />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<PlaceholderPage title="Tổng quan Manager" />} />
    <Route path="create-order" element={<PlaceholderPage title="POS" />} />
    <Route path="my-orders" element={<PlaceholderPage title="Đơn hàng của tôi" />} />
    <Route path="daily-menu" element={<PlaceholderPage title="Thực đơn hôm nay" />} />
    <Route path="scheduled-menu" element={<PlaceholderPage title="Thực đơn theo lịch" />} />
    <Route path="pricing" element={<PlaceholderPage title="Định giá linh hoạt" />} />
    <Route path="ai" element={<PlaceholderPage title="Tối ưu hóa AI" />} />
    <Route path="orders" element={<PlaceholderPage title="Đơn hàng" />} />
    <Route path="payments" element={<PlaceholderPage title="Thanh toán" />} />
    <Route path="profile" element={<ProfilePage />} />
    <Route path="change-password" element={<ChangePasswordPage />} />
  </Route>
);

export default ManagerRoutes;
