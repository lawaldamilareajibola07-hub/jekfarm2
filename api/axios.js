import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { BASE_URL } from "./config";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token safely
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("token");

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    console.log("API REQUEST:", config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response handler
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Network error (no response from server)
    if (!error.response) {
      return Promise.reject({
        status: null,
        message: "Network error. Check connection.",
        code: null,
        request_id: null,
        errors: null,
      });
    }

    const { status, data } = error.response;

    // Auto logout on unauthorized
    if (status === 401) {
      await SecureStore.deleteItemAsync("token");
      console.log("Unauthorized. Token cleared.");
    }

    return Promise.reject({
      status,
      message: data?.message || "Something went wrong",
      code: data?.code || null,
      request_id: data?.meta?.request_id || null,
      errors: data?.errors || null,
    });
  }
);

export default api;