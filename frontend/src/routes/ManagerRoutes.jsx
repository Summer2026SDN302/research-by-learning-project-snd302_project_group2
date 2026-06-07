import { Route } from "react-router-dom";
import { lazy } from "react";
import MainLayout from "../layouts/MainLayout";

/**
 * managerRoutes
 *
 * Route definitions for the Manager role.
 * All routes are nested under /manager and share MainLayout with role="manager".
 *
 * Pages:
 *   /manager/dashboard        – Tổng quan
 *   /manager/daily-menu       – Thực đơn hôm nay
 *   /manager/scheduled-menu   – Thực đơn theo lịch
 *   /manager/pricing          – Định giá linh hoạt
 *   /manager/ai               – Tối ưu hoá AI
 *   /manager/create-order     – Tạo đơn hàng
 *   /manager/orders           – Danh sách đơn hàng
 *   /manager/revenue          – Doanh thu & Bán hàng
 */

// const ManagerDashboard = lazy(() => import("../modules/manager/pages/ManagerDashboard"));

const managerRoutes = (
  <Route path="/manager" element={<MainLayout role="manager" />}>
    {/* <Route path="dashboard"      element={<ManagerDashboard />} />
    <Route path="daily-menu"     element={<DailyMenu />} />
    <Route path="scheduled-menu" element={<ScheduledMenu />} />
    <Route path="ai"             element={<AIOptimization />} />
    <Route path="create-order"   element={<CreateOrder />} />
    <Route path="orders"         element={<OrderList />} /> */}
  </Route>
);

export default managerRoutes;
