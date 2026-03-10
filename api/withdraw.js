import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://productionbackend2.agreonpay.com.ng/api";

const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token missing");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};
export const confirmWithdrawal = async (reference, pin) => {
  try {
    const headers = await getAuthHeader();

    const response = await axios.post(
      `${BASE_URL}/walletManager/withdrawals/${reference}/confirm-2fa`,
      { pin },
      { headers }
    );

    return response.data;

  } catch (error) {
    console.log("Confirm Withdrawal Error:", error.response?.data);

    return {
      status: "error",
      message: error.response?.data?.message || "Withdrawal failed",
    };
  }
};
// Initiate Withdrawal
export const initiateWithdrawal = async (data) => {
  const headers = await getAuthHeader();

  const response = await axios.post(
    `${BASE_URL}/walletManager/withdrawals/initiate`,
    data,
    { headers }
  );

  return response.data;
};

// Confirm Withdrawal OTP
export const confirmWithdrawal = async (reference, otp) => {
  const headers = await getAuthHeader();

  const response = await axios.post(
    `${BASE_URL}/walletManager/withdrawals/${reference}/confirm-2fa`,
    { otp },
    { headers }
  );

  return response.data;
};