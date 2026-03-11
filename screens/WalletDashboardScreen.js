import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  FlatList,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
  Dimensions,
  Keyboard,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import WalletBalanceCard from "./components/WalletBalanceCard";
import QuickAccessCard from "./components/QuickAccessCard";
import TransactionItem from "./components/TransactionItem";
import EmptyState from "./components/EmptyState";

import { getWalletBalances } from "../api/wallet";

const POLL_INTERVAL = 15000;
const SCREEN_WIDTH = Dimensions.get("window").width;

const WalletDashboardScreen = () => {
  const navigation = useNavigation();

  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [hasVirtualAccount, setHasVirtualAccount] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const quickAnim = useRef(new Animated.Value(0)).current;
  const transactionsRef = useRef([]);
  const [scrollShadow, setScrollShadow] = useState(false);

  // Load virtual account state and animate Quick Access cards
  useEffect(() => {
    (async () => {
      const storedValue = await AsyncStorage.getItem("hasVirtualAccount");
      if (storedValue === "true") setHasVirtualAccount(true);

      Animated.timing(quickAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    })();
  }, []);

  // Quick Access Items
  const quickAccessItems = [
    { title: "Your Cashbacks", icon: require("../assets/walletActive.png") },
    {
      title: "Your Referrals",
      icon: require("../assets/Referrals.png"),
      action: () => navigation.navigate("ReferralScreen"),
    },
    {
      title: "Withdraw",
      icon: require("../assets/walletActive.png"),
      action: () => navigation.navigate("Withdraw"),
    },
    {
      title: "Subscriptions",
      icon: require("../assets/Subscriptions.png"),
      action: () => navigation.navigate("Subscriptions"),
    },
    {
      title: "Set Transaction PIN",
      icon: require("../assets/walletActive.png"),
      action: () => navigation.navigate("SetTransactionPin"),
    },
    {
      title: "Change PIN",
      icon: require("../assets/walletActive.png"),
      action: () => navigation.navigate("ChangePinScreen"),
    },
    {
      title: "Products",
      icon: require("../assets/walletActive.png"),
      action: () => navigation.navigate("ProductDetails"),
    },
    {
      title: "Shopping Cart",
      icon: require("../assets/walletActive.png"),
      action: () => navigation.navigate("ShoppingCart"),
    },
    {
      title: "Checkout",
      icon: require("../assets/walletActive.png"),
      action: () => navigation.navigate("Checkout"),
    },
    {
      title: "Order Success",
      icon: require("../assets/walletActive.png"),
      action: () => navigation.navigate("OrderSuccess"),
    },
    ...(!hasVirtualAccount
      ? [
          {
            title: "Create Account",
            icon: "🏦",
            action: () =>
              navigation.navigate("Wallet", {
                screen: "CreateVirtualAccount",
                params: {
                  onAccountCreated: async () => {
                    setHasVirtualAccount(true);
                    await AsyncStorage.setItem("hasVirtualAccount", "true");
                  },
                },
              }),
          },
        ]
      : []),
  ];

  // Fetch Wallet Data
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
      if (response && response.status === "success") {
        const wallets = response.data || [];
        const ngnWallet = wallets.find((w) => w.currency === "NGN");
        const walletBalance = parseFloat(ngnWallet?.balance || 0);
        setBalance(walletBalance);

        const accountExists = !!(ngnWallet?.account_number || ngnWallet?.accountNumber);
        if (accountExists) {
          setHasVirtualAccount(true);
          await AsyncStorage.setItem("hasVirtualAccount", "true");
        }

        const walletTransactions = ngnWallet?.transactions || [];
        const prevIds = transactionsRef.current.map((t) => t.id);
        const newTxns = walletTransactions.filter((t) => !prevIds.includes(t.id));

        if (newTxns.length > 0) {
          fadeAnim.setValue(0);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        }

        transactionsRef.current = walletTransactions;
        setTransactions(walletTransactions);
        setError("");
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

  // Auto refresh on focus
  useFocusEffect(
    useCallback(() => {
      fetchWalletData();
      const interval = setInterval(fetchWalletData, POLL_INTERVAL);
      return () => clearInterval(interval);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchWalletData();
  };

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    setScrollShadow(offsetX > 5);
  };

  return (
    <View style={styles.container}>
      {/* Shopping Cart Button */}
      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => navigation.navigate("ShoppingCart")}
      >
        <Text style={styles.cartIcon}>🛒</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#22c55e"]} />}
      >
        {/* Wallet Balance */}
        <WalletBalanceCard balance={balance} loading={loading} />

        {/* Quick Access Section */}
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <Animated.View
          style={[
            styles.quickContainer,
            scrollShadow && styles.quickShadow,
            {
              opacity: quickAnim,
              transform: [
                {
                  translateY: quickAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <FlatList
            data={quickAccessItems}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
            keyExtractor={(item, index) => `quick-${index}`}
            renderItem={({ item }) => <QuickAccessCard item={item} />}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />
        </Animated.View>

        {/* Recent Activities */}
        <View style={styles.activityHeader}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions / Empty / Error */}
        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
            <Text style={styles.errorSub}>Failed to load: {error}</Text>
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

      {/* Bottom Toast Error */}
      {error && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>Fetch error: {error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },
  cartButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "#22c55e",
    padding: 12,
    borderRadius: 30,
  },
  cartIcon: { fontSize: 18, color: "#fff" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginLeft: 16, marginTop: 20 },
  quickContainer: {
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  quickShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 2, height: 0 },
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 16,
  },
  seeAll: { color: "#16a34a", fontWeight: "600" },
  errorCard: {
    backgroundColor: "#fdecec",
    margin: 16,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
  },
  errorTitle: { color: "#dc2626", fontSize: 16, fontWeight: "700", marginBottom: 5 },
  errorSub: { color: "#7f1d1d", marginBottom: 15 },
  retryBtn: { backgroundColor: "#22c55e", paddingVertical: 10, paddingHorizontal: 25, borderRadius: 8 },
  retryText: { color: "#fff", fontWeight: "600" },
  toast: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "#222",
    padding: 14,
    borderRadius: 10,
  },
  toastText: { color: "#fff" },
});

export default WalletDashboardScreen;