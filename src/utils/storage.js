/**
 * LocalStorage utility for auth persistence.
 * Wraps localStorage with safe JSON parsing and centralized key management.
 */

const KEYS = {
  TOKEN: 'localbites_token',
  USER: 'localbites_user',
};

// ─── Token ───────────────────────────────────────────────

export const getToken = () => {
  return localStorage.getItem(KEYS.TOKEN);
};

export const setToken = (token) => {
  localStorage.setItem(KEYS.TOKEN, token);
};

export const removeToken = () => {
  localStorage.removeItem(KEYS.TOKEN);
};

// ─── User ────────────────────────────────────────────────

export const getUser = () => {
  try {
    const user = localStorage.getItem(KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch {
    // Corrupted data — clear it
    removeUser();
    return null;
  }
};

export const setUser = (user) => {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const removeUser = () => {
  localStorage.removeItem(KEYS.USER);
};

// ─── Clear All Auth ──────────────────────────────────────

export const clearAuth = () => {
  removeToken();
  removeUser();
};
