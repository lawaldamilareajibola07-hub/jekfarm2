// src/api/api.js - UPDATED FOR WORKING API ENDPOINT
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://jekfarms.com.ng";

// Create axios instance with your base URL
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  timeout: 30000,
  validateStatus: (status) => status >= 200 && status < 500,
});

// Add auth/session handling
api.interceptors.request.use(async (config) => {
  const sessionCookie = await AsyncStorage.getItem("session_cookie");
  if (sessionCookie) {
    config.headers.Cookie = `PHPSESSID=${sessionCookie}`;
  }

  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;  // Removed FormData handling since we're using JSON now
});

// Store session from response if present
api.interceptors.response.use(
  async (response) => {
    const setCookieHeader = response.headers["set-cookie"];
    if (setCookieHeader) {
      const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
      const phpSess = cookies.find((cookie) =>
        cookie.includes("PHPSESSID=")
      );
      if (phpSess) {
        const match = phpSess.match(/PHPSESSID=([^;]+)/);
        if (match) {
          await AsyncStorage.setItem("session_cookie", match[1]);
        }
      }
    }
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// REAL Wallet API Service - UPDATED FOR WORKING FORMAT
export const walletService = {
  // Initialize REAL wallet funding via Monnify
  initiateWalletFunding: async (amount, email) => {
    try {
      console.log("Initializing wallet funding:", { amount, email });

      // Try multiple possible keys for user data
      const possibleKeys = ['userData', 'user', 'user_info', 'auth_user'];
      let userId = null;

      for (const key of possibleKeys) {
        const userData = await AsyncStorage.getItem(key);
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            userId = parsedData.id || parsedData.user_id || parsedData.uid;
            console.log(`Found user ID in key "${key}":`, userId);
            if (userId) break;
          } catch (error) {
            console.error(`Error parsing data from "${key}":`, error);
          }
        }
      }

      if (!userId) {
        throw new Error("User ID not found. Please login again.");
      }

      if (!email) {
        throw new Error("Email is required for wallet funding");
      }

      if (!amount || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }


      const requestData = {
        action: 'init',
        user_id: parseInt(userId),  // Send as integer (25), not string
        amount: parseInt(amount),   // Send as integer (5000), not string
        email: email
      };

      console.log("Sending payment as JSON:", requestData);
      console.log("Full API URL:", `${BASE_URL}/data/pay/permanent.php`);


      const response = await api.post(
        '/data/pay/monnify.php',  // Correct endpoint path
        requestData,  // Send JSON, not FormData
        {
          headers: {
            'Content-Type': 'application/json',  // Explicit JSON header
            'Accept': 'application/json',
          },
          timeout: 15000,
        }
      );

      console.log("REAL Monnify init response status:", response.status);
      console.log("REAL Monnify init response data:", response.data);

      // Handle response
      const responseData = response.data;


      if (responseData.status === 'success' && responseData.checkoutUrl) {
        return {
          success: true,
          checkoutUrl: responseData.checkoutUrl,
          transactionReference: responseData.reference,  // Field is "reference", not "transactionReference"
          message: responseData.message || "Payment initialized successfully"
        };
      } else if (responseData.status === 'error') {
        throw new Error(responseData.message || "Payment initialization failed");
      } else {
        throw new Error(responseData.message || "Failed to initialize payment");
      }

    } catch (error) {
      console.error("Error initiating REAL wallet funding:", error);

      // Check if it's a CORS error
      if (error.message.includes('Network Error') || error.message.includes('CORS')) {
        throw new Error("CORS error: Please check server configuration or contact support.");
      }

      // Check if it's a timeout error
      if (error.message === 'Request timeout') {
        throw new Error('Server is taking too long to respond. Please try again.');
      }

      let errorMessage = error.message;

      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      throw new Error(errorMessage);
    }
  },

  // Verify REAL transaction status
  verifyTransaction: async (transactionReference) => {
    try {
      console.log("REAL: Verifying transaction:", transactionReference);


      const possibleKeys = ['userData', 'user', 'user_info', 'auth_user'];
      let userId = null;

      for (const key of possibleKeys) {
        const userData = await AsyncStorage.getItem(key);
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            userId = parsedData.id || parsedData.user_id || parsedData.uid;
            if (userId) break;
          } catch (error) {
            console.error(`Error parsing data from "${key}":`, error);
          }
        }
      }

      if (!userId) {
        throw new Error("User ID not found. Please login again.");
      }


      const requestData = {
        action: 'verify',
        transactionReference: transactionReference,
        user_id: parseInt(userId)  // Send as integer
      };

      console.log("Verifying with URL:", `${BASE_URL}/data/pay/permanent.php`);

      const response = await api.post(
        '/data/pay/permanent.php',  // Correct endpoint path
        requestData,  // Send JSON, not FormData
        {
          headers: {
            'Content-Type': 'application/json',  // Explicit JSON header
            'Accept': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log("REAL Verify response:", response.data);

      const responseData = response.data;

      if (responseData.status === 'success') {
        return {
          success: true,
          status: 'completed',
          message: responseData.message || "Transaction verified successfully",
          amount: responseData.amount,
          walletBalance: responseData.walletBalance
        };
      } else if (responseData.status === 'pending') {
        return {
          success: false,
          status: 'pending',
          message: responseData.message || "Transaction verification pending"
        };
      } else {
        return {
          success: false,
          status: 'failed',
          message: responseData.message || "Transaction verification failed"
        };
      }

    } catch (error) {
      console.error("Error verifying REAL transaction:", error);

      if (error.message === 'Request timeout') {
        throw new Error('Verification timeout. Please try again.');
      }

      let errorMessage = error.message;

      if (error.response) {
        console.error("Verify response status:", error.response.status);
        console.error("Verify response data:", error.response.data);
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      }

      throw new Error(errorMessage);
    }
  },

  // Poll REAL transaction status
  pollTransactionStatus: async (transactionReference, maxAttempts = 20, interval = 2000) => {
    console.log(`Polling transaction ${transactionReference}...`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(` Poll attempt ${attempt}/${maxAttempts}`);

        const result = await walletService.verifyTransaction(transactionReference);

        if (result.status === 'completed') {
          console.log("Transaction completed successfully!");
          return {
            success: true,
            status: 'completed',
            message: result.message,
            amount: result.amount,
            walletBalance: result.walletBalance
          };
        }

        if (result.status === 'failed') {
          console.log("Transaction failed:", result.message);
          return {
            success: false,
            status: 'failed',
            message: result.message || "Transaction failed"
          };
        }

        if (attempt < maxAttempts) {
          console.log(`Transaction pending, waiting ${interval}ms...`);
          await new Promise(resolve => setTimeout(resolve, interval));
        }

      } catch (error) {
        console.error(`Poll attempt ${attempt} failed:`, error.message);
        if (error.message.includes("failed") || error.message.includes("cancelled") || error.message.includes("timeout")) {
          throw error;
        }
      }
    }

    return {
      success: false,
      status: 'timeout',
      message: "Transaction verification timeout"
    };
  },
};

export default api;