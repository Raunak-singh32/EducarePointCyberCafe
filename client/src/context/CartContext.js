import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

// ── Helper: extract number from price string ──
// Handles: "25", "₹25", "25 per piece", "₹25 per piece", "25.50", etc.
export const getNumericPrice = (price) => {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  const match = String(price).match(/[\d,]+\.?\d*/);
  return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item._id === product._id);
      if (exists) {
        return prev.map(item => 
          item._id === product._id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev => prev.map(item => 
      item._id === id ? { ...item, quantity: qty } : item
    ));
  };

  const clearCart = () => setCart([]);

  // Use getNumericPrice for math, but keep original text for display
  const total = cart.reduce((sum, item) => sum + (getNumericPrice(item.price) * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total, getNumericPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);