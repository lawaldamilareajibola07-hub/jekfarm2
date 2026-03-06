// /api/wallet.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";

// -------------------------
// Base URL (adjust per environment)
// -------------------------
const BASE_URL = "https://preprodbackend.agreonpay.com.ng/api"; // change for local/dev

// -------------------------
// Helper: get Authorization header
// -------------------------
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("User token not found");
  return { Authorization: `Bearer ${token}` };
};

// -------------------------
// Get Wallet Balances
// -------------------------
export const getWalletBalances = async () => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.get(`${BASE_URL}/walletManager/balances`, { headers });
    return response.data;
  } catch (error) {
    console.error("Wallet fetch error:", error.response?.data || error.message);
    return { status: "error", message: error.response?.data?.message || error.message };
  }
};

// -------------------------
// Get Transactions
// -------------------------
export const getTransactions = async () => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.get(`${BASE_URL}/walletManager/transactions`, { headers });
    return response.data;
  } catch (error) {
    console.error("Get Transactions Error:", error.response?.data || error.message);
    return { status: "error", message: error.response?.data?.message || error.message };
  }
};

// -------------------------
// Idempotency Key Helpers
// -------------------------
export const generateIdempotencyKey = async () => {
  const key = uuidv4();
  await AsyncStorage.setItem("pending_idempotency_key", key);
  return key;
};

export const getPendingIdempotencyKey = async () => {
  return await AsyncStorage.getItem("pending_idempotency_key");
};

export const clearPendingIdempotencyKey = async () => {
  await AsyncStorage.removeItem("pending_idempotency_key");
};

// -------------------------
// Internal Wallet Transfer
// -------------------------
export const fundWallet = async ({ to, amount, currency = "NGN", purpose = "Wallet funding" }) => {
  try {
    if (!to) throw new Error("Receiver email or phone is required");
    if (!amount || amount <= 0) throw new Error("Invalid amount");

    const headers = await getAuthHeader();

    let idempotencyKey = await getPendingIdempotencyKey();
    if (!idempotencyKey) idempotencyKey = await generateIdempotencyKey();

    const response = await axios.post(
      `${BASE_URL}/walletManager/transfer`,
      {
        to,
        currency,
        amount,
        purpose,
        idempotency_key: idempotencyKey,
      },
      { headers }
    );

    if (response.data.status === "success") await clearPendingIdempotencyKey();

    return response.data;
  } catch (error) {
    console.error("Fund Wallet Error:", error.response?.data || error.message);
    return {
      status: "error",
      code: error.response?.data?.code || "UNKNOWN_ERROR",
      message: error.response?.data?.message || error.message,
    };
  }
};

// -------------------------
// Create or Get Virtual Account (NGN)
// -------------------------
export const getOrCreateVirtualAccount = async () => {
  try {
    const headers = await getAuthHeader();

    const response = await axios.post(
      `${BASE_URL}/walletManager/virtual-accounts/ngn`,
      {},
      { headers }
    );

    return response.data;

  } catch (error) {
    console.error("VA ERROR:", error.response?.data || error.message);

    return {
      status: "error",
      code: error.response?.data?.code || "UNKNOWN_ERROR",
      message: error.response?.data?.message || error.message,
    };
  }
};

// -------------------------
// Safe Wallet Funding Flow (Self-funding via Monnify)
// -------------------------
export const initiateWalletFunding = async () => {
  const va = await getOrCreateVirtualAccount();
  if (va.status !== "success") return va;

  return {
    status: "success",
    message: "Virtual account ready for funding",
    data: va.data,
  };
};

// -------------------------
// Backward-compatible aliases
// -------------------------
export const createVirtualAccount = getOrCreateVirtualAccount;