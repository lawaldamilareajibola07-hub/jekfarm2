import api from "../axios";

/* =========================
   GET ADDRESSES
========================= */

export const getAddresses = async () => {
  const response = await api.get("/v1/commerce/addresses");
  return response.data;
};

/* =========================
   ADD ADDRESS
========================= */

export const addAddress = async (data) => {
  const response = await api.post("/commerce/addresses", data);
  return response.data;
};

/* =========================
   UPDATE ADDRESS
========================= */

export const updateAddress = async (addressId, data) => {
  const response = await api.put(`/commerce/addresses/${addressId}`, data);
  return response.data;
};

/* =========================
   DELETE ADDRESS
========================= */

export const deleteAddress = async (addressId) => {
  const response = await api.delete(`/commerce/addresses/${addressId}`);
  return response.data;
};