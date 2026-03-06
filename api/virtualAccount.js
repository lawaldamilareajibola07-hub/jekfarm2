import api from "./axios";

export const createVirtualAccount = async () => {
  const response = await api.post(
    "/walletManager/virtual-accounts/ngn"
  );

  return response?.data;
};