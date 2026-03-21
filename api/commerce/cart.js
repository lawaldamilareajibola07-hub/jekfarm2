import api from "../axios";

/* =========================
   GET CART
========================= */

export const getCart = async () => {
  const response = await api.get("/v1/commerce/cart");
  return response.data;
};

/* =========================
   ADD ITEM TO CART
========================= */

export const addToCart = async (data) => {
  const response = await api.post("/commerce/cart", data);
  return response.data;
};

/* =========================
   UPDATE CART ITEM
========================= */

export const updateCartItem = async (cartId, data) => {
  const response = await api.put(`/commerce/cart/${cartId}`, data);
  return response.data;
};

/* =========================
   REMOVE CART ITEM
========================= */

export const removeCartItem = async (cartId) => {
  const response = await api.delete(`/commerce/cart/${cartId}`);
  return response.data;
};