/**
 * ProtectedRoute — guards routes that require authentication.
 *
 * - If auth is still loading (initial check), show Loader.
 * - If not authenticated, redirect to /login.
 * - Otherwise, render the child route via <Outlet />.
 */

import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loader from '../components/common/Loader';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
