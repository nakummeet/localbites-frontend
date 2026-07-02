import api from "./api";

/**
 * Get current user's cart
 * GET /api/cart
 */
export const getCart = async () => {
  const response = await api.get("/cart");
  return response.data.data;
};

/**
 * Add food to cart
 * POST /api/cart/add
 *
 * Body:
 * {
 *   foodId,
 *   quantity
 * }
 */
export const addToCart = async (data) => {
  const response = await api.post("/cart/add", data);
  return response.data.data;
};

/**
 * Update cart item quantity
 * PUT /api/cart/update
 *
 * Body:
 * {
 *   foodId,
 *   quantity
 * }
 */
export const updateCart = async (data) => {
  const response = await api.put("/cart/update", data);
  return response.data.data;
};

export const updateCartItem = async (data) => updateCart(data);

/**
 * Remove food from cart
 * DELETE /api/cart/remove/:foodId
 */
export const removeFromCart = async (foodId) => {
  const response = await api.delete(`/cart/remove/${foodId}`);
  return response.data.data;
};