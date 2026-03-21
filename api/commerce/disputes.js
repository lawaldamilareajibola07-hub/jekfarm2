import api from "../axios";

/* =========================
   LIST DISPUTES
========================= */

export const getDisputes = async () => {
  const response = await api.get("/commerce/disputes");
  return response.data;
};

/* =========================
   CREATE DISPUTE
========================= */

export const createDispute = async (data) => {
  const response = await api.post("/commerce/disputes", data);
  return response.data;
};

/* =========================
   DISPUTE DETAILS
========================= */

export const getDisputeDetails = async (disputeId) => {
  const response = await api.get(`/commerce/disputes/${disputeId}`);
  return response.data;
};