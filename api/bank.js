import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://productionbackend2.agreonpay.com.ng/api";

const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

// Get banks
export const getBanks = async () => {
  const headers = await getAuthHeader();

  const response = await axios.get(
    `${BASE_URL}/walletManager/banks`,
    { headers }
  );

  return response.data;
};

// Resolve account
export const resolveAccount = async (bank_code, account_number) => {
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
};