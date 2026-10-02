/**
 * Pure utility/helper functions used across the application.
 */

/**
 * Format a number as Indian Rupee currency.
 * @param {number} amount
 * @returns {string} e.g. "₹249.00"
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format an ISO date string to a readable format.
 * @param {string} dateString — ISO date
 * @param {object} options — Intl.DateTimeFormat options
 * @returns {string} e.g. "2 Jul 2026, 5:30 PM"
 */
export const formatDate = (dateString, options = {}) => {
  const defaultOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...options,
  };

  return new Intl.DateTimeFormat('en-IN', defaultOptions).format(
    new Date(dateString)
  );
};

/**
 * Get initials from a user's name (for avatar fallback).
 * @param {string} name
 * @returns {string} e.g. "JD" for "John Doe"
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Truncate text to a maximum length with ellipsis.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
};

/**
 * Extract a user-friendly error message from an Axios error.
 * @param {Error} error — Axios error object
 * @param {string} fallback — default message
 * @returns {string}
 */
export const getErrorMessage = (error, fallback = 'Something went wrong') => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return fallback;
};

/**
 * Format status string to title case for UI display.
 * @param {string} status
 * @returns {string} e.g. "preparing" -> "Preparing"
 */
export const formatStatus = (status) => {
  if (!status) return '';
  const statusMap = {
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    preparing: 'Preparing',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return statusMap[String(status).toLowerCase()] || String(status).charAt(0).toUpperCase() + String(status).slice(1);
};

