import api from "./axios";
import * as SecureStore from "expo-secure-store";

export const registerUser = async (data) => {
  const response = await api.post("/userManager/register", data);

  const token = response?.data?.data?.token;

  if (token) {
    await SecureStore.setItemAsync("token", token);
  }

  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post("/userManager/login", data);

  const token = response?.data?.data?.token;

  if (token) {
    await SecureStore.setItemAsync("token", token);
  }

  return response.data;
};

export const logoutUser = async () => {
  try {
    await api.post("/userManager/logout");
  } catch (error) {
    // Ignore API error, still clear token locally
    console.log("Logout API failed, clearing token locally.");
  } finally {
    await SecureStore.deleteItemAsync("token");
  }
};