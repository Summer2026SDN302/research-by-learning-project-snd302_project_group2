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
    <Route path="profile" element={<PlaceholderPage title="Hồ sơ cá nhân" />} />
    <Route path="change-password" element={<PlaceholderPage title="Đổi mật khẩu" />} />
  </Route>
);

export default ManagerRoutes;