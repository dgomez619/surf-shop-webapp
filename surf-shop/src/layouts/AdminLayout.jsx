import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AdminLayout = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/admin/login');
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-surf-black">
      {/* Sidebar */}
      <aside className="w-64 bg-surf-card border-r border-white/10 p-6 flex flex-col justify-between">
        <div className="flex flex-col gap-6">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors">
            <i className="ph ph-house text-xl"></i>
          </Link>
          <nav className="flex flex-col gap-2">
            <Link to="/admin/dashboard" className="font-display text-lg uppercase tracking-wide text-white hover:text-surf-accent transition-colors py-2">
              Inventory
            </Link>
            <Link to="/admin/fleet" className="font-display text-lg uppercase tracking-wide text-gray-500 hover:text-surf-accent transition-colors py-2">
              Fleet
            </Link>
            <Link to="/admin/shack" className="font-display text-lg uppercase tracking-wide text-gray-500 hover:text-surf-accent transition-colors py-2">
              Shack
            </Link>
          </nav>
        </div>
        
        {/* User & Logout Section */}
        <div className="flex flex-col gap-4 pt-6 border-t border-white/10">
          <span className="text-xs text-gray-500 uppercase tracking-widest truncate">{user?.email}</span>
          <button
            onClick={() => auth.signOut()}
            className="text-xs font-bold text-red-500 border border-red-500/20 px-3 py-2 rounded hover:bg-red-500 hover:text-white transition-colors w-full"
          >
            LOGOUT
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
