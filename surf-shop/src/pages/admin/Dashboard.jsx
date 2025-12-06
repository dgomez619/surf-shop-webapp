import React from 'react';

const Dashboard = () => {
  return (
    <div className="p-5 font-sans">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome to the temporary admin dashboard!</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        <div className="border border-gray-300 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Total Users</h2>
          <p className="text-4xl font-bold mt-2">1,234</p>
        </div>
        <div className="border border-gray-300 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Active Products</h2>
          <p className="text-4xl font-bold mt-2">567</p>
        </div>
        <div className="border border-gray-300 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">New Orders (Today)</h2>
          <p className="text-4xl font-bold mt-2">89</p>
        </div>
        <div className="border border-gray-300 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Revenue (This Month)</h2>
          <p className="text-4xl font-bold mt-2">$12,345</p>
        </div>
      </div>
      <div className="mt-8 border-t border-gray-200 pt-5">
        <h3 className="text-xl font-semibold">Quick Links</h3>
        <ul className="mt-4 space-y-2">
          <li><a href="/admin/users" className="text-blue-500 hover:underline">Manage Users</a></li>
          <li><a href="/admin/products" className="text-blue-500 hover:underline">Manage Products</a></li>
          <li><a href="/admin/settings" className="text-blue-500 hover:underline">Settings</a></li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
