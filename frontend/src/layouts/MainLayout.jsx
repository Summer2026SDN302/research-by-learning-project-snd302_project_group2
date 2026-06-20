import { Outlet } from "react-router-dom";
import useMainLayout from "../hooks/useMainLayout";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import useLogout from "../modules/auth/hooks/useLogout";

const noop = () => {};

const MainLayout = ({ role }) => {
  const { activePath, navigate, user, collapsed, toggle, sidebarWidth } =
    useMainLayout();

  const { logout } = useLogout();

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar – collapsible, width driven by sidebarWidth from useSidebar */}
      <Sidebar
        role={role}
        activePath={activePath}
        onNavigate={navigate}
        user={user}
        collapsed={collapsed}
        onToggleCollapse={toggle}
        className={`${sidebarWidth} transition-all duration-300`}
      />

      {/* Main area – flex-1 fills remaining space next to sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Navbar – sticky top, manages its own dropdown state internally */}
        <Navbar
          user={user}
          searchPlaceholder="Tìm kiếm..."
          onSearch={noop}
          notifications={0}
          notificationItems={[]}
          onReadNotification={noop}
          onReadAllNotifications={noop}
          onProfile={() => navigate(`/${role}/profile`)}
          onChangePassword={() => navigate(`/${role}/change-password`)}
          onSettings={noop}
          onLogout={logout}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;