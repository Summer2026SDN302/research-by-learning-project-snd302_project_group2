import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingOverlay from "../components/feedback/LoadingOverlay";

const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated, isBootstrapped } = useSelector(
    (state) => state.auth,
  );

  if (!isBootstrapped) {
    return (
      <LoadingOverlay
        show
        fullPage
        message="Đang kiểm tra phiên đăng nhập..."
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;