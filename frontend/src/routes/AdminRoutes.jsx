import { Navigate, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

const PlaceholderPage = ({ title, description }) => {
  return (
    <section className="card">
      <h1 className="text-headline-md text-on-surface font-bold">{title}</h1>
      <p className="text-body-md text-on-surface-variant mt-2">
        {description || "Trang này sẽ được nối UI và API ở bước tiếp theo."}
      </p>
    </section>
  );
};

const AdminRoutes = () => (
  <Route path="/admin" element={<MainLayout role="admin" />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<PlaceholderPage title="Tổng quan Admin" />} />
    <Route path="users" element={<PlaceholderPage title="Quản lý người dùng" />} />
    <Route path="categories" element={<PlaceholderPage title="Danh mục món ăn" />} />
    <Route path="food-items" element={<PlaceholderPage title="Món ăn" />} />
    <Route path="scheduled-menu" element={<PlaceholderPage title="Thực đơn theo lịch" />} />
    <Route path="daily-menu" element={<PlaceholderPage title="Thực đơn hôm nay" />} />
    <Route path="orders" element={<PlaceholderPage title="Đơn hàng" />} />
    <Route path="payments" element={<PlaceholderPage title="Thanh toán" />} />
    <Route path="ai" element={<PlaceholderPage title="Phân tích & Dự báo" />} />
    <Route path="profile" element={<PlaceholderPage title="Hồ sơ cá nhân" />} />
    <Route path="change-password" element={<PlaceholderPage title="Đổi mật khẩu" />} />
  </Route>
);

export default AdminRoutes;