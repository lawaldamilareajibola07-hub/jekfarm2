import api from "../axios";

/* =========================================
   LIST MARKETPLACE PRODUCTS
   Customers see vendor products
   GET /commerce/vendor/products
========================================= */

export const getMarketplaceProducts = async (params = {}) => {
  const response = await api.get("/commerce/vendor/products", {
    params,
  });

  return response.data;
};

/* =========================================
   PRODUCT DETAILS
   GET /commerce/vendor/products/{id}
========================================= */

export const getProductDetails = async (productId) => {
  const response = await api.get(`/commerce/vendor/products/${productId}`);

  return response.data;
};

/* =========================================
   SEARCH PRODUCTS
========================================= */

export const searchMarketplaceProducts = async (search) => {
  const response = await api.get("/commerce/vendor/products", {
    params: { search },
  });

  return response.data;
};

/* =========================================
   FILTER BY CATEGORY
========================================= */

export const filterProductsByCategory = async (category) => {
  const response = await api.get("/commerce/vendor/products", {
    params: { category },
  });

  return response.data;
};