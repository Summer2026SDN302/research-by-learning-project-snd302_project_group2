import React from 'react';
import { Outlet } from 'react-router-dom';

const POSLayout = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Simple Header for Staff */}
      <header className="h-14 bg-blue-600 text-white flex items-center justify-between px-6 shadow-md">
        <div className="font-bold text-lg">Canteen POS Terminal</div>
        <div className="text-sm">Cashier: Staff_01</div>
      </header>

      {/* Main POS Content (Fullscreen without sidebar) */}
      <main className="flex-1 overflow-hidden">
        <Outlet /> {/* Nơi render màn hình bán hàng */}
      </main>
    </div>
  );
};

export default POSLayout;
