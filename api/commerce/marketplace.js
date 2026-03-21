import api from "../axios";

/* =========================================
   LIST MARKETPLACE PRODUCTS
   Customers see all active vendor products
   GET /commerce/marketplace/products
========================================= */
export const getMarketplaceProducts = async (params = {}) => {
  const response = await api.get("/commerce/marketplace/products", {
    params,
  });
  return response.data;
};

/* =========================================
   PRODUCT DETAILS
   GET /commerce/marketplace/products/{product_id}
========================================= */
export const getProductDetails = async (productId) => {
  const response = await api.get(`/commerce/marketplace/products/${productId}`);
  return response.data;
};

/* =========================================
   SEARCH PRODUCTS
   GET /commerce/marketplace/products?search=millet
========================================= */
export const searchMarketplaceProducts = async (searchTerm) => {
  const response = await api.get("/commerce/marketplace/products", {
    params: { search: searchTerm },
  });
  return response.data;
};

/* =========================================
   FILTER BY CATEGORY
   GET /commerce/marketplace/products?category=grains
========================================= */
export const filterProductsByCategory = async (category) => {
  const response = await api.get("/commerce/marketplace/products", {
    params: { category },
  });
  return response.data;
};

/* =========================================
   VIEW PRODUCTS FROM A SPECIFIC VENDOR
   GET /commerce/marketplace/products?vendor_id=uuid
========================================= */
export const getVendorMarketplaceProducts = async (vendorId) => {
  const response = await api.get("/commerce/marketplace/products", {
    params: { vendor_id: vendorId },
  });
  return response.data;
};

/* =========================================
   PAGINATION
   GET /commerce/marketplace/products?page=2
========================================= */
export const getMarketplaceProductsByPage = async (page = 1) => {
  const response = await api.get("/commerce/marketplace/products", {
    params: { page },
  });
  return response.data;
};