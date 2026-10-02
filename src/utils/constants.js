/**
 * Application-wide constants.
 * Single source of truth for API config, role values, order statuses, etc.
 */

// Backend base URL — change this when deploying
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// User roles — must match backend enum values exactly
export const ROLES = {
  USER: 'user',
  OWNER: 'owner',
};

// Order status flow — mirrors backend status enum
export const ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  PREPARING: 'preparing',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Status color mapping for UI badges
export const STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: '#f59e0b',
  [ORDER_STATUS.ACCEPTED]: '#3b82f6',
  [ORDER_STATUS.REJECTED]: '#ef4444',
  [ORDER_STATUS.PREPARING]: '#8b5cf6',
  [ORDER_STATUS.DELIVERED]: '#10b981',
  [ORDER_STATUS.CANCELLED]: '#6b7280',
};

// Toast notification config
export const TOAST_CONFIG = {
  duration: 3000,
  position: 'top-right',
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
};
