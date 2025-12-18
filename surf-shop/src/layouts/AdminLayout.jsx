import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AdminLayout = () => {
  const [user, setUser] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
      <aside className={`
        bg-surf-card border-r border-white/10 p-6 
        flex flex-col justify-between
        transition-all duration-300 ease-in-out
        fixed left-0 top-0 h-screen
        ${isSidebarCollapsed ? 'w-20' : 'w-32'}
      `}>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Link to="/" className={`text-gray-400 hover:text-white transition-colors ${isSidebarCollapsed ? 'mx-auto' : ''}`}>
              <i className="ph ph-house text-xl"></i>
            </Link>
            {!isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Collapse sidebar"
              >
                <i className="ph-bold ph-caret-left text-xl"></i>
              </button>
            )}
          </div>
          <nav className="flex flex-col gap-2">
            <Link 
              to="/admin/dashboard" 
              className={`font-display text-lg uppercase tracking-wide transition-colors py-2 border-l-4 pl-3 ${
                location.pathname.includes('/admin/dashboard') || location.pathname === '/admin' || location.pathname.includes('/admin/products')
                  ? 'border-surf-accent text-surf-accent bg-surf-accent/10' 
                  : 'border-transparent text-gray-500 hover:text-surf-accent hover:border-gray-500'
              } ${isSidebarCollapsed ? 'text-center pl-0 border-l-0' : ''}`}
              title={isSidebarCollapsed ? 'Inventory' : ''}
            >
              {isSidebarCollapsed ? <i className="ph-bold ph-package text-xl"></i> : 'Inventory'}
            </Link>
            <Link 
              to="/admin/fleet" 
              className={`font-display text-lg uppercase tracking-wide transition-colors py-2 border-l-4 pl-3 ${
                location.pathname.includes('/admin/fleet')
                  ? 'border-surf-accent text-surf-accent bg-surf-accent/10' 
                  : 'border-transparent text-gray-500 hover:text-surf-accent hover:border-gray-500'
              } ${isSidebarCollapsed ? 'text-center pl-0 border-l-0' : ''}`}
              title={isSidebarCollapsed ? 'Fleet' : ''}
            >
              {isSidebarCollapsed ? <i className="ph-bold ph-lifebuoy text-xl"></i> : 'Fleet'}
            </Link>
            <Link 
              to="/admin/shack" 
              className={`font-display text-lg uppercase tracking-wide transition-colors py-2 border-l-4 pl-3 ${
                location.pathname.includes('/admin/shack')
                  ? 'border-surf-accent text-surf-accent bg-surf-accent/10' 
                  : 'border-transparent text-gray-500 hover:text-surf-accent hover:border-gray-500'
              } ${isSidebarCollapsed ? 'text-center pl-0 border-l-0' : ''}`}
              title={isSidebarCollapsed ? 'Shack' : ''}
            >
              {isSidebarCollapsed ? <i className="ph-bold ph-storefront text-xl"></i> : 'Shack'}
            </Link>
            <Link 
              to="/admin/orders" 
              className={`font-display text-lg uppercase tracking-wide transition-colors py-2 border-l-4 pl-3 ${
                location.pathname.includes('/admin/orders')
                  ? 'border-surf-accent text-surf-accent bg-surf-accent/10' 
                  : 'border-transparent text-gray-500 hover:text-surf-accent hover:border-gray-500'
              } ${isSidebarCollapsed ? 'text-center pl-0 border-l-0' : ''}`}
              title={isSidebarCollapsed ? 'Orders' : ''}
            >
              {isSidebarCollapsed ? <i className="ph-bold ph-receipt text-xl"></i> : 'Orders'}
            </Link>
          </nav>
        </div>
        
        {/* User & Logout Section */}
        {!isSidebarCollapsed ? (
          <div className="flex flex-col gap-4 pt-6 border-t border-white/10">
            <span className="text-xs text-gray-500 uppercase tracking-widest truncate">{user?.email}</span>
            <button
              onClick={() => auth.signOut()}
              className="text-xs font-bold text-red-500 border border-red-500/20 px-3 py-2 rounded hover:bg-red-500 hover:text-white transition-colors w-full"
            >
              LOGOUT
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pt-6 border-t border-white/10">
            <button
              onClick={() => auth.signOut()}
              className="text-red-500 hover:text-red-400 transition-colors mx-auto"
              title="Logout"
            >
              <i className="ph-bold ph-sign-out text-xl"></i>
            </button>
          </div>
        )}
      </aside>

      {/* Expand Button - Shows when collapsed */}
      {isSidebarCollapsed && (
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="fixed left-20 top-6 z-50 bg-surf-card border border-white/10 p-1 rounded-r text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Expand sidebar"
        >
          <i className="ph-bold ph-caret-right text-sm"></i>
        </button>
      )}

      <main className={`flex-1 overflow-auto transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-48'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
