import React from 'react';
import { Outlet } from 'react-router-dom';

const ManagerLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-700">Canteen Manager</div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="block p-2 hover:bg-gray-700 rounded">Dashboard</a>
          <a href="#" className="block p-2 hover:bg-gray-700 rounded">Inventory</a>
          <a href="#" className="block p-2 hover:bg-gray-700 rounded">Dynamic Pricing</a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header Placeholder */}
        <header className="h-16 bg-white shadow flex items-center px-6">
          <h1 className="text-lg font-semibold">Manager Portal</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet /> {/* Nơi render các pages của manager */}
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
