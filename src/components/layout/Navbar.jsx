/**
 * Navbar component — top navigation bar.
 *
 * Adapts based on auth state and user role:
 * - Unauthenticated: Logo + Login/Signup buttons
 * - User: Logo + Home, Orders, Cart (with badge), Profile dropdown
 * - Owner: Logo + Dashboard, Orders, Profile dropdown
 *
 * Includes mobile hamburger menu.
 */

import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import * as restaurantService from '../../services/restaurantService';
import { getInitials } from '../../utils/helpers';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isOwner, logout } = useAuth();
  const navigate = useNavigate();
  const [hasRestaurant, setHasRestaurant] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isOwner) return;

    const fetchRestaurant = async () => {
      try {
        const restaurant = await restaurantService.getMyRestaurant();
        setHasRestaurant(Boolean(restaurant && restaurant._id));
      } catch {
        setHasRestaurant(false);
      }
    };

    fetchRestaurant();
  }, [isAuthenticated, isOwner]);

  const ownerLinks = [
    { to: '/owner/dashboard', label: 'Dashboard', icon: '📊' },
    ...(!hasRestaurant ? [{ to: '/owner/restaurant', label: 'Restaurant', icon: '🏪' }] : []),
    { to: '/owner/foods', label: 'Foods', icon: '🍔' },
    { to: '/owner/orders', label: 'Orders', icon: '📋' },
    { to: '/owner/profile', label: 'Profile', icon: '👤' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar__container container">
        {/* ─── Logo ─────────────────────────────── */}
        <Link to={isOwner ? '/owner/dashboard' : '/'} className="navbar__logo">
          <span className="navbar__logo-icon">🍽️</span>
          <span className="navbar__logo-text">LocalBites</span>
        </Link>

        {/* ─── Desktop Nav Links ────────────────── */}
        <div className={`navbar__nav ${mobileMenuOpen ? 'navbar__nav--open' : ''}`}>
          {isAuthenticated && !isOwner && (
            <div className="navbar__links">
              <NavLink to="/" className="navbar__link" onClick={closeMobile} end>
                Home
              </NavLink>
              <NavLink to="/orders" className="navbar__link" onClick={closeMobile}>
                Orders
              </NavLink>
              <NavLink to="/cart" className="navbar__link" onClick={closeMobile}>
                Cart
              </NavLink>
            </div>
          )}

          {isAuthenticated && isOwner && (
            <div className="navbar__links">
              {ownerLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="navbar__link"
                  onClick={closeMobile}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          )}

          {/* ─── Auth Actions (mobile) ────────────── */}
          {!isAuthenticated && (
            <div className="navbar__links">
              <NavLink to="/login" className="navbar__link" onClick={closeMobile}>
                Login
              </NavLink>
              <NavLink to="/signup" className="navbar__link" onClick={closeMobile}>
                Sign Up
              </NavLink>
            </div>
          )}

          {/* ─── Profile Section (mobile only for the menu items) */}
          {isAuthenticated && mobileMenuOpen && (
            <div className="navbar__mobile-profile">
              <NavLink
                to={isOwner ? '/owner/profile' : '/profile'}
                className="navbar__link"
                onClick={closeMobile}
              >
                Profile
              </NavLink>
              <button className="navbar__link navbar__logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>

        {/* ─── Right Section ────────────────────── */}
        <div className="navbar__right">
          {!isAuthenticated && (
            <div className="navbar__auth-buttons">
              <Link to="/login" className="navbar__auth-btn navbar__auth-btn--login">
                Login
              </Link>
              <Link to="/signup" className="navbar__auth-btn navbar__auth-btn--signup">
                Sign Up
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <div className="navbar__profile-wrapper">
              <button
                className="navbar__avatar"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-label="Profile menu"
                aria-expanded={profileDropdownOpen}
              >
                {getInitials(user?.name)}
              </button>

              {profileDropdownOpen && (
                <>
                  <div
                    className="navbar__dropdown-overlay"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="navbar__dropdown">
                    <div className="navbar__dropdown-header">
                      <p className="navbar__dropdown-name">{user?.name}</p>
                      <p className="navbar__dropdown-email">{user?.email}</p>
                    </div>
                    <div className="navbar__dropdown-divider" />
                    <Link
                      to={isOwner ? '/owner/profile' : '/profile'}
                      className="navbar__dropdown-item"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      👤 Profile
                    </Link>
                    <button
                      className="navbar__dropdown-item navbar__dropdown-item--danger"
                      onClick={handleLogout}
                    >
                      🚪 Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ─── Mobile Hamburger ──────────────── */}
          <button
            className={`navbar__hamburger ${mobileMenuOpen ? 'navbar__hamburger--open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="navbar__hamburger-line" />
            <span className="navbar__hamburger-line" />
            <span className="navbar__hamburger-line" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
