import api from "./api";

/**
 * Get logged in user
 * GET /api/auth/me
 */
export const getProfile = async () => {
  const response = await api.get("/auth/me");
  return response.data.data;
};

/**
 * Delete account
 *
 * Change this endpoint if your backend
 * uses another delete route.
 */
export const deleteAccount = async () => {
  const response = await api.delete("/users/me");
  return response.data;
};