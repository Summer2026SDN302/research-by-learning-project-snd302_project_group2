import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useSidebar from "./useSideBar";
import { getInitials } from "../utils/formatters";

const formatLayoutUser = (user) => {
  if (!user) {
    return {
      name: "Người dùng",
      initials: "U",
      email: "",
      role: "",
    };
  }

  const name = user.fullName || user.username || "Người dùng";

  return {
    name,
    initials: getInitials(name),
    email: user.email || "",
    role: user.role || "",
  };
};

const useMainLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const authUser = useSelector((state) => state.auth.user);

  const user = useMemo(() => formatLayoutUser(authUser), [authUser]);

  const { collapsed, toggle, sidebarWidth } = useSidebar();

  return {
    activePath: pathname,
    navigate,
    user,
    collapsed,
    toggle,
    sidebarWidth,
  };
};

export default useMainLayout;