import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, Navbar, ToastContainer, useToast } from '../components/common';

const MOCK_USER = { name: 'Manager User', initials: 'M', email: 'manager@stallbox.com', role: 'manager' };

const ManagerLayout = () => {
  const [activePath, setActivePath] = useState('/manager/dashboard');
  const { toasts, showToast, removeToast } = useToast();

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar
        role="manager"
        activePath={activePath}
        onNavigate={setActivePath}
        user={MOCK_USER}
      />

      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        <Navbar
          searchPlaceholder="Search..."
          user={MOCK_USER}
          notifications={0}
        />

        <main className="flex-1 overflow-y-auto bg-background p-8">
          <Outlet context={{ showToast }} />
        </main>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default ManagerLayout;
