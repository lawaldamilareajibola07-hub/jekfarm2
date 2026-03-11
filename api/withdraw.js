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
 * Generate unique idempotency key
 */
const generateIdempotencyKey = () => {
  return `wd-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
};

/**
 * Initiate Withdrawal
 */
export const initiateWithdrawal = async ({
  currency,
  amount,
  bank_code,
  account_number,
  account_name,
  narration,
}) => {
  try {
    const headers = await getAuthHeader();

    const payload = {
      currency,
      amount,
      bank_code,
      account_number,
      account_name,
      narration,
      idempotency_key: generateIdempotencyKey(),
    };

    const response = await axios.post(
      `${BASE_URL}/walletManager/withdrawals/initiate`,
      payload,
      { headers }
    );

    return response.data;

  } catch (error) {
    console.log("Initiate Withdrawal Error:", error.response?.data || error.message);

    return {
      status: "error",
      code: error.response?.data?.code,
      message: error.response?.data?.message || "Failed to initiate withdrawal",
    };
  }
};

/**
 * Confirm Withdrawal with PIN
 */
export const confirmWithdrawalPin = async (reference, pin) => {
  try {
    const headers = await getAuthHeader();

    const response = await axios.post(
      `${BASE_URL}/walletManager/withdrawals/${reference}/confirm-2fa`,
      { pin },
      { headers }
    );

    return response.data;

  } catch (error) {
    console.log("Confirm Withdrawal Error:", error.response?.data || error.message);

    return {
      status: "error",
      code: error.response?.data?.code,
      message: error.response?.data?.message || "Withdrawal confirmation failed",
    };
  }
};