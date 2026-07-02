import api from "./api";

/**
 * Get foods by restaurant
 * GET /api/foods/restaurant/:id
 */
export const getFoodsByRestaurant = async (restaurantId) => {
  const response = await api.get(`/foods/restaurant/${restaurantId}`);
  return response.data.data;
};

/**
 * Add food
 * POST /api/foods
 */
export const addFood = async (data) => {
  const response = await api.post("/foods", data);
  return response.data.data;
};

/**
 * Update food
 * PUT /api/foods/:id
 */
export const updateFood = async (id, data) => {
  const response = await api.put(`/foods/${id}`, data);
  return response.data.data;
};

/**
 * Delete food
 * DELETE /api/foods/:id
 */
export const deleteFood = async (id) => {
  const response = await api.delete(`/foods/${id}`);
  return response.data.data;
};

/**
 * Toggle food availability
 * PATCH /api/foods/:id/toggle
 */
export const toggleFoodAvailability = async (id) => {
  const response = await api.patch(`/foods/${id}/toggle`);
  return response.data.data;
};