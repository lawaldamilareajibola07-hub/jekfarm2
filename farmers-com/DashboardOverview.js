import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
  AppState
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store"; // Import SecureStore
import { useNavigation } from "@react-navigation/native";

const BASE_URL = "https://productionbackend2.agreonpay.com.ng/api";

const DashboardOverview = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [vendorId, setVendorId] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  // Timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("Loading took too long. Please check your connection.");
      }
    }, 15000);
    return () => clearTimeout(timeout);
  }, [loading]);

  // Load token and vendor ID
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Read token from SecureStore (where it was stored during registration)
        let tokenStr = await SecureStore.getItemAsync("token");
        console.log("🔑 Token from SecureStore:", tokenStr ? "present" : "missing");

        // Fallback: try AsyncStorage if SecureStore is empty (for old users)
        if (!tokenStr) {
          tokenStr = await AsyncStorage.getItem("token");
          console.log("🔑 Token from AsyncStorage (fallback):", tokenStr ? "present" : "missing");
        }

        const userDataStr = await AsyncStorage.getItem("user");
        console.log("📦 User data from AsyncStorage:", userDataStr ? "present" : "missing");

        if (!userDataStr || !tokenStr) {
          Alert.alert("Session Expired", "Please log in again.", [
            { text: "OK", onPress: () => navigation.replace("Login") }
          ]);
          setLoading(false);
          return;
        }

        setToken(tokenStr);

        const user = JSON.parse(userDataStr);
        console.log("👤 Parsed user object:", user);

        // Extract vendor ID – add more possible keys if needed
        const foundId = user.id || user.user_id || user.farmer_id || user.uid || user.vendor_id;
        console.log("🆔 Extracted ID:", foundId);

        if (foundId) {
          const vendorIdStr = foundId.toString();
          setVendorId(vendorIdStr);
          await fetchAllData(vendorIdStr, tokenStr);
        } else {
          console.warn("⚠️ No valid ID found in user:", user);
          setError("Vendor ID not found. Please re-login.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Load user error:", err);
        setError("Failed to load user information");
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  // Refresh when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === "active" && vendorId && token) {
        console.log("App came to foreground, refreshing data...");
        fetchAllData(vendorId, token);
      }
    };
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [vendorId, token]);

  // Helper for auth headers
  const getHeaders = (authToken) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
  });

  // Fetch both overview and transactions
  const fetchAllData = async (vendorId, authToken) => {
    if (!vendorId || !authToken) {
      console.warn("fetchAllData called with missing params");
      return;
    }

    console.log("🔄 Fetching data for vendorId:", vendorId);
    setLoading(true);
    setError(null);

    try {
      const timestamp = Date.now();

      // Overview endpoint
      const overviewUrl = `${BASE_URL}/commerce/vendor/overview?vendor_id=${vendorId}&_=${timestamp}`;
      console.log("📡 Overview URL:", overviewUrl);
      const overviewRes = await fetch(overviewUrl, { headers: getHeaders(authToken) });
      console.log("📡 Overview response status:", overviewRes.status);
      const overviewText = await overviewRes.text();
      console.log("📄 Overview raw response:", overviewText);
      let overviewJson;
      try {
        overviewJson = JSON.parse(overviewText);
      } catch {
        overviewJson = null;
        console.error("Failed to parse overview JSON");
      }

      // Transactions endpoint
      const txnUrl = `${BASE_URL}/commerce/vendor/dashboard/transactions?vendor_id=${vendorId}&_=${timestamp}`;
      console.log("📡 Transactions URL:", txnUrl);
      const txnRes = await fetch(txnUrl, { headers: getHeaders(authToken) });
      console.log("📡 Transactions response status:", txnRes.status);
      const txnText = await txnRes.text();
      console.log("📄 Transactions raw response:", txnText);
      let txnJson;
      try {
        txnJson = JSON.parse(txnText);
      } catch {
        txnJson = null;
        console.error("Failed to parse transactions JSON");
      }

      // Process overview
      if (overviewJson?.status === "success" && overviewJson.data?.overview) {
        const ov = overviewJson.data.overview;
        setDashboardData({
          sales: ov.sales || "0.00",
          revenue: ov.revenue || "0.00",
          returns: ov.returns || "0.00",
          complete_orders: ov.complete_orders || "0",
          total_customers: ov.total_customers || 0,
          new_customers: ov.new_customers || 0,
        });
      } else {
        console.warn("Overview API error or missing data", overviewJson);
        setDashboardData({
          sales: "0.00",
          revenue: "0.00",
          returns: "0.00",
          complete_orders: "0",
          total_customers: 0,
          new_customers: 0,
        });
      }

      // Process transactions
      if (txnJson?.status === "success" && Array.isArray(txnJson.data?.transactions)) {
        setTransactions(txnJson.data.transactions);
      } else {
        console.warn("Transactions API error or missing data", txnJson);
        setTransactions([]);
      }

      setLastUpdateTime(new Date());
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch data. Check your connection.");
      if (!dashboardData) {
        setDashboardData({
          sales: "0.00",
          revenue: "0.00",
          returns: "0.00",
          complete_orders: "0",
          total_customers: 0,
          new_customers: 0,
        });
      }
      if (transactions.length === 0) setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (vendorId && token) {
      await fetchAllData(vendorId, token);
    }
    setRefreshing(false);
  };

  // ----- Formatting helpers (unchanged) -----
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₦0";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "₦0";
    return `₦${num.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return "0";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "0";
    if (num % 1 === 0) return num.toLocaleString("en-NG");
    return num.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const formatLastUpdate = () => {
    if (!lastUpdateTime) return "Never";
    const now = new Date();
    const diffMs = now - lastUpdateTime;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    return lastUpdateTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    if (!status) return "#6b7280";
    const s = status.toLowerCase();
    if (s === "completed") return "#10b981";
    if (s === "pending") return "#f59e0b";
    if (s === "failed") return "#ef4444";
    return "#6b7280";
  };

  const getTransactionTypeInfo = (type, description = "") => {
    if (!type && description?.toLowerCase().includes("received from order")) {
      return { icon: "arrow-down-circle", color: "#10b981", label: "Sale" };
    }
    if (!type) return { icon: "swap-horizontal", color: "#6b7280", label: "Transaction" };
    const t = type.toLowerCase();
    if (t === "credit")
      return { icon: "arrow-down-circle", color: "#10b981", label: "Sale" };
    if (t === "debit")
      return { icon: "arrow-up-circle", color: "#ef4444", label: "Payment" };
    if (description?.toLowerCase().includes("received"))
      return { icon: "arrow-down-circle", color: "#10b981", label: "Sale" };
    return { icon: "swap-horizontal", color: "#6b7280", label: "Transaction" };
  };

  const renderTransactionItem = ({ item, index }) => {
    const typeInfo = getTransactionTypeInfo(item.transaction_type, item.description);
    const isMoneyIn = typeInfo.label === "Sale";
    return (
      <View style={styles.transactionCard} key={item.transaction_id || index}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionType}>
            <Ionicons name={typeInfo.icon} size={20} color={typeInfo.color} />
            <Text style={[styles.transactionTypeText, { color: typeInfo.color }]}>
              {typeInfo.label}
            </Text>
          </View>
          <Text
            style={[
              styles.transactionAmount,
              isMoneyIn ? styles.creditAmount : styles.debitAmount,
            ]}
          >
            {isMoneyIn ? "+" : "-"} {formatCurrency(item.amount)}
          </Text>
        </View>

        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDescription} numberOfLines={1}>
            {item.description || "No description available"}
          </Text>

          <View style={styles.transactionMeta}>
            <Text style={styles.transactionId}>
              ID: {item.transaction_id || `TXN-${index}`}
            </Text>
            {item.items_count > 0 && (
              <View style={styles.itemsCountContainer}>
                <Ionicons name="cube-outline" size={12} color="#6b7280" />
                <Text style={styles.itemsCount}>
                  {item.items_count} item{item.items_count > 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.transactionFooter}>
            <View style={styles.transactionDate}>
              <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
              <Text style={styles.transactionDateText}>
                {formatDate(item.transaction_date)}
              </Text>
              <Text style={styles.transactionTimeText}>
                {formatTime(item.transaction_date)}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(item.status)}20` },
              ]}
            >
              <View
                style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]}
              />
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status || "Pending"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderTransactionsSection = () => (
    <View style={styles.transactionsSection}>
      <View style={styles.transactionsHeader}>
        <Text style={styles.transactionsTitle}>Recent Transactions</Text>
        {transactions.length > 0 && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => {
              Alert.alert(
                "Transactions",
                `You have ${transactions.length} transaction${
                  transactions.length !== 1 ? "s" : ""
                }`
              );
            }}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#37b63dff" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#37b63dff" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : transactions.length > 0 ? (
        <View style={styles.transactionsList}>
          {transactions.slice(0, 5).map((item, index) =>
            renderTransactionItem({ item, index })
          )}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={50} color="#d1d5db" />
          <Text style={styles.emptyStateText}>No transactions yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Your transaction history will appear here once you receive payments
          </Text>
        </View>
      )}
    </View>
  );

  // ----- Loading / error states -----
  if (loading && !dashboardData) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#37b63dff" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error && !dashboardData) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Ionicons name="alert-circle" size={50} color="#f44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const overviewData = dashboardData || {
    sales: "0.00",
    revenue: "0.00",
    returns: "0.00",
    complete_orders: "0",
    total_customers: 0,
    new_customers: 0,
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={["#37b63dff"]}
        />
      }
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Overview</Text>
          {lastUpdateTime && (
            <Text style={styles.lastUpdateText}>Updated {formatLastUpdate()}</Text>
          )}
        </View>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="#37b63dff" />
        </TouchableOpacity>
      </View>

      {/* Overview Header */}
      <View style={styles.overviewHeader}>
        <View style={styles.filterContainer}>
          <View style={styles.yearContainer}>
            <Text style={styles.showText}>Show:</Text>
            <Text style={styles.yearText}>This year</Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </View>
          <View style={styles.downloadIconContainer}>
            <View style={styles.downloadIcon}>
              <Ionicons name="document-text-outline" size={20} color="#fff" />
            </View>
          </View>
        </View>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiContainer}>
        <LinearGradient colors={["#ecfdf5", "#d1fae5"]} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Sales</Text>
            <View style={[styles.cardIcon, { backgroundColor: "#10b981" }]}>
              <Ionicons name="cart-outline" size={16} color="#fff" />
            </View>
          </View>
          <Text style={styles.cardValue}>{formatNumber(overviewData.sales)}</Text>
          <Text style={styles.cardSubtext}>Total items sold</Text>
        </LinearGradient>

        <LinearGradient colors={["#eff6ff", "#dbeafe"]} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Revenue</Text>
            <View style={[styles.cardIcon, { backgroundColor: "#3b82f6" }]}>
              <Ionicons name="cash-outline" size={16} color="#fff" />
            </View>
          </View>
          <Text style={styles.cardValue}>{formatCurrency(overviewData.revenue)}</Text>
          <Text style={styles.cardSubtext}>Total earnings</Text>
        </LinearGradient>
      </View>

      <View style={styles.kpiContainer}>
        <LinearGradient colors={["#fffaf0", "#ffedd5"]} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Returns</Text>
            <View style={[styles.cardIcon, { backgroundColor: "#f59e0b" }]}>
              <Ionicons name="refresh-outline" size={16} color="#fff" />
            </View>
          </View>
          <Text style={styles.cardValue}>{formatNumber(overviewData.returns)}</Text>
          <Text style={styles.cardSubtext}>Items returned</Text>
        </LinearGradient>

        <LinearGradient colors={["#fef2f2", "#fee2e2"]} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Orders</Text>
            <View style={[styles.cardIcon, { backgroundColor: "#ef4444" }]}>
              <Ionicons name="checkmark-done-outline" size={16} color="#fff" />
            </View>
          </View>
          <Text style={styles.cardValue}>{formatNumber(overviewData.complete_orders)}</Text>
          <Text style={styles.cardSubtext}>Completed orders</Text>
        </LinearGradient>
      </View>

      {/* Additional Stats Row */}
      <View style={styles.additionalStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Customers</Text>
          <Text style={styles.statValue}>
            {overviewData.total_customers?.toLocaleString() || "0"}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>New Customers</Text>
          <Text style={styles.statValue}>
            {overviewData.new_customers?.toLocaleString() || "0"}
          </Text>
        </View>
      </View>

      {/* Transactions Section */}
      {renderTransactionsSection()}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

export default DashboardOverview;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  lastUpdateText: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },
  overviewHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  showText: {
    fontSize: 13,
    color: "#6B7280",
    marginRight: 6,
  },
  yearContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  yearText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginRight: 6,
  },
  downloadIconContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  downloadIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  kpiContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  card: {
    width: "48%",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cardLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },
  cardSubtext: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 4,
  },
  additionalStats: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 30,
    justifyContent: "space-around",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
    height: "100%",
  },
  transactionsSection: {
    paddingHorizontal: 20,
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  transactionsTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 13,
    color: "#10B981",
    marginRight: 4,
    fontWeight: "600",
  },
  transactionsList: {
    marginBottom: 10,
  },
  transactionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  transactionType: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionTypeText: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },
  transactionAmount: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  creditAmount: {
    color: "#10b981",
  },
  debitAmount: {
    color: "#ef4444",
  },
  transactionDetails: {
    marginTop: 4,
  },
  transactionDescription: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 8,
    fontWeight: "600",
  },
  transactionMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  transactionId: {
    fontSize: 12,
    color: "#6b7280",
  },
  itemsCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  itemsCount: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 4,
  },
  transactionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  transactionDate: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionDateText: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 4,
    marginRight: 8,
  },
  transactionTimeText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 12,
    fontWeight: "500",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#37b63dff",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  bottomSpacer: {
    height: 100,
  },
});