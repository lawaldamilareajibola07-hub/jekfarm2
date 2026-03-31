import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "https://productionbackend2.agreonpay.com.ng/api";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const POLL_INTERVAL = 15000;

// ─── Transaction type config ───────────────────────────────────────────────
const TX_CONFIG = {
  credit:  { icon: "arrow-down-circle",  color: "#22c55e", prefix: "+" },
  debit:   { icon: "arrow-up-circle",    color: "#ef4444", prefix: "-" },
  payout:  { icon: "arrow-up-circle",    color: "#f59e0b", prefix: "-" },
  default: { icon: "swap-horizontal",    color: "#6B7280", prefix: ""  },
};

// ─── Quick access items ────────────────────────────────────────────────────
const getQuickItems = (navigation) => [
  {
    label: "Withdraw",
    icon: "arrow-up-circle-outline",
    color: "#f59e0b",
    bg: "#FFFBEB",
    action: () => navigation.navigate("Withdraw"),
  },
  {
    label: "Transfer",
    icon: "swap-horizontal-outline",
    color: "#3b82f6",
    bg: "#EFF6FF",
    action: () => navigation.navigate("Transfer"),
  },
  {
    label: "Fund Wallet",
    icon: "add-circle-outline",
    color: "#22c55e",
    bg: "#F0FDF4",
    action: () => navigation.navigate("VendorFundWalletScreen"),
  },

   {
    label: "virtual Account",
    icon: "add-circle-outline",
    color: "#22c55e",
    bg: "#F0FDF4",
    action: () => navigation.navigate("VendorCreateVirtualAccountScreen"),
  },
  
  {
    label: "Transactions",
    icon: "receipt-outline",
    color: "#8b5cf6",
    bg: "#F5F3FF",
    action: () => navigation.navigate("VendorTransactionScreen"),
  },
  {
    label: "Store",
    icon: "storefront-outline",
    color: "#ec4899",
    bg: "#FDF2F8",
    action: () => navigation.navigate("VendorSettings"),
  },
  {
    label: "Orders",
    icon: "bag-handle-outline",
    color: "#14b8a6",
    bg: "#F0FDFA",
    action: () => navigation.navigate("VendorOrders"),
  },
];

