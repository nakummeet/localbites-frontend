/**
 * AppRoutes — centralized route definitions with real page components.
 *
 * ROUTE STRUCTURE:
 *
 * Public (AuthLayout):
 *   /login   → Login page
 *   /signup  → Signup page
 *
 * Protected User (UserLayout):
 *   /                    → Home (restaurant listing)
 *   /restaurants/:id     → Restaurant detail + food menu
 *   /cart                → Cart page
 *   /orders              → User orders
 *   /profile             → User profile
 *
 * Protected Owner (OwnerLayout):
 *   /owner/dashboard     → Owner dashboard
 *   /owner/restaurant    → Manage restaurant
 *   /owner/foods         → Manage food items
 *   /owner/orders        → Manage orders
 *   /owner/profile       → Owner profile
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// Layouts
import AuthLayout from '../components/layout/AuthLayout';
import UserLayout from '../components/layout/UserLayout';
import OwnerLayout from '../components/layout/OwnerLayout';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import OwnerRoute from './OwnerRoute';

// Auth Pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';

// User Pages
import Home from '../pages/user/Home';
import RestaurantDetails from '../pages/user/RestaurantDetails';
import Cart from '../pages/user/Cart';
import UserOrders from '../pages/user/Orders';
import UserProfile from '../pages/user/Profile';

// Owner Pages
import Dashboard from '../pages/owner/Dashboard';
import Restaurant from '../pages/owner/Restaurant';
import Foods from '../pages/owner/Foods';
import OwnerOrders from '../pages/owner/Orders';
import OwnerProfile from '../pages/owner/Profile';

const AppRoutes = () => {
  const { isAuthenticated, isOwner } = useAuth();

  return (
    <Routes>
      {/* ─── Public Routes (Auth Layout) ──────── */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to={isOwner ? '/owner/dashboard' : '/'} replace />
              : <Login />
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated
              ? <Navigate to={isOwner ? '/owner/dashboard' : '/'} replace />
              : <Signup />
          }
        />
      </Route>

      {/* ─── Protected User Routes ────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants/:id" element={<RestaurantDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<UserOrders />} />
          <Route path="/profile" element={<UserProfile />} />
        </Route>
      </Route>

      {/* ─── Protected Owner Routes ───────────── */}
      <Route element={<OwnerRoute />}>
        <Route element={<OwnerLayout />}>
          <Route path="/owner/dashboard" element={<Dashboard />} />
          <Route path="/owner/restaurant" element={<Restaurant />} />
          <Route path="/owner/foods" element={<Foods />} />
          <Route path="/owner/orders" element={<OwnerOrders />} />
          <Route path="/owner/profile" element={<OwnerProfile />} />
        </Route>
      </Route>

      {/* ─── Catch-all: redirect to home ──────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
