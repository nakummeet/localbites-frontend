/**
 * Application entry point.
 *
 * Provider hierarchy (outermost → innermost):
 * 1. StrictMode — React development checks
 * 2. BrowserRouter — enables client-side routing
 * 3. AuthProvider — global auth state
 * 4. CartProvider — global cart state
 * 5. Toaster — toast notification system
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { TOAST_CONFIG } from './utils/constants';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
          <Toaster
            position={TOAST_CONFIG.position}
            toastOptions={{
              duration: TOAST_CONFIG.duration,
              style: {
                fontFamily: 'var(--font-family)',
                fontSize: '0.875rem',
                borderRadius: '8px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: { primary: '#00b894', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#e17055', secondary: '#fff' },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
