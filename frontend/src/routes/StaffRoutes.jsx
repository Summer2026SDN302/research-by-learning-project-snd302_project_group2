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

const StaffRoutes = () => (
  <Route path="/staff" element={<MainLayout role="staff" />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<PlaceholderPage title="Tổng quan Staff" />} />
    <Route path="pos" element={<PlaceholderPage title="POS" />} />
    <Route path="my-orders" element={<PlaceholderPage title="Đơn hàng của tôi" />} />
    <Route path="profile" element={<PlaceholderPage title="Hồ sơ cá nhân" />} />
    <Route path="change-password" element={<PlaceholderPage title="Đổi mật khẩu" />} />
  </Route>
);

export default StaffRoutes;