import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { getRoleHomePath } from "../modules/auth/constants/authConstants";

const RoleRoute = ({ allowedRoles = [] }) => {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;