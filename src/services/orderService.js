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
 * Accept order (Owner)
 * PUT /api/orders/:id/accept
 */
export const acceptOrder = async (orderId) => {
  const response = await api.put(`/orders/${orderId}/accept`);
  return response.data.data;
};

/**
 * Reject order (Owner)
 * PUT /api/orders/:id/reject
 */
export const rejectOrder = async (orderId) => {
  const response = await api.put(`/orders/${orderId}/reject`);
  return response.data.data;
};

/**
 * Update order status (Owner: accepted -> preparing -> delivered)
 * PUT /api/orders/:id/status
 */
export const updateOrderStatus = async (orderId, statusData) => {
  const payload = typeof statusData === 'string' ? { status: statusData } : statusData;
  const response = await api.put(`/orders/${orderId}/status`, payload);
  return response.data.data;
};