import "react-native-get-random-values";
import apiClient from "./axios";
import { v4 as uuidv4 } from "uuid";

export const generateIdempotencyKey = () => uuidv4();

export const transferFunds = async ({
  recipient,
  amount,
  currency,
  purpose,
  idempotency_key,
  pin,
  confirm,
}) => {
  try {

    const body = {
      to: recipient,
      amount,
      currency,
      purpose,
    };

    if (confirm && pin) {
      body.pin = pin;
    }

    if (!confirm) {
      body.idempotency_key = idempotency_key;
    }

    const response = await apiClient.post(
      "/walletManager/transfer",
      body
    );

    return response.data;

  } catch (error) {

    console.log(
      "Transfer API error:",
      error.response?.data || error.message
    );

    if (error.response && error.response.data) {
      return error.response.data;
    }

    return {
      status: "error",
      message: "Network error",
    };
  }
};