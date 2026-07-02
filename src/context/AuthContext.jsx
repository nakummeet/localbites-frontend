/**
 * AuthContext — global authentication state manager.
 *
 * DESIGN DECISIONS:
 * 1. On mount, if a token exists in localStorage, we validate it by calling
 *    getProfile(). This handles page refreshes and ensures stale tokens are caught.
 * 2. The 'auth:logout' custom event (fired by the Axios interceptor on 401)
 *    triggers logout here. This bridges the gap between the Axios layer
 *    (outside React) and the React context.
 * 3. We expose `loading` so route guards can show a loader during the initial
 *    auth check instead of flashing the login page.
 */

import { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import { getToken, setToken, setUser as saveUser, clearAuth } from '../utils/storage';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until initial auth check completes

  // ─── Load User on Mount ──────────────────────────────
  // Validates existing token against the backend.
  const loadUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await authService.getProfile();
      // Backend may return { user } or the user directly
      const userData = data.user || data;
      setUser(userData);
      saveUser(userData);
    } catch {
      // Token invalid or expired — clean up
      clearAuth();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // ─── Listen for 401 Logout Event from Axios Interceptor ──
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      clearAuth();
    };

    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  // ─── Login ────────────────────────────────────────────
  const login = async (credentials) => {
    const data = await authService.login(credentials);
    const token = data.token;
    const userData = data.user || data;

    setToken(token);
    setUser(userData);
    saveUser(userData);

    return userData;
  };

  // ─── Signup ───────────────────────────────────────────
  const signup = async (formData) => {
    const data = await authService.signup(formData);
    const token = data.token;
    const userData = data.user || data;

    setToken(token);
    setUser(userData);
    saveUser(userData);

    return userData;
  };

  // ─── Logout ───────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    clearAuth();
    toast.success('Logged out successfully');
  }, []);

  // ─── Helpers ──────────────────────────────────────────
  const isAuthenticated = !!user;
  const isOwner = user?.role === 'owner';
  const isUser = user?.role === 'user';

  const value = {
    user,
    loading,
    isAuthenticated,
    isOwner,
    isUser,
    login,
    signup,
    logout,
    loadUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
