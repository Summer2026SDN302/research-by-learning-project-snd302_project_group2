import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import ToastContainer from '../components/feedback/ToastContainer';

const MOCK_USER = { name: 'Staff User', initials: 'S', email: 'staff@stallbox.com', role: 'staff' };

const POSLayout = () => {
  const [activePath, setActivePath] = useState('/staff/pos');

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Staff uses a slim sidebar (no top search needed for POS) */}
      <Sidebar
        role="staff"
        activePath={activePath}
        onNavigate={setActivePath}
        user={MOCK_USER}
      />

      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        {/* Simple Staff Header (no search bar) */}
        <header className="h-14 bg-surface border-b border-outline-variant flex items-center justify-between px-6 shrink-0 z-40">
          <span className="text-body-sm font-semibold text-on-surface-variant">
            StallBox – POS Terminal
          </span>
          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            <span id="pos-clock">{new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </header>

        {/* POS full-height content (no padding – POS pages manage their own layout) */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default POSLayout;
