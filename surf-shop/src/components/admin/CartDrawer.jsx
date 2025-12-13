import { useCart } from '../../context/CartContext.jsx'; // Added .jsx extension
import { Link } from 'react-router-dom';

// Helper: Calculate number of days between two dates
const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays || 1;
};

// Helper: Format date range
const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return 'Date not set';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Adjusted for potential timezone offsets if needed, but standard method is usually fine for display
  const options = { month: 'short', day: 'numeric' };
  const startFormatted = start.toLocaleDateString('en-US', options);
  const endFormatted = end.toLocaleDateString('en-US', options);
  
  return `${startFormatted} - ${endFormatted}`;
};

// Helper: Calculate item subtotal
const calculateItemTotal = (item) => {
  if (item.type === 'rental') {
    const days = calculateDays(item.dateRange?.start, item.dateRange?.end);
    // Use dailyRate if available (rentals), otherwise fallback to price
    const rate = item.dailyRate || item.price || 0;
    // For rentals, usually quantity is 1, but if they rent 2 of the same board, we multiply
    return rate * days * (item.quantity || 1);
  }
  // Standard product
  return (item.price || 0) * (item.quantity || 1);
};

const CartDrawer = () => {
  const { 
    cartItems, 
    isCartOpen, 
    closeCart, 
    cartTotal, 
    removeFromCart, 
    updateQuantity 
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity cursor-pointer"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-surf-card shadow-2xl z-[100] flex flex-col border-l border-white/10 transform transition-transform duration-300 ease-out">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-surf-black">
          <div>
            <h2 className="font-display text-2xl uppercase tracking-wide text-white">
              Your Stash
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-mono">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            onClick={closeCart}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded"
            aria-label="Close cart"
          >
            <i className="ph-bold ph-x text-2xl"></i>
          </button>
        </div>

        {/* Cart Items or Empty State */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-surf-card">
          {cartItems.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full text-center py-12 opacity-50">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <i className="ph-duotone ph-bag text-5xl text-gray-500"></i>
              </div>
              <h3 className="font-display text-xl uppercase tracking-wide text-white mb-2">
                Stash Empty
              </h3>
              <p className="text-gray-500 mb-6 max-w-xs font-mono text-sm">
                Go find some gear or book a board.
              </p>
              <button
                onClick={closeCart}
                className="text-surf-accent border-b border-surf-accent pb-1 text-xs font-bold uppercase hover:text-white hover:border-white transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            // Cart Items
            <div className="space-y-4">
              {cartItems.map((item) => {
                const itemTotal = calculateItemTotal(item);
                const isRental = item.type === 'rental';

                return (
                  <div
                    key={item.cartItemId}
                    className="bg-black/20 border border-white/5 rounded-xl p-3 relative group"
                  >
                    <div className="flex gap-4">
                      {/* Item Image */}
                      <div className="w-20 h-24 bg-gray-800 rounded-lg overflow-hidden shrink-0 border border-white/5">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <i className={`ph-fill ${isRental ? 'ph-wave-sine' : 'ph-t-shirt'} text-3xl`}></i>
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-white text-sm leading-tight pr-6">
                                    {item.name}
                                </h3>
                                <button
                                    onClick={() => removeFromCart(item.cartItemId)}
                                    className="text-gray-600 hover:text-red-500 transition-colors absolute top-3 right-3"
                                    aria-label="Remove item"
                                >
                                    <i className="ph-bold ph-trash"></i>
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{item.category}</p>
                        </div>

                        {/* Specs / Price Breakdown */}
                        <div className="text-xs text-gray-300 font-mono mt-2 space-y-1">
                            {isRental ? (
                              <>
                                <div className="flex items-center gap-1 text-surf-accent">
                                  <i className="ph-bold ph-calendar-blank"></i>
                                  <span>{formatDateRange(item.dateRange?.start, item.dateRange?.end)}</span>
                                </div>
                                <div className="text-gray-500">
                                  ${item.dailyRate || item.price} × {calculateDays(item.dateRange?.start, item.dateRange?.end)} days
                                </div>
                              </>
                            ) : (
                              <>
                                {item.selectedSize && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-gray-500">Size:</span>
                                    <span>{item.selectedSize}</span>
                                  </div>
                                )}
                                <div className="text-gray-500">
                                  ${item.price?.toFixed(2)} each
                                </div>
                              </>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls (Bottom Row) */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-2 bg-black/40 rounded-lg border border-white/10">
                            <button
                              onClick={() => updateQuantity(item.cartItemId, -1)}
                              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                            >
                              -
                            </button>
                            <span className="text-white text-xs font-mono w-4 text-center">
                              {item.quantity || 1}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.cartItemId, 1)}
                              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                            >
                              +
                            </button>
                        </div>
                        
                        <div className="font-bold text-white text-lg">
                            ${itemTotal.toFixed(2)}
                        </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - Checkout Section */}
        {cartItems.length > 0 && (
          <div className="border-t border-white/10 bg-surf-black p-6 space-y-4">
            <div className="flex items-center justify-between text-lg">
              <span className="text-gray-400 uppercase tracking-widest text-xs font-bold">
                Subtotal
              </span>
              <span className="font-display text-3xl text-white">
                ${cartTotal.toFixed(2)}
              </span>
            </div>

            {/* CHANGED FROM BUTTON TO LINK */}
            <Link
              to="/checkout"
              onClick={closeCart}
              className="block w-full bg-surf-accent text-black font-bold uppercase tracking-widest py-4 rounded text-center hover:bg-white transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              Checkout
              <i className="ph-bold ph-arrow-right"></i>
            </Link>

            <p className="text-center text-[10px] text-gray-600 uppercase tracking-widest">
                Tax calculated at next step
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;