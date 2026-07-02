import api from "./api";

/**
 * Get all restaurants
 * GET /api/restaurants
 */
export const getAllRestaurants = async () => {
  const response = await api.get("/restaurants");
  return response.data.data;
};

/**
 * Get restaurant by ID
 * GET /api/restaurants/:id
 */
export const getRestaurantById = async (id) => {
  const response = await api.get(`/restaurants/${id}`);
  return response.data.data;
};

/**
 * Create Restaurant
 * POST /api/restaurants
 */
export const createRestaurant = async (data) => {
  const response = await api.post("/restaurants", data);
  return response.data.data;
};

/**
 * Normalize common response shapes returned by the API.
 * Supports responses like data.restaurant, data.value, or direct data.
 */
const normalizeApiData = (data) => {
  if (!data) return null;
  return data.restaurant || data.value?.restaurant || data.value || data;
};

/**
 * Owner Restaurant
 * GET /api/restaurants/me
 */
export const getMyRestaurant = async () => {
  const response = await api.get("/restaurants/me");
  return normalizeApiData(response.data?.data);
};

/**
 * Update Restaurant
 * PUT /api/restaurants/me
 */
export const updateRestaurant = async (data) => {
  const response = await api.put(`/restaurants/me`, data);
  return response.data.data;
};

/**
 * Delete Restaurant
 * DELETE /api/restaurants/me
 */
export const deleteRestaurant = async () => {
  const response = await api.delete(`/restaurants/me`);
  return response.data;
};