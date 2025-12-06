import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '200px', backgroundColor: '#f0f0f0', padding: '20px' }}>
        <h2>Admin Menu</h2>
        <ul>
          <li>Dashboard</li>
          <li>Users</li>
          <li>Settings</li>
        </ul>
      </aside>
      <main style={{ flexGrow: 1, padding: '20px' }}>
        <h1>Admin Content</h1>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
