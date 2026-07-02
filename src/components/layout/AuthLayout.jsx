/**
 * AuthLayout — centered layout for Login & Signup pages.
 *
 * No navbar/footer, just a clean centered card with branding.
 */

import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="auth-layout__container">
        {/* ─── Brand Section ─────────────────── */}
        <div className="auth-layout__brand">
          <span className="auth-layout__icon">🍽️</span>
          <h1 className="auth-layout__title">LocalBites</h1>
          <p className="auth-layout__tagline">Discover local flavors, delivered fresh</p>
        </div>

        {/* ─── Form Card ─────────────────────── */}
        <div className="auth-layout__card">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
