import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useSidebar from "./useSideBar";

const getInitials = (name = "") => {
  const words = String(name).trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "U";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();

  return `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase();
};

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