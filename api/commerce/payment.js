import api from "../axios";

/* =========================
   GET PAYMENT METHODS
========================= */

export const getPaymentMethods = async () => {
  const response = await api.get("/commerce/payment-methods");
  return response.data;
};

/* =========================
   ADD PAYMENT METHOD
========================= */

export const addPaymentMethod = async (data) => {
  const response = await api.post("/commerce/payment-methods", data);
  return response.data;
};

/* =========================
   DELETE PAYMENT METHOD
========================= */

export const deletePaymentMethod = async (methodId) => {
  const response = await api.delete(`/commerce/payment-methods/${methodId}`);
  return response.data;
};