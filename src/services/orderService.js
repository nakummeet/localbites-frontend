import api from "./api";

/**
 * Place order
 * POST /api/orders/place
 */
export const placeOrder = async (data) => {
  const response = await api.post("/orders/place", data);
  return response.data.data;
};

/**
 * User Orders
 * GET /api/orders/my
 */
export const getUserOrders = async () => {
  const response = await api.get("/orders/my");
  return response.data.data;
};

/**
 * Restaurant Orders
 * GET /api/orders/restaurant
 */
export const getRestaurantOrders = async () => {
  const response = await api.get("/orders/restaurant");
  return response.data.data;
};

/**
 * Update order status
 * PUT /api/orders/:id/status
 */
export const updateOrderStatus = async (orderId, data) => {
  const response = await api.put(`/orders/${orderId}/status`, data);
  return response.data.data;
};