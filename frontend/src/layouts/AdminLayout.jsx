import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, Navbar, UserDropdown, ToastContainer, useToast } from '../components/common';

const MOCK_USER = { name: 'Admin User', initials: 'A', email: 'admin@stallbox.com', role: 'admin' };

const AdminLayout = () => {
  const [activePath, setActivePath] = useState('/admin/dashboard');
  const { toasts, showToast, removeToast } = useToast();

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        role="admin"
        activePath={activePath}
        onNavigate={setActivePath}
        user={MOCK_USER}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          searchPlaceholder="Search system..."
          user={MOCK_USER}
          notifications={3}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-8">
          {/* Pass showToast down via context or props as needed */}
          <Outlet context={{ showToast }} />
        </main>
      </div>

      {/* Toast */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default AdminLayout;
