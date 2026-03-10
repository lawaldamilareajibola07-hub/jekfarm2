import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://productionbackend2.agreonpay.com.ng/api";

const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const setTransactionPin = async (pin, password) => {
  try {
    const headers = await getAuthHeader();

    const response = await axios.post(
      `${BASE_URL}/userManager/pin/set`,
      {
        pin,
        pin_confirmation: pin,
        password,
      },
      { headers }
    );

    return response.data;
  } catch (error) {
    console.log("Set PIN Error:", error.response?.data || error.message);

    return {
      status: "error",
      message: error.response?.data?.message || error.message,
    };
  }

const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("Token not found");
  return { Authorization: Bearer ${token} };
};

export const changeTransactionPin = async ({ current_pin, new_pin, new_pin_confirmation }) => {
  try {
    const headers = await getAuthHeader();
    const res = await axios.post(
      ${BASE_URL}/userManager/pin/change,
      { current_pin, new_pin, new_pin_confirmation },
      { headers }
    );
    return res.data;
  } catch (error) {
    console.log("Change PIN API Error:", error.response?.data || error.message);
    return {
      status: "error",
      message: error.response?.data?.message || error.message,
    };
  }
};
};