export default function VendorWalletScreen() {
  const navigation = useNavigation();

  const [balance, setBalance]               = useState(0);
  const [totalEarned, setTotalEarned]       = useState(0);
  const [pendingClearance, setPending]      = useState(0);
  const [totalWithdrawn, setWithdrawn]      = useState(0);
  const [transactions, setTransactions]     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [refreshing, setRefreshing]         = useState(false);
  const [error, setError]                   = useState("");
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [userName, setUserName]             = useState("");

  // ── Animations ─────────────────────────────────────────────────────────
  const headerAnim   = useRef(new Animated.Value(0)).current;
  const cardsAnim    = useRef(new Animated.Value(0)).current;
  const txAnim       = useRef(new Animated.Value(0)).current;
  const balanceScale = useRef(new Animated.Value(1)).current;
  const toastAnim    = useRef(new Animated.Value(0)).current;
  const transactionsRef = useRef([]);

  useEffect(() => {
    loadUserName();
    Animated.stagger(150, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.spring(cardsAnim,  { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.spring(txAnim,     { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
    ]).start();
  }, []);

  const loadUserName = async () => {
    try {
      const raw = await AsyncStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        setUserName(u.firstName || u.first_name || u.storeName || u.name || "Vendor");
      }
    } catch (_) {}
  };

  const toggleBalance = () => {
    Animated.sequence([
      Animated.timing(balanceScale, { toValue: 0.85, duration: 100, useNativeDriver: true }),
      Animated.spring(balanceScale, { toValue: 1, useNativeDriver: true, tension: 120 }),
    ]).start();
    setBalanceVisible((v) => !v);
  };

  const showToast = () => {
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  // ── Fetch ───────────────────────────────────────────────────────────────
  const fetchWalletData = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [walletRes, earningsRes, txRes] = await Promise.allSettled([
        axios.get(`${BASE_URL}/commerce/vendor/wallet`,                  { headers }),
        axios.get(`${BASE_URL}/commerce/vendor/earnings`,                { headers }),
        axios.get(`${BASE_URL}/commerce/vendor/earnings/transactions`,   { headers }),
      ]);

      if (walletRes.status === "fulfilled") {
        const data = walletRes.value.data?.data;
        setBalance(parseFloat(data?.balance || data?.wallet_balance || 0));
      }

      if (earningsRes.status === "fulfilled") {
        const e = earningsRes.value.data?.data;
        setTotalEarned(parseFloat(e?.totalEarned || 0));
        setPending(parseFloat(e?.pendingClearance || 0));
        setWithdrawn(parseFloat(e?.totalWithdrawn || 0));
      }

      if (txRes.status === "fulfilled") {
        const newTxns = txRes.value.data?.data?.transactions || [];
        const prevIds = transactionsRef.current.map((t) => t.id);
        const hasNew  = newTxns.some((t) => !prevIds.includes(t.id));
        if (hasNew && transactionsRef.current.length > 0) showToast();
        transactionsRef.current = newTxns;
        setTransactions(newTxns);
      }

      setError("");
    } catch (e) {
      console.log("Vendor wallet fetch error:", e);
      setError("Could not load wallet data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWalletData();
      const interval = setInterval(fetchWalletData, POLL_INTERVAL);
      return () => clearInterval(interval);
    }, [])
  );

  const fmt = (n) =>
    `₦${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

  const quickItems = getQuickItems(navigation);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchWalletData(); }}
            tintColor="#22c55e"
            colors={["#22c55e"]}
          />
        }
      >

        {/* ── BALANCE CARD ─────────────────────────────────────────────── */}
        <Animated.View
          style={{
            opacity: headerAnim,
            transform: [{
              translateY: headerAnim.interpolate({
                inputRange: [0, 1], outputRange: [-30, 0],
              }),
            }],
          }}
        >
          <LinearGradient
            colors={["#111827", "#1F2937", "#111827"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            {/* Decorative circles */}
            <View style={styles.circle1} />
            <View style={styles.circle2} />

            {/* Top row */}
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.cardGreeting}>Hello, {userName} 👋</Text>
                <Text style={styles.cardLabel}>Available Balance</Text>
              </View>
              <TouchableOpacity style={styles.eyeBtn} onPress={toggleBalance}>
                <Ionicons
                  name={balanceVisible ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="rgba(255,255,255,0.7)"
                />
              </TouchableOpacity>
            </View>

            {/* Balance amount */}
            <Animated.View style={{ transform: [{ scale: balanceScale }] }}>
              <Text style={styles.balanceAmount}>
                {loading ? "—" : balanceVisible ? fmt(balance) : "₦ ••••••"}
              </Text>
            </Animated.View>

            {/* Divider */}
            <View style={styles.cardDivider} />

            {/* Bottom action row */}
            <View style={styles.cardBottom}>
              {[
                { label: "Withdraw", icon: "arrow-up-outline",       action: () => navigation.navigate("Withdraw")   },
                { label: "Transfer", icon: "swap-horizontal-outline", action: () => navigation.navigate("Transfer")   },
                { label: "Fund",     icon: "add-outline",             action: () => navigation.navigate("FundWallet") },
              ].map((btn, i) => (
                <TouchableOpacity key={i} style={styles.cardAction} onPress={btn.action}>
                  <View style={styles.cardActionIcon}>
                    <Ionicons name={btn.icon} size={16} color="#111827" />
                  </View>
                  <Text style={styles.cardActionLabel}>{btn.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── EARNINGS SUMMARY CARDS ───────────────────────────────────── */}
        <Animated.View
          style={[
            styles.earningsRow,
            {
              opacity: cardsAnim,
              transform: [{
                translateY: cardsAnim.interpolate({
                  inputRange: [0, 1], outputRange: [20, 0],
                }),
              }],
            },
          ]}
        >
          {[
            { label: "Total Earned",      value: totalEarned,      icon: "trending-up-outline",     color: "#22c55e", bg: "#F0FDF4" },
            { label: "Pending",           value: pendingClearance, icon: "time-outline",             color: "#f59e0b", bg: "#FFFBEB" },
            { label: "Withdrawn",         value: totalWithdrawn,   icon: "arrow-up-circle-outline",  color: "#3b82f6", bg: "#EFF6FF" },
          ].map((card, i) => (
            <View key={i} style={[styles.earningCard, { backgroundColor: card.bg }]}>
              <View style={[styles.earningIconWrap, { backgroundColor: card.color + "22" }]}>
                <Ionicons name={card.icon} size={18} color={card.color} />
              </View>
              <Text style={styles.earningValue}>
                {loading ? "—" : fmt(card.value)}
              </Text>
              <Text style={styles.earningLabel}>{card.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ── QUICK ACCESS ─────────────────────────────────────────────── */}
        <Animated.View
          style={{
            opacity: cardsAnim,
            transform: [{
              translateY: cardsAnim.interpolate({
                inputRange: [0, 1], outputRange: [20, 0],
              }),
            }],
          }}
        >
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickGrid}>
            {quickItems.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.quickItem}
                onPress={item.action}
                activeOpacity={0.75}
              >
                <View style={[styles.quickIconWrap, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={styles.quickLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* ── TRANSACTIONS ─────────────────────────────────────────────── */}
        <Animated.View
          style={{
            opacity: txAnim,
            transform: [{
              translateY: txAnim.interpolate({
                inputRange: [0, 1], outputRange: [30, 0],
              }),
            }],
          }}
        >
          <View style={styles.txHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate("VendorTransactionScreen")}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#22c55e" style={{ marginTop: 32 }} />
          ) : error ? (
            <View style={styles.errorCard}>
              <Ionicons name="cloud-offline-outline" size={40} color="#ef4444" />
              <Text style={styles.errorTitle}>Something went wrong</Text>
              <Text style={styles.errorSub}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchWalletData}>
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : transactions.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="swap-horizontal-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySub}>Your transactions will appear here</Text>
            </View>
          ) : (
            <View style={styles.txList}>
              {transactions.slice(0, 20).map((item, index) => {
                const type   = item.type?.toLowerCase() || "default";
                const cfg    = TX_CONFIG[type] || TX_CONFIG.default;
                const isLast = index === Math.min(transactions.length, 20) - 1;

                return (
                  <TouchableOpacity
                    key={item.id || index}
                    style={[styles.txRow, isLast && { borderBottomWidth: 0 }]}
                    activeOpacity={0.7}
                    onPress={() =>
                      navigation.navigate("TransactionDetailsScreen", {
                        transactionId: item.id,
                      })
                    }
                  >
                    <View style={[styles.txIconWrap, { backgroundColor: cfg.color + "18" }]}>
                      <Ionicons name={cfg.icon} size={20} color={cfg.color} />
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={styles.txDesc} numberOfLines={1}>
                        {item.description || item.narration || "Transaction"}
                      </Text>
                      <Text style={styles.txDate}>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("en-NG", {
                              day: "numeric", month: "short", year: "numeric",
                            })
                          : "—"}
                      </Text>
                    </View>
                    <View style={styles.txRight}>
                      <Text style={[styles.txAmount, { color: cfg.color }]}>
                        {cfg.prefix}₦{Number(item.amount || 0).toLocaleString()}
                      </Text>
                      <View style={[
                        styles.txStatus,
                        { backgroundColor: item.status === "success" ? "#F0FDF4" : "#FFFBEB" },
                      ]}>
                        <Text style={[
                          styles.txStatusText,
                          { color: item.status === "success" ? "#16a34a" : "#d97706" },
                        ]}>
                          {item.status || "pending"}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* ── NEW TRANSACTION TOAST ─────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.toast,
          {
            opacity: toastAnim,
            transform: [{
              translateY: toastAnim.interpolate({
                inputRange: [0, 1], outputRange: [60, 0],
              }),
            }],
          },
        ]}
        pointerEvents="none"
      >
        <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
        <Text style={styles.toastText}>New transaction received</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F4F6F8" },

  // ── Balance Card ────────────────────────────────────────────────────────
  balanceCard: {
    marginHorizontal: 16, marginTop: 56,
    borderRadius: 24, padding: 24,
    overflow: "hidden", position: "relative",
  },
  circle1: {
    position: "absolute", width: 180, height: 180, borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.04)", top: -60, right: -40,
  },
  circle2: {
    position: "absolute", width: 120, height: 120, borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.03)", bottom: -30, left: -20,
  },
  cardTop: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 16,
  },
  cardGreeting: { fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 4 },
  cardLabel:    { fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: "500" },
  eyeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center", alignItems: "center",
  },
  balanceAmount: {
    fontSize: 34, fontWeight: "800", color: "#FFFFFF",
    letterSpacing: 0.5, marginBottom: 20,
  },
  cardDivider: {
    height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginBottom: 20,
  },
  cardBottom:      { flexDirection: "row", gap: 16 },
  cardAction:      { alignItems: "center", gap: 6 },
  cardActionIcon:  {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#22c55e",
    justifyContent: "center", alignItems: "center",
  },
  cardActionLabel: { fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: "500" },

  // ── Earnings Cards ───────────────────────────────────────────────────────
  earningsRow: {
    flexDirection: "row", gap: 10,
    paddingHorizontal: 16, marginTop: 20,
  },
  earningCard: { flex: 1, borderRadius: 16, padding: 14 },
  earningIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    justifyContent: "center", alignItems: "center", marginBottom: 10,
  },
  earningValue: { fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 4 },
  earningLabel: { fontSize: 10, color: "#6B7280", lineHeight: 14 },

  // ── Quick Access ─────────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 16, fontWeight: "700", color: "#111827",
    marginLeft: 16, marginTop: 24, marginBottom: 14,
  },
  quickGrid: {
    flexDirection: "row", flexWrap: "wrap",
    paddingHorizontal: 16, gap: 12,
  },
  quickItem: {
    width: (SCREEN_WIDTH - 32 - 36) / 3,
    backgroundColor: "#FFFFFF",
    borderRadius: 16, padding: 14,
    alignItems: "center", gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6,
    elevation: 2,
  },
  quickIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: "center", alignItems: "center",
  },
  quickLabel: { fontSize: 12, color: "#374151", fontWeight: "600" },

  // ── Transactions ─────────────────────────────────────────────────────────
  txHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 16,
    marginTop: 8, marginBottom: 14,
  },
  seeAll: { fontSize: 13, color: "#22c55e", fontWeight: "600" },
  txList: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16, borderRadius: 20,
    paddingHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  txRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#F3F4F6", gap: 12,
  },
  txIconWrap: {
    width: 42, height: 42, borderRadius: 13,
    justifyContent: "center", alignItems: "center",
  },
  txInfo:       { flex: 1, gap: 3 },
  txDesc:       { fontSize: 14, fontWeight: "600", color: "#111827" },
  txDate:       { fontSize: 12, color: "#9CA3AF" },
  txRight:      { alignItems: "flex-end", gap: 5 },
  txAmount:     { fontSize: 14, fontWeight: "700" },
  txStatus:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  txStatusText: { fontSize: 10, fontWeight: "600" },

  // ── Empty / Error ────────────────────────────────────────────────────────
  emptyWrap: {
    alignItems: "center", paddingVertical: 48, gap: 8,
    backgroundColor: "#FFFFFF", marginHorizontal: 16, borderRadius: 20,
  },
  emptyTitle: { fontSize: 15, fontWeight: "600", color: "#374151" },
  emptySub:   { fontSize: 13, color: "#9CA3AF" },
  errorCard: {
    backgroundColor: "#FEF2F2", marginHorizontal: 16,
    borderRadius: 20, padding: 24, alignItems: "center", gap: 8,
  },
  errorTitle: { fontSize: 16, fontWeight: "700", color: "#dc2626" },
  errorSub:   { fontSize: 13, color: "#7f1d1d", textAlign: "center" },
  retryBtn: {
    backgroundColor: "#22c55e", paddingVertical: 10,
    paddingHorizontal: 28, borderRadius: 10, marginTop: 8,
  },
  retryText: { color: "#fff", fontWeight: "600" },

  // ── Toast ────────────────────────────────────────────────────────────────
  toast: {
    position: "absolute", bottom: 24, left: 24, right: 24,
    backgroundColor: "#1F2937", borderRadius: 16, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 8,
  },
  toastText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },
});