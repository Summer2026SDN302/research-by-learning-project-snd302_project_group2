import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";

import PlaceholderPage from "../components/feedback/PlaceholderPage";
import MainLayout from "../layouts/MainLayout";

const ProfilePage = lazy(() => import("../modules/user/pages/ProfilePage"));
const ChangePasswordPage = lazy(() => import("../modules/user/pages/ChangePasswordPage"));
const StaffDashboardPage = lazy(() => import("../modules/analytics/pages/StaffDashboardPage"));

const StaffRoutes = () => (
  <Route path="/staff" element={<MainLayout role="staff" />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<StaffDashboardPage />} />
    <Route path="pos" element={<PlaceholderPage title="POS" />} />
    <Route path="my-orders" element={<PlaceholderPage title="Đơn hàng của tôi" />} />
    <Route path="profile" element={<ProfilePage />} />
    <Route path="change-password" element={<ChangePasswordPage />} />
  </Route>
);

export default StaffRoutes;
