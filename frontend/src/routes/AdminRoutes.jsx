import { Route } from 'react-router-dom';
import { lazy } from 'react';
import MainLayout from "../layouts/MainLayout";

/**
 * adminRoutes
 *
 * Route definitions for the Admin role.
 * All routes are nested under /admin and share MainLayout with role="admin".
 *
 * Pages:
 *   /admin/dashboard        – Tổng quan
 *   /admin/users            – Quản lý người dùng
 *   /admin/categories       – Danh mục món ăn
 *   /admin/food-items       – Món ăn
 *   /admin/daily-menu       – Thực đơn hôm nay
 *   /admin/scheduled-menu   – Thực đơn theo lịch
 *   /admin/orders           – Danh sách đơn hàng
 *   /admin/payments         – Danh sách thanh toán
 *   /admin/ai               – Tối ưu hoá AI
 */

// const AdminDashboard = lazy(() => import('../modules/admin/pages/AdminDashboard'));


const adminRoutes = (
  <Route path="/admin" element={<MainLayout role="admin" />}>
    {/* <Route path="dashboard"      element={<AdminDashboard />} />
    <Route path="users"          element={<UserManagement />} />
    <Route path="categories"     element={<FoodCategories />} />
    <Route path="food-items"     element={<FoodItems />} />
    <Route path="daily-menu"     element={<DailyMenu />} />
    <Route path="scheduled-menu" element={<ScheduledMenu />} />
    <Route path="orders"         element={<OrderList />} />
    <Route path="payments"       element={<PaymentList />} />
    <Route path="ai"             element={<AIOptimization />} /> */}
  </Route>
);

export default adminRoutes;