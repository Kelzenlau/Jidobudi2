import React, { createContext, useState, useContext, useEffect } from 'react';
import { Product, CartItem } from './types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (cartId: string) => void;
  clearCart: () => void;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

export const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const t = items.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
    setTotal(t);
  }, [items]);

  const addToCart = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, cartId: Math.random().toString(36), quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartId: string) => {
    setItems(prev => prev.filter(p => p.cartId !== cartId));
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within CartProvider");
    return context;
}