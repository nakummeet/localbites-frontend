/**
 * CartContext — full cart state management.
 *
 * Syncs with the backend cart API. All mutations (add, update, remove)
 * call the API first, then update local state on success.
 * This ensures the cart is always in sync with the server.
 */

import { createContext, useState, useEffect, useCallback } from 'react';
import * as cartService from '../services/cartService';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const { isAuthenticated, isUser } = useAuth();

  // ─── Fetch cart on mount (only for authenticated users) ──
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !isUser) return;

    setCartLoading(true);
    try {
      const data = await cartService.getCart();
      setCartItems(data.items || data.cart?.items || data || []);
    } catch {
      // Silent fail — cart might be empty
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  }, [isAuthenticated, isUser]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ─── Add to Cart ───────────────────────────────────────
  const addToCart = async (foodId, restaurantId, quantity = 1) => {
    try {
      const data = await cartService.addToCart({ foodId, restaurantId, quantity });
      setCartItems(data.items || data.cart?.items || data || []);
      toast.success('Added to cart');
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to add to cart'));
      return false;
    }
  };

  // ─── Update Quantity ───────────────────────────────────
  const updateQuantity = async (itemId, quantity) => {
    try {
      const data = await cartService.updateCartItem(itemId, { quantity });
      setCartItems(data.items || data.cart?.items || data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update quantity'));
    }
  };

  // ─── Remove Item ───────────────────────────────────────
  const removeItem = async (itemId) => {
    try {
      const data = await cartService.removeFromCart(itemId);
      setCartItems(data.items || data.cart?.items || data || []);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to remove item'));
    }
  };

  // ─── Clear Cart (local only, after placing order) ──────
  const clearCart = () => {
    setCartItems([]);
  };

  // ─── Computed Values ───────────────────────────────────
  const cartCount = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
    : 0;

  const cartTotal = Array.isArray(cartItems)
    ? cartItems.reduce(
        (sum, item) => sum + (item.food?.price || item.price || 0) * (item.quantity || 1),
        0
      )
    : 0;

  const value = {
    cartItems,
    cartLoading,
    cartCount,
    cartTotal,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    fetchCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
