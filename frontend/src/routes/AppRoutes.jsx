import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";

import AdminRoutes from "./AdminRoutes";
import ManagerRoutes from "./ManagerRoutes";
import StaffRoutes from "./StaffRoutes";
import LoadingOverlay from "../components/feedback/LoadingOverlay";
import useAuthSession from "../modules/auth/hooks/useAuthSession";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import {
  BACKEND_ROLES,
  getRoleHomePath,
} from "../modules/auth/constants/authConstants";

const LoginPage = lazy(() => import("../modules/auth/pages/LoginPage"));
const ForgotPasswordPage = lazy(
  () => import("../modules/auth/pages/ForgotPasswordPage"),
);

const RootRedirect = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getRoleHomePath(user?.role)} replace />;
};

const AppRoutes = () => {
  const { isBootstrapped } = useAuthSession();

  if (!isBootstrapped) {
    return (
      <LoadingOverlay show fullPage message="Đang khởi tạo phiên làm việc..." />
    );
  }

  return (
    <Suspense fallback={<LoadingOverlay show fullPage />}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={[BACKEND_ROLES.ADMIN]} />}>
            {AdminRoutes()}
          </Route>

          <Route element={<RoleRoute allowedRoles={[BACKEND_ROLES.MANAGER]} />}>
            {ManagerRoutes()}
          </Route>

          <Route element={<RoleRoute allowedRoles={[BACKEND_ROLES.STAFF]} />}>
            {StaffRoutes()}
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
