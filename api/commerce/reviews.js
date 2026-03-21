import api from "../axios";

/* =========================
   CREATE REVIEW
========================= */

export const createReview = async (data) => {
  const response = await api.post("/commerce/reviews", data);
  return response.data;
};

/* =========================
   GET PRODUCT REVIEWS
========================= */

export const getProductReviews = async (productId) => {
  const response = await api.get(`/commerce/products/${productId}/reviews`);
  return response.data;
};

/* =========================
   MY REVIEWS
========================= */

export const getMyReviews = async () => {
  const response = await api.get("/commerce/my-reviews");
  return response.data;
};