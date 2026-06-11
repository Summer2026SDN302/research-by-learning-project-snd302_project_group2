import { Route } from "react-router-dom";
import { lazy } from "react";
import MainLayout from "../layouts/MainLayout";

/**
 * staffRoutes
 *
 * Route definitions for the Staff role.
 * All routes are nested under /staff and share MainLayout.
 *
 * Pages:
 *   /staff/dashboard  – Tổng quan
 *   /staff/pos        – Bán hàng tại quầy
 *   /staff/my-orders  – Đơn hàng của tôi
 */

// const StaffDashboard = lazy(() => import('../modules/staff/pages/StaffDashboard'));

const staffRoutes = (
  <Route path="/staff" element={<MainLayout role="staff" />}>
    {/* <Route path="dashboard" element={<StaffDashboard />} />
    <Route path="pos"       element={<PointOfSale />} />
    <Route path="my-orders" element={<MyOrders />} /> */}
  </Route>
);

export default staffRoutes;
