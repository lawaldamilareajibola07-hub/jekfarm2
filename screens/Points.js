import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
  AppState
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WalletBalanceScreen from "./components/WalletBalanceScreen";
import CashBackIcon from "../assets/CashBack.png";
import ReferalIcon from "../assets/Referrals.png";
import SubIcon from "../assets/Subscriptions.png";
import api from "../api/api";

// Transaction icons 
import cardoneImg from "../assets/card-one.png";
import cardtwoImg from "../assets/card-two.png";
import cardthreeImg from "../assets/card-three.png";
import cardfourImg from "../assets/card-four.png";

const Points = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [apiBalance, setApiBalance] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  // Your actual API endpoint
  // No longer using hardcoded API_URL

  // Function to get user email from AsyncStorage
  const getUserEmail = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const userData = JSON.parse(userString);
        return userData.email || userData.Email || userData.user_email;
      }
      return null;
    } catch (error) {
      console.error("Error getting user email:", error);
      return null;
    }
  };

  const fetchTransactions = async (isRefresh = false) => {
    try {
      setDebugInfo("Starting transaction fetch...");

      // First, get the user email
      const userEmail = await getUserEmail();

      if (!userEmail) {
        setError("Please login to view transactions");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      setDebugInfo(`Fetching for email: ${userEmail}`);

      if (!isRefresh) {
        setLoading(true);
      }
      setRefreshing(isRefresh);
      setError(null);

      // CRITICAL: The backend expects JSON in php://input
      // NOT form data, NOT URL encoded, just raw JSON
      const requestBody = {
        email: userEmail.trim()
      };

      setDebugInfo(`Sending request to: /data/pay/get_transactions.php`);

      const response = await api.post('/data/pay/get_transactions.php', requestBody);

      setDebugInfo(`Response status: ${response.status}`);

      const responseData = response.data;

      if (responseData.status === "success") {
        // Set user info from API response
        if (responseData.data && responseData.data.user_info) {
          const userData = responseData.data.user_info;
          setUserInfo(userData);

          // Update balance from API
          if (userData.current_balance !== undefined) {
            const balanceFromAPI = parseFloat(userData.current_balance);
            setApiBalance(balanceFromAPI);
            setDebugInfo(`Balance from API: ${balanceFromAPI}`);

            // Update AsyncStorage with the latest balance
            try {
              const currentUserString = await AsyncStorage.getItem('user');
              if (currentUserString) {
                const currentUser = JSON.parse(currentUserString);
                currentUser.wallet_balance = balanceFromAPI;
                currentUser.balance = balanceFromAPI;
                await AsyncStorage.setItem('user', JSON.stringify(currentUser));
                await AsyncStorage.setItem('walletBalance', balanceFromAPI.toString());
              }
            } catch (storageError) {
              console.error("Error updating balance in storage:", storageError);
            }
          }
        }

        // Transform API transaction data to match your UI
        let transformedTransactions = [];

        // The backend returns transaction_history array
        if (responseData.data && responseData.data.transaction_history && Array.isArray(responseData.data.transaction_history)) {
          transformedTransactions = responseData.data.transaction_history.map((tx, index) => {
            return parseTransactionItem(tx, index);
          });
          setDebugInfo(`Loaded ${transformedTransactions.length} transactions from API`);
        } else {
          setDebugInfo("No transaction_history found in response");
        }

        // Sort transactions by date (newest first)
        transformedTransactions.sort((a, b) => {
          const dateA = a.originalData.created_at ? new Date(a.originalData.created_at) : new Date(0);
          const dateB = b.originalData.created_at ? new Date(b.originalData.created_at) : new Date(0);
          return dateB - dateA; // Newest first
        });

        setTransactions(transformedTransactions);

        // Clear any errors since we succeeded
        setError(null);

        if (transformedTransactions.length === 0) {
          setDebugInfo("No transactions found for this user");
        }
      } else {
        // Handle API error response
        setDebugInfo(`API Error: ${responseData.message}`);
        throw new Error(responseData.message || "API request failed");
      }

    } catch (error) {
      console.error("Fetch error:", error.message);
      setDebugInfo(`Error: ${error.message}`);
      setError(`Failed to load: ${error.message}`);

      // Show error empty state if we have NO transactions
      if (transactions.length === 0) {
        setDebugInfo("No transactions to display");
        setTransactions([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Helper function to parse transaction item
  const parseTransactionItem = (tx, index) => {
    // Determine transaction type and title
    let title = tx.description || "Transaction";
    let type = tx.type || "purchase";

    // Format time from created_at
    const txTime = formatTransactionTime(tx.created_at);

    // Choose icon based on transaction type
    let icon = cardoneImg; // default

    if (type === "credit" || type === "receive") {
      icon = cardfourImg;
    } else if (type === "debit") {
      icon = cardthreeImg;
    }

    // Parse amount
    let amount = 0;
    try {
      amount = parseFloat(tx.amount || "0");
      // For credit transactions, amount should be positive
      // For debit transactions, amount should be negative
      if (type === "debit") {
        amount = -Math.abs(amount);
      } else if (type === "credit" || type === "receive") {
        amount = Math.abs(amount);
      }
    } catch (e) {
      console.warn("Error parsing amount:", tx.amount);
    }

    // Determine color based on type
    const color = (type === "credit" || type === "receive") ? "#10B981" : "#EF4444";

    return {
      id: `tx-${index}-${tx.created_at || Date.now()}`,
      type: type,
      time: txTime,
      title: title,
      amount: amount,
      color: color,
      icon: icon,
      source: tx.source || "Wallet",
      reference: tx.reference || "N/A",
      originalData: tx
    };
  };

  const formatTransactionTime = (createdAt) => {
    if (!createdAt) return "Recently";

    try {
      const txDate = new Date(createdAt);

      if (isNaN(txDate.getTime())) {
        return "Recently";
      }

      const now = new Date();
      const diffMs = now - txDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) {
        return "Just now";
      } else if (diffMins < 60) {
        return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      } else {
        return txDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (e) {
      return "Recently";
    }
  };


  // Fetch data on focus
  useFocusEffect(
    React.useCallback(() => {
      console.log("Screen focused, fetching transactions...");
      fetchTransactions();

      return () => {
        // No polling to stop
      };
    }, [])
  );

  const onRefresh = () => {
    fetchTransactions(true);
  };

  // Quick Access Items
  const quickAccessItems = [
    { title: "Your Cashbacks", icon: CashBackIcon },
    { title: "Your Referrals", icon: ReferalIcon, action: () => navigation.navigate("ReferralScreen") },
    { title: "Subscription", icon: SubIcon, action: () => navigation.navigate("Subscriptions") },
    { title: "History", icon: "📜" },
    { title: "Rewards", icon: "🏆" },
    { title: "Your Cashbacks", icon: "💰" },
    {
      title: "Your Referrals",
      icon: "👥",
      action: () => navigation.navigate("ReferralScreen"),
    },
    {
      title: "Subs",
      icon: "⭐",
      action: () => navigation.navigate("Subscriptions"),
    },
    {
      title: "Create Account",
      icon: "🏦",
      action: () => navigation.navigate("CreateVirtualAccount"),
    }
  ];

  const renderTransactionItem = (tx) => (
    <TouchableOpacity
      key={tx.id}
      style={styles.transactionItem}
      onPress={() => navigation.navigate("ReceiptScreen", { transaction: tx })}
      activeOpacity={0.7}
    >
      <Image
        source={tx.icon}
        style={styles.txIcon}
      />
      <View style={styles.txDetails}>
        <Text style={styles.txTitle} numberOfLines={1}>
          {tx.title}
        </Text>
        <Text style={styles.txTime}>{tx.time}</Text>
        {tx.source && (
          <Text style={styles.txSource}>Via {tx.source.replace('_', ' ')}</Text>
        )}
        {tx.reference && tx.reference !== "N/A" && (
          <Text style={styles.txReference}>Ref: {tx.reference}</Text>
        )}
      </View>
      <Text style={[
        styles.txAmount,
        tx.amount > 0 ? styles.positive : styles.negative
      ]}>
        {tx.amount > 0 ? "+" : ""}₦{Math.abs(tx.amount).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 50 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#22c55e"]}
            tintColor="#22c55e"
          />
        }
      >
        <WalletBalanceScreen apiBalance={apiBalance} />

        <View style={styles.cardContainer}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Access</Text>
              <View style={styles.titleUnderline} />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickAccessRow}
            >
              {quickAccessItems.map((item, idx) => (
                <TouchableOpacity
                  key={`quick-${idx}`}
                  style={styles.quickAccessItem}
                  onPress={item.action}
                  activeOpacity={0.7}
                >
                  <View style={styles.quickAccessIconContainer}>
                    {typeof item.icon === "string" ? (
                      <Text style={styles.quickAccessIconText}>{item.icon}</Text>
                    ) : (
                      <Image
                        source={item.icon}
                        style={styles.quickAccessImage}
                      />
                    )}
                  </View>
                  <Text style={styles.quickAccessText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.headerRow}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                <View style={styles.titleUnderline} />
              </View>
              <TouchableOpacity onPress={() => navigation.navigate("TransactionItem")}>
                {/* <Text style={styles.seeAll}>See all</Text> */}
              </TouchableOpacity>
            </View>



            {loading && transactions.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#22c55e" />
                <Text style={styles.loadingText}>
                  Loading transactions...
                </Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Connection Issue</Text>
                <Text style={styles.errorText}>{error}</Text>
                {__DEV__ && debugInfo ? (
                  <Text style={styles.debugInfoText}>{debugInfo}</Text>
                ) : null}
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => fetchTransactions()}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
                {error.includes("Authentication") && (
                  <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: '#EF4444', marginTop: 10 }]}
                    onPress={() => navigation.navigate("Login")}
                  >
                    <Text style={styles.retryButtonText}>Login Again</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : transactions.length > 0 ? (
              <View style={styles.transactionsList}>
                {transactions.slice(0, 10).map(renderTransactionItem)}
                <View style={styles.dataSourceInfo}>
                  <Text style={styles.dataSourceText}>
                    Showing {transactions.length} transactions • Auto-refresh every 30s
                  </Text>
                  {apiBalance !== null && (
                    <Text style={styles.balanceInfo}>
                      Current Balance: ₦{apiBalance.toLocaleString()}
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No transactions yet</Text>
                <Text style={styles.emptySubtext}>
                  Your transactions will appear here automatically
                </Text>
                {__DEV__ && debugInfo ? (
                  <Text style={styles.debugInfoText}>{debugInfo}</Text>
                ) : null}
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => fetchTransactions()}
                >
                  <Text style={styles.emptyButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Your original styles with one addition
const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#F8F9FA" },
  container: { flex: 1, paddingTop: 0, backgroundColor: "transparent" },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -40,
    paddingTop: 24,
    overflow: "hidden",
  },
  section: { padding: 16, paddingTop: 0, paddingHorizontal: 24 },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Inter_400Regular",
    color: "#1F2937",
    marginBottom: 7,
    marginTop: 16
  },
  titleUnderline: {
    width: 40,
    height: 3,
    backgroundColor: "#22c55e",
    borderRadius: 2
  },
  quickAccessRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: 4,
    paddingRight: 12,
    gap: 12
  },
  quickAccessItem: {
    width: 140,
    height: 150,
    backgroundColor: "#f1f3f2ff",
    padding: 14,
    borderRadius: 12,
    marginRight: 12,
    marginTop: 15,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'flex-start'
  },
  quickAccessIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 20,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  quickAccessImage: {
    width: 40,
    height: 40,
    resizeMode: "contain"
  },
  quickAccessIconText: {
    fontSize: 24
  },
  quickAccessText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_400Regular",
    color: "#374151",
    textAlign: "center"
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
    marginTop: 20
  },
  seeAll: {
    color: "#22c55e",
    fontWeight: "600",
    fontSize: 14
  },
  debugContainer: {
    backgroundColor: "#FEF3C7",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  debugText: {
    color: "#92400E",
    fontSize: 10,
    fontFamily: "monospace",
  },
  debugInfoText: {
    color: "#6B7280",
    fontSize: 11,
    fontFamily: "monospace",
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic'
  },
  connectionStatus: {
    backgroundColor: "#F0F9FF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center'
  },
  connectionText: {
    color: "#0369A1",
    fontSize: 12,
    fontWeight: "500",
    textAlign: 'center'
  },
  debugStatus: {
    color: "#22c55e",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 4,
    fontStyle: 'italic'
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f1f3f2ff",
    borderRadius: 12,
    marginBottom: 10,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginRight: 12
  },
  txDetails: {
    flex: 1
  },
  txTitle: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_400Regular",
    color: "#1F2937",
    marginBottom: 4
  },
  txTime: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF"
  },
  txSource: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    marginTop: 2
  },
  txReference: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    marginTop: 1
  },
  txAmount: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    fontWeight: "700",
    letterSpacing: -0.3
  },
  positive: {
    color: "#22c55e"
  },
  negative: {
    color: "#EF4444"
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },
  errorContainer: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorTitle: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 160,
    alignItems: "center",
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  dataSourceInfo: {
    padding: 12,
    alignItems: "center",
    marginTop: 10,
  },
  dataSourceText: {
    color: "#22c55e",
    fontSize: 12,
    fontStyle: "italic",
  },
  balanceInfo: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  transactionsList: {
    marginTop: 5,
  }
});

export default Points;