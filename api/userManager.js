import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://productionbackend2.agreonpay.com.ng/api";

/**
 * Get Authorization Header
 */
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token not found");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Set Transaction PIN
 */
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
      message: error.response?.data?.message || "Failed to set transaction PIN",
    };
  }
};

/**
 * Change Transaction PIN
 */
export const changeTransactionPin = async ({
  current_pin,
  new_pin,
  new_pin_confirmation,
}) => {
  try {
    const headers = await getAuthHeader();

    const response = await axios.post(
      `${BASE_URL}/userManager/pin/change`,
      {
        current_pin,
        new_pin,
        new_pin_confirmation,
      },
      { headers }
    );

    return response.data;
  } catch (error) {
    console.log("Change PIN Error:", error.response?.data || error.message);

    return {
      status: "error",
      message:
        error.response?.data?.message || "Failed to change transaction PIN",
    };
  }
};

/**
 * Enable Biometrics
 */
export const enableBiometrics = async () => {
  try {
    const headers = await getAuthHeader();

    const response = await axios.post(
      `${BASE_URL}/userManager/biometric/enable`,
      {},
      { headers }
    );

    return response.data;
  } catch (error) {
    console.log("Biometric Enable Error:", error.response?.data || error.message);

    return {
      status: "error",
      message:
        error.response?.data?.message || "Failed to enable biometric login",
    };
  }
};