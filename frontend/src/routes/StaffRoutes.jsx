import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";

import PlaceholderPage from "../components/feedback/PlaceholderPage";
import MainLayout from "../layouts/MainLayout";

const ProfilePage = lazy(() => import("../modules/user/pages/ProfilePage"));
const ChangePasswordPage = lazy(
  () => import("../modules/user/pages/ChangePasswordPage"),
);
const PosPage = lazy(() => import("../modules/order/pages/PosPage"));
const OwnOrderHistoryPage = lazy(
  () => import("../modules/order/pages/OwnOrderHistoryPage"),
);

const StaffRoutes = () => (
  <Route path="/staff" element={<MainLayout role="staff" />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route
      path="dashboard"
      element={<PlaceholderPage title="Tổng quan Staff" />}
    />
    <Route path="pos" element={<PosPage role="staff" />} />
    <Route path="receipts/:paymentId" element={<StaffReceiptPage />} />
    <Route path="pos" element={<PosPage role="staff" />} />
    <Route path="my-orders" element={<OwnOrderHistoryPage />} />
    <Route path="profile" element={<ProfilePage />} />
    <Route path="change-password" element={<ChangePasswordPage />} />
  </Route>
);

export default StaffRoutes;
