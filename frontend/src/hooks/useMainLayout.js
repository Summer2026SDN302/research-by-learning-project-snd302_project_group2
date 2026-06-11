import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useSidebar from "./useSideBar";

/**
 * useMainLayout
 *
 * Shared hook for Admin, Manager and Staff layouts.
 * Provides routing state, user data from Redux, and sidebar collapse logic.
 *
 * @returns {object}
 *   activePath   {string}   – current route pathname (synced with React Router)
 *   navigate     {fn}       – React Router navigate function
 *   user         {object}   – current user from Redux auth state
 *   collapsed    {boolean}  – sidebar collapsed state
 *   toggle       {fn}       – () => void  toggle sidebar collapse
 *   sidebarWidth {string}   – Tailwind width class for sidebar
 *   marginLeft   {string}   – Tailwind margin class for main content area
 */
const useMainLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  /** Get current user from Redux auth state */
  const user = useSelector((state) => state.auth.user);

  const { collapsed, toggle, sidebarWidth, marginLeft } = useSidebar();

  return {
    activePath: pathname,
    navigate,
    user,
    collapsed,
    toggle,
    sidebarWidth,
    marginLeft,
  };
};

export default useMainLayout;
