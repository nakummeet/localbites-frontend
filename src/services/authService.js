import api from "./api";

/**
 * Signup
 */
export const signup = async (data) => {
  const response = await api.post("/auth/signup", data);

  if (!response.data) {
    throw new Error("No response from server");
  }

  // Handle both response formats
  return response.data.data || response.data;
};

/**
 * Login
 */
export const login = async (credentials) => {
  const response = await api.post("/auth/signin", credentials);

  if (!response.data) {
    throw new Error("No response from server");
  }

  return response.data.data || response.data;
};

/**
 * Get current logged in user
 */
export const getProfile = async () => {
  const response = await api.get("/auth/me");

  if (!response.data) {
    throw new Error("No response from server");
  }

  return response.data.data || response.data.user || response.data;
};