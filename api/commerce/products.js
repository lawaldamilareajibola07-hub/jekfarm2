// API/commerce/products.js
import { getMarketplaceProducts } from "./marketplace"; // correct path

export const getProductDetail = async (productId) => {
  try {
    // fetch all products
    const res = await getMarketplaceProducts({});
    const allProducts = res?.data || [];

    // find the clicked product
    const product = allProducts.find((p) => p.id === productId);

    return product || null;
  } catch (error) {
    console.log("getProductDetail error:", error);
    return null;
  }
};