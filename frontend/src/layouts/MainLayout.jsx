import { Outlet } from "react-router-dom";
import useMainLayout from "../hooks/useMainLayout";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import ToastContainer from "../components/feedback/ToastContainer";

/**
 * MainLayout
 *
 * Shared layout for Admin, Manager and Staff roles.
 * Structure: collapsible Sidebar (left) + Navbar (top right) + main content.
 * ToastContainer is mounted here — reads from Redux, renders at top-right.
 *
 * Props:
 *   role  {string}  – 'admin' | 'manager' | 'staff'  passed from route definition
 */

/** Placeholder — replace with actual Redux actions when auth module is ready */
const noop = () => {};

const MainLayout = ({ role }) => {
  const { activePath, navigate, user, collapsed, toggle, sidebarWidth } =
    useMainLayout();

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
          onProfile={noop}
          onChangePassword={noop}
          onSettings={noop}
          onLogout={noop}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background p-8">
          <Outlet />
        </main>
      </div>

      {/* Toast – fixed top-right, reads from Redux store */}
      <ToastContainer />
    </div>
  );
};

export default MainLayout;
