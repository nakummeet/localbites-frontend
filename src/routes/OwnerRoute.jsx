/**
 * OwnerRoute — guards routes that require the 'owner' role.
 *
 * Extends ProtectedRoute logic:
 * - If auth loading, show Loader.
 * - If not authenticated, redirect to /login.
 * - If authenticated but not owner, redirect to / (user home).
 * - If owner, render child routes.
 */

import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loader from '../components/common/Loader';

const OwnerRoute = () => {
  const { isAuthenticated, isOwner, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isOwner) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default OwnerRoute;
