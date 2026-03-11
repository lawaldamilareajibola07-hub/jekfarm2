import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://productionbackend2.agreonpay.com.ng/api";

/**
 * Get Authorization Header
 */
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token missing");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Fetch list of banks
 */
export const fetchBanks = async () => {
  try {
    const headers = await getAuthHeader();

    const response = await axios.get(
      `${BASE_URL}/walletManager/banks`,
      { headers }
    );

    return response.data;

  } catch (error) {
    console.log("Fetch Banks Error:", error.response?.data || error.message);

    return {
      status: "error",
      message: error.response?.data?.message || "Unable to fetch banks",
    };
  }
};

/**
 * Resolve account number
 */
export const resolveAccountNumber = async (bank_code, account_number) => {
  try {
    const headers = await getAuthHeader();

    const response = await axios.post(
      `${BASE_URL}/walletManager/resolve-account`,
      {
        bank_code,
        account_number,
      },
      { headers }
    );

    return response.data;

  } catch (error) {
    console.log("Resolve Account Error:", error.response?.data || error.message);

    return {
      status: "error",
      message:
        error.response?.data?.message || "Account resolution failed",
    };
  }
};