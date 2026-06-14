import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { getRoleHomePath } from "../modules/auth/constants/authConstants";

const PublicRoute = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to={getRoleHomePath(user?.role)} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;