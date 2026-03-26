import api from "../axios";

/* =========================
   GET CART
========================= */

export const getCart = async () => {
  const response = await api.get("/commerce/cart");
  return response.data;
};

/* =========================
   ADD ITEM TO CART
========================= */

export const addToCart = async ({ productId, quantity }) => {
  const response = await api.post("/commerce/cart/add", {
    product_id: productId,
    quantity,
  });
  return response.data;
};

/* =========================
   UPDATE CART ITEM
========================= */

export const updateCartItem = async (productId, quantity) => {
  const response = await api.post("/commerce/cart/update", {
    product_id: productId,
    quantity,
  });
  return response.data;
};

/* =========================
   REMOVE CART ITEM
========================= */

export const removeCartItem = async (productId) => {
  const response = await api.delete("/commerce/cart/remove", {
    data: { product_id: productId },
  });
  return response.data;
};

/* =========================
   CLEAR CART
========================= */

export const clearCart = async () => {
  const response = await api.delete("/commerce/cart/clear");
  return response.data;
};