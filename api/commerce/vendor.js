import api from "../axios";

/* =========================
   VENDOR PRODUCTS
========================= */

export const getVendorProducts = async () => {
  const response = await api.get("/v1/commerce/vendor/products");
  return response.data;
};

/* =========================
   SINGLE PRODUCT
========================= */

export const getVendorProduct = async (productId) => {
  const response = await api.get(`/commerce/vendor/products/${productId}`);
  return response.data;
};

/* =========================
   CREATE PRODUCT
========================= */

export const createVendorProduct = async (data) => {
  const response = await api.post("/commerce/vendor/products", data);
  return response.data;
};

/* =========================
   UPDATE PRODUCT INVENTORY
========================= */

export const updateInventory = async (productId, data) => {
  const response = await api.post(`/commerce/vendor/products/${productId}/inventory`, data);
  return response.data;
};