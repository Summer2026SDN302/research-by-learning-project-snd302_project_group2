import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar, Navbar, ToastContainer, useToast } from "../components/common";

const MOCK_USER = {
  name: "Admin User",
  initials: "A",
  email: "admin@stallbox.com",
  role: "admin",
};

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar
        role="admin"
        activePath={location.pathname}
        onNavigate={navigate}
        user={MOCK_USER}
      />

      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        <Navbar
          searchPlaceholder="Search system..."
          user={MOCK_USER}
          notifications={3}
        />

        <main className="flex-1 overflow-y-auto bg-background p-8">
          <Outlet context={{ showToast }} />
        </main>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default AdminLayout;
