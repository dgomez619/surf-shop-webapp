import { createContext, useContext, useState, useEffect, useMemo } from 'react';

// Create the Cart Context
const CartContext = createContext(null);

// Custom hook for consuming the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Helper: Calculate number of days between two dates
const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays || 1; // Minimum 1 day
};

// Helper: Generate unique ID for cart items
const generateCartItemId = (item) => {
  if (item.type === 'rental') {
    return `rental-${item.id}-${item.dateRange?.start}-${item.dateRange?.end}`;
  }
  // Standard product
  return `product-${item.id}-${item.selectedSize || 'default'}`;
};

// Helper: Check if two items match (same product, same variant)
const itemsMatch = (item1, item2) => {
  // Different base products
  if (item1.id !== item2.id) return false;
  
  // Rental: Match if same dates
  if (item1.type === 'rental' && item2.type === 'rental') {
    return (
      item1.dateRange?.start === item2.dateRange?.start &&
      item1.dateRange?.end === item2.dateRange?.end
    );
  }
  
  // Product: Match if same size
  if (item1.type !== 'rental' && item2.type !== 'rental') {
    return (item1.selectedSize || 'default') === (item2.selectedSize || 'default');
  }
  
  return false;
};

// Helper: Calculate item price
const calculateItemPrice = (item) => {
  if (item.type === 'rental') {
    const days = calculateDays(item.dateRange?.start, item.dateRange?.end);
    const rate = item.dailyRate || item.price || 0;
    return rate * days * (item.quantity || 1);
  }
  // Standard product
  return (item.price || 0) * (item.quantity || 1);
};

export const CartProvider = ({ children }) => {
  // Load cart from localStorage on mount (lazy initialization)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('birdRockCart');
      if (savedCart) {
        return JSON.parse(savedCart);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
    return [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('birdRockCart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

  // Add item to cart
// Add item to cart
  const addToCart = (item) => {
    if (!item || !item.id) {
      console.error('Invalid item:', item);
      return;
    }

    setCartItems((prevItems) => {
      // 1. Check if item exists (Same ID + Same Dates/Size)
      const existingItemIndex = prevItems.findIndex((cartItem) =>
        itemsMatch(cartItem, item)
      );

      // 2. Calculate the potential new quantity
      const currentQty = existingItemIndex !== -1 ? prevItems[existingItemIndex].quantity : 0;
      const addingQty = item.quantity || 1;
      const totalQty = currentQty + addingQty;

      // 3. THE SAFETY CHECK: Compare against actual Stock
      // (item.stock comes from your Firestore data)
      if (item.stock && totalQty > item.stock) {
        alert(`Sorry, we only have ${item.stock} of these available!`);
        // Return previous state without changes
        return prevItems; 
      }

      if (existingItemIndex !== -1) {
        // Update existing item quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: totalQty,
        };
        return updatedItems;
      }

      // Add new item
      const newItem = {
        ...item,
        cartItemId: generateCartItemId(item),
        quantity: addingQty,
        addedAt: new Date().toISOString(),
      };

      return [...prevItems, newItem];
    });

    // Cart will only open when user clicks the bag icon
  };

  // Remove item from cart by cartItemId
  const removeFromCart = (cartItemId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.cartItemId !== cartItemId)
    );
  };

  // Update quantity (increment/decrement)
  const updateQuantity = (cartItemId, delta) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQuantity = (item.quantity || 1) + delta;
            
            // Remove item if quantity drops to 0 or below
            if (newQuantity <= 0) {
              return null;
            }
            
            return {
              ...item,
              quantity: newQuantity,
            };
          }
          return item;
        })
        .filter(Boolean); // Remove null items
    });
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Toggle cart drawer
  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };

  // Open cart explicitly
  const openCart = () => {
    setIsCartOpen(true);
  };

  // Close cart explicitly
  const closeCart = () => {
    setIsCartOpen(false);
  };

  // Derived state: Total item count
  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  }, [cartItems]);

  // Derived state: Total price
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      return total + calculateItemPrice(item);
    }, 0);
  }, [cartItems]);

  // Context value
  const value = {
    // State
    cartItems,
    isCartOpen,
    cartCount,
    cartTotal,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
