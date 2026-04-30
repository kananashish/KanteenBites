import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addItem = (item) => {
    const existingItem = cart.find((i) => i.itemId === item.itemId);
    if (existingItem) {
      setCart(cart.map((i) =>
        i.itemId === item.itemId
          ? { ...i, quantity: i.quantity + (item.quantity || 1) }
          : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: item.quantity || 1 }]);
    }
  };

  const removeItem = (itemId) => {
    setCart(cart.filter((i) => i.itemId !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId);
    } else {
      setCart(cart.map((i) =>
        i.itemId === itemId ? { ...i, quantity } : i
      ));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{ cart, addItem, removeItem, updateQuantity, clearCart, getTotalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
