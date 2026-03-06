import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  FlatList,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import WalletBalanceCard from "./components/WalletBalanceCard";
import QuickAccessCard from "./components/QuickAccessCard";
import TransactionItem from "./components/TransactionItem";
import EmptyState from "./components/EmptyState";

import { getWalletBalances } from "../api/wallet";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WalletDashboardScreen = () => {
  const navigation = useNavigation();

  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const quickAccessItems = [
    { title: "Your Cashbacks", icon: require("../assets/walletActive.png") },
    {
      title: "Your Referrals",
      icon: require("../assets/Referrals.png"),
      action: () => navigation.navigate("ReferralScreen"),
    },
    {
      title: "Subscriptions",
      icon: require("../assets/Subscriptions.png"),
      action: () => navigation.navigate("Subscriptions"),
    },
    {
      title: "Create Account",
      icon: "🏦",
      action: () =>
        navigation.navigate("Wallet", { screen: "CreateVirtualAccount" }),
    },
    {
      title: "Fund Wallet",
      icon: "💰",
      action: () => navigation.navigate("Wallet", { screen: "FundWallet" }),
    },
  ];

  const fetchWalletData = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");
      const userEmail = userString ? JSON.parse(userString).email : null;

      if (!userEmail) {
        setError("Please login to view wallet.");
        setLoading(false);
        return;
      }

      const response = await getWalletBalances();

      console.log("WALLET API RESPONSE:", response);

      if (response && response.status === "success") {
        const wallets = response?.data?.wallets || [];

        const ngnWallet = wallets.find((w) => w.currency === "NGN");

        const walletBalance = parseFloat(ngnWallet?.balance || 0);

        setBalance(walletBalance);

        setTransactions(response?.data?.transaction_history || []);

        setError("");

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } else {
        setError(response?.message || "Failed to fetch wallet data.");
      }
    } catch (e) {
      console.log("Wallet fetch error:", e);
      setError("Database error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWalletData();
    }, [])
  );

  // 🔵 AUTO WALLET SYNC (Instant balance update like fintech apps)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWalletData();
    }, 8000); // every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWalletData();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#22c55e"]}
          />
        }
      >
        {/* Wallet Balance */}
        <WalletBalanceCard balance={balance} loading={loading} />

        {/* Quick Access Header */}
        <Text style={styles.sectionTitle}>Quick Access</Text>

        {/* Quick Access Grid */}
        <FlatList
          data={quickAccessItems}
          numColumns={2}
          scrollEnabled={false}
          keyExtractor={(item, index) => `quick-${index}`}
          columnWrapperStyle={styles.quickRow}
          contentContainerStyle={styles.quickContainer}
          renderItem={({ item }) => <QuickAccessCard item={item} />}
        />

        {/* Recent Activities Header */}
        <View style={styles.activityHeader}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>

          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions OR Error */}
        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Oops! Something went wrong</Text>

            <Text style={styles.errorSub}>
              Failed to load: {error}
            </Text>

            <TouchableOpacity style={styles.retryBtn} onPress={fetchWalletData}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : transactions.length > 0 ? (
          <Animated.View style={{ opacity: fadeAnim }}>
            <FlatList
              data={transactions}
              scrollEnabled={false}
              keyExtractor={(item, index) => item.id || `${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate("Wallet", {
                      screen: "TransactionDetails",
                      params: { transactionId: item.id },
                    })
                  }
                >
                  <TransactionItem transaction={item} />
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        ) : (
          <EmptyState
            title="No transactions yet"
            subtitle="Your transactions will appear here automatically"
            onRetry={fetchWalletData}
          />
        )}
      </ScrollView>

      {/* Bottom Error Toast */}
      {error ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>
            Fetch error: {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 16,
    marginTop: 20,
  },

  quickContainer: {
    paddingHorizontal: 12,
    marginTop: 10,
  },

  quickRow: {
    justifyContent: "space-between",
    marginBottom: 16,
  },

  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 16,
  },

  seeAll: {
    color: "#16a34a",
    fontWeight: "600",
  },

  errorCard: {
    backgroundColor: "#fdecec",
    margin: 16,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
  },

  errorTitle: {
    color: "#dc2626",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 5,
  },

  errorSub: {
    color: "#7f1d1d",
    marginBottom: 15,
  },

  retryBtn: {
    backgroundColor: "#22c55e",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },

  retryText: {
    color: "#fff",
    fontWeight: "600",
  },

  toast: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "#222",
    padding: 14,
    borderRadius: 10,
  },

  toastText: {
    color: "#fff",
  },
});

export default WalletDashboardScreen;