import api from "../axios";

/* =========================
   CREATE ORDER
========================= */

export const createOrder = async (data) => {
  const response = await api.post("/v1/commerce/orders", data);
  return response.data;
};

/* =========================
   GET ORDERS
========================= */

export const getOrders = async () => {
  const response = await api.get("/commerce/orders");
  return response.data;
};

/* =========================
   ORDER DETAILS
========================= */

export const getOrderDetails = async (orderId) => {
  const response = await api.get(`/commerce/orders/${orderId}`);
  return response.data;
};

/* =========================
   CANCEL ORDER
========================= */

export const cancelOrder = async (orderId) => {
  const response = await api.post(`/commerce/orders/${orderId}/cancel`);
  return response.data;
};