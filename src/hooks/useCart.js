/**
 * useCart hook — convenience wrapper around CartContext.
 * Will be populated when CartContext is built.
 */

import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used within a <CartProvider>. ' +
      'Wrap your app with <CartProvider> in main.jsx.'
    );
  }

  return context;
};

export default useCart;
