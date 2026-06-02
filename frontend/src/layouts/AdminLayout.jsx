import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Placeholder for Admin */}
      <aside className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-indigo-700">Canteen Admin</div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-indigo-300 uppercase mt-4 mb-2">System</div>
          <a href="#" className="block p-2 hover:bg-indigo-700 rounded">Dashboard</a>
          <a href="#" className="block p-2 hover:bg-indigo-700 rounded">User Management</a>
          <a href="#" className="block p-2 hover:bg-indigo-700 rounded">Revenue & Sales</a>
          
          <div className="text-xs font-semibold text-indigo-300 uppercase mt-4 mb-2">Food & Menu</div>
          <a href="#" className="block p-2 hover:bg-indigo-700 rounded">Food Categories</a>
          <a href="#" className="block p-2 hover:bg-indigo-700 rounded">Food Items</a>
          <a href="#" className="block p-2 hover:bg-indigo-700 rounded">Daily Menu</a>
          <a href="#" className="block p-2 hover:bg-indigo-700 rounded">Scheduled Menu</a>
          
          <div className="text-xs font-semibold text-indigo-300 uppercase mt-4 mb-2">AI & Operations</div>
          <a href="#" className="block p-2 hover:bg-indigo-700 rounded">AI Optimization</a>
          <a href="#" className="block p-2 hover:bg-indigo-700 rounded">Order List</a>
          <a href="#" className="block p-2 hover:bg-indigo-700 rounded">Payment List</a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Placeholder */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold">Admin Portal</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Admin User</span>
            {/* Thêm menu Profile / Change Password ở đây */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          <Outlet /> {/* Nơi render các pages của Admin */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
