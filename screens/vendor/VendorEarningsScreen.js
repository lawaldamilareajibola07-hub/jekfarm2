import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const BASE_URL = "https://productionbackend2.agreonpay.com.ng/api";

const PERIOD_OPTIONS = ["7d", "30d", "90d", "all"];

const TX_TYPE_CONFIG = {
  credit: { icon: "arrow-down-circle", color: "#059669", prefix: "+" },
  debit: { icon: "arrow-up-circle", color: "#DC2626", prefix: "-" },
  payout: { icon: "arrow-up-circle", color: "#D97706", prefix: "-" },
};

export default function VendorEarningsScreen({ navigation }) {
  const [earnings, setEarnings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState("30d");

  const fetchEarnings = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [earningsRes, txRes] = await Promise.allSettled([
        axios.get(
          `${BASE_URL}/commerce/vendor/earnings?period=${period}`,
          { headers }
        ),
        axios.get(`${BASE_URL}/commerce/vendor/earnings/transactions`, {
          headers,
        }),
      ]);

      if (earningsRes.status === "fulfilled")
        setEarnings(earningsRes.value.data?.data);
      if (txRes.status === "fulfilled")
        setTransactions(txRes.value.data?.data?.transactions || []);
    } catch (err) {
      console.log("Earnings fetch error:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEarnings();
    }, [period])
  );

  const STAT_CARDS = [
    {
      label: "Available Balance",
      value: earnings?.availableBalance ?? 0,
      icon: "wallet",
      color: "#2D6A4F",
      bg: "#EAFAF1",
      highlight: true,
    },
    {
      label: "Total Earned",
      value: earnings?.totalEarned ?? 0,
      icon: "trending-up",
      color: "#2563EB",
      bg: "#EFF6FF",
    },
    {
      label: "Total Withdrawn",
      value: earnings?.totalWithdrawn ?? 0,
      icon: "arrow-up-circle",
      color: "#D97706",
      bg: "#FFFBEB",
    },
    {
      label: "Pending Clearance",
      value: earnings?.pendingClearance ?? 0,
      icon: "time",
      color: "#7C3AED",
      bg: "#F5F3FF",
    },
  ];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchEarnings();
          }}
          tintColor="#2D6A4F"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Earnings</Text>
      </View>

      {/* Period Selector */}
      <View style={styles.periodRow}>
        {PERIOD_OPTIONS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodChip, period === p && styles.periodChipActive]}
            onPress={() => setPeriod(p)}
          >
            <Text
              style={[
                styles.periodChipText,
                period === p && styles.periodChipTextActive,
              ]}
            >
              {p === "all" ? "All time" : `Last ${p}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        {STAT_CARDS.map((card, i) => (
          <View
            key={i}
            style={[
              styles.statCard,
              { backgroundColor: card.bg },
              card.highlight && styles.statCardHighlight,
            ]}
          >
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: card.color + "20" },
              ]}
            >
              <Ionicons name={card.icon} size={20} color={card.color} />
            </View>
            <Text
              style={[
                styles.statValue,
                card.highlight && { color: card.color },
              ]}
            >
              ₦{Number(card.value).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      {/* Withdraw CTA */}
      <View style={styles.withdrawSection}>
        <View style={styles.withdrawInfo}>
          <Text style={styles.withdrawLabel}>Available to Withdraw</Text>
          <Text style={styles.withdrawAmount}>
            ₦{Number(earnings?.availableBalance ?? 0).toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.withdrawBtn}
          onPress={() => navigation.navigate("Withdraw")}
        >
          <Ionicons name="arrow-up-circle-outline" size={18} color="#FFFFFF" />
          <Text style={styles.withdrawBtnText}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction History */}
      <View style={styles.txSection}>
        <Text style={styles.sectionTitle}>Transaction History</Text>

        {transactions.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="swap-horizontal-outline" size={40} color="#D1D5DB" />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          transactions.map((tx, i) => {
            const txType = tx.type?.toLowerCase();
            const txConfig = TX_TYPE_CONFIG[txType] || TX_TYPE_CONFIG.credit;

            return (
              <View key={tx.id || i} style={styles.txRow}>
                <View
                  style={[
                    styles.txIconWrap,
                    { backgroundColor: txConfig.color + "18" },
                  ]}
                >
                  <Ionicons
                    name={txConfig.icon}
                    size={20}
                    color={txConfig.color}
                  />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txDesc} numberOfLines={1}>
                    {tx.description || tx.narration || "Transaction"}
                  </Text>
                  <Text style={styles.txDate}>
                    {tx.createdAt
                      ? new Date(tx.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </Text>
                </View>
                <Text
                  style={[styles.txAmount, { color: txConfig.color }]}
                >
                  {txConfig.prefix}₦{Number(tx.amount || 0).toLocaleString()}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },

  periodRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  periodChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  periodChipActive: { backgroundColor: "#2D6A4F" },
  periodChipText: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  periodChipTextActive: { color: "#FFFFFF" },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: { width: "47%", borderRadius: 14, padding: 16 },
  statCardHighlight: {
    borderWidth: 1.5,
    borderColor: "#B7E4C7",
  },
  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: { fontSize: 12, color: "#6B7280" },

  withdrawSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  withdrawInfo: { gap: 4 },
  withdrawLabel: { fontSize: 12, color: "#6B7280" },
  withdrawAmount: { fontSize: 20, fontWeight: "700", color: "#111827" },
  withdrawBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2D6A4F",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  withdrawBtnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },

  txSection: { paddingHorizontal: 16, paddingTop: 28 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },
  emptyWrap: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 14, color: "#9CA3AF" },

  txRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  txIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, fontWeight: "500", color: "#111827" },
  txDate: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: "700" },
});