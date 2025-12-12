import { Outlet, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';

// Global App Component
import CartDrawer from '../components/admin/CartDrawer.jsx';

export default function ClientLayout() {
  const { cartCount, toggleCart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="bg-surf-black text-white min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-surf-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-4 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" onClick={closeMobileMenu}>
            <i className="ph-fill ph-wave-sine text-3xl text-surf-accent group-hover:rotate-12 transition-transform"></i>
            <div className="flex flex-col leading-none">
              <span className="font-display text-2xl tracking-wide uppercase">Bird Rock</span>
              <span className="text-[10px] text-gray-400 tracking-[0.2em] uppercase">Surf Shop • Est 2007</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide uppercase">
            <Link to="/shop" className="hover:text-surf-accent transition-colors">Shop</Link>
            <Link to="/rentals" className="hover:text-surf-accent transition-colors">Rentals</Link>
            <Link to="/surfshack" className="hover:text-surf-accent transition-colors">The Surfshack</Link>
            <Link to="/society" className="flex items-center gap-1 text-surf-accent hover:text-white transition-colors">
              <i className="ph-bold ph-crown"></i> The Society
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="hover:text-surf-accent transition-colors"><i className="ph text-2xl ph-magnifying-glass"></i></button>
            <button 
              onClick={toggleCart}
              className="hover:text-surf-accent transition-colors relative"
              aria-label="Open cart"
            >
              <i className="ph text-2xl ph-bag"></i>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-surf-accent text-black text-[10px] flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden hover:text-surf-accent transition-colors"
              aria-label="Toggle menu"
            >
              <i className={`ph text-3xl transition-all duration-300 ${isMobileMenuOpen ? 'ph-x' : 'ph-list'}`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          className={`md:hidden absolute top-20 left-0 right-0 bg-black backdrop-blur-xl border-b border-white/10 transition-all duration-300 ease-in-out ${
            isMobileMenuOpen 
              ? 'opacity-100 translate-y-0 pointer-events-auto' 
              : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="max-w-[1600px] mx-auto px-4 py-6 flex flex-col gap-1">
            <Link 
              to="/shop" 
              onClick={closeMobileMenu}
              className="py-4 px-4 hover:bg-white/5 rounded-lg font-semibold tracking-wide uppercase text-sm transition-colors hover:text-surf-accent border-b border-white/5"
            >
              Shop
            </Link>
            <Link 
              to="/rentals" 
              onClick={closeMobileMenu}
              className="py-4 px-4 hover:bg-white/5 rounded-lg font-semibold tracking-wide uppercase text-sm transition-colors hover:text-surf-accent border-b border-white/5"
            >
              Rentals
            </Link>
            <Link 
              to="/surfshack" 
              onClick={closeMobileMenu}
              className="py-4 px-4 hover:bg-white/5 rounded-lg font-semibold tracking-wide uppercase text-sm transition-colors hover:text-surf-accent border-b border-white/5"
            >
              The Surfshack
            </Link>
            <Link 
              to="/society" 
              onClick={closeMobileMenu}
              className="py-4 px-4 hover:bg-white/5 rounded-lg font-semibold tracking-wide uppercase text-sm transition-colors hover:text-surf-accent flex items-center gap-2"
            >
              <i className="ph-bold ph-crown text-surf-accent"></i>
              The Society
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Wrapper - Allow child content full control */}
      <main className="pt-24 pb-12 w-full min-h-screen">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12">
        <div className="max-w-[1600px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
                <p className="font-display text-2xl uppercase tracking-wide">Bird Rock Surf Shop</p>
                <p className="text-gray-500 text-sm mt-1">La Jolla, CA • Since 2007</p>
            </div>
            <div className="flex gap-6 text-2xl text-gray-400">
                <a href="#" className="hover:text-white transition-colors"><i className="ph-fill ph-instagram-logo"></i></a>
                <a href="#" className="hover:text-white transition-colors"><i className="ph-fill ph-facebook-logo"></i></a>
                <a href="#" className="hover:text-white transition-colors"><i className="ph-fill ph-tiktok-logo"></i></a>
            </div>
            <div className="text-gray-600 text-xs">
                &copy; {new Date().getFullYear()} Bird Rock Surf Shop. All rights reserved.
            </div>
        </div>
      </footer>
      <CartDrawer />
    </div>
  );
}