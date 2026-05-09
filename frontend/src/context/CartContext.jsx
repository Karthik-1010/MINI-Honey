import React, { createContext, useContext, useEffect } from 'react';
import { useStore } from '../store/useStore.js';

/**
 * CartContext Bridge
 * Proxies legacy CartContext calls to the enterprise Zustand store.
 * Ensures backward compatibility while using the robust persistence layer.
 */
const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Map Zustand store to context values
  const { 
    cart, subtotal, total, isHydrated,
    addToCart, updateQuantity, removeFromCart, clearCart
  } = useStore();

  const value = {
    cart,
    items: cart,
    subtotal,
    total,
    isHydrated,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
