const ENV = {
  LOCAL: "local",
  PREPROD: "preprod",
};

const CURRENT_ENV = ENV.PREPROD;

const BASE_URLS = {
  local: "http://10.0.2.2:8000/api", // Android emulator safe
  preprod: "https://productionbackend2.agreonpay.com.ng/api",
};

export const BASE_URL = BASE_URLS[CURRENT_ENV];