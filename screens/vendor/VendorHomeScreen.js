import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const BASE_URL = "https://productionbackend2.agreonpay.com.ng/api";

export default function VendorHomeScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [vendorInfo, setVendorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, ordersRes, profileRes] = await Promise.allSettled([
        axios.get(`${BASE_URL}/commerce/vendor/dashboard/stats`, { headers }),
        axios.get(`${BASE_URL}/commerce/vendor/orders?limit=5`, { headers }),
        axios.get(`${BASE_URL}/commerce/vendor/store/profile`, { headers }),
      ]);

      if (statsRes.status === "fulfilled") setStats(statsRes.value.data?.data);
      if (ordersRes.status === "fulfilled")
        setRecentOrders(ordersRes.value.data?.data?.orders || []);
      if (profileRes.status === "fulfilled")
        setVendorInfo(profileRes.value.data?.data);
    } catch (err) {
      console.log("Dashboard fetch error:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const STAT_CARDS = [
    {
      label: "Total Revenue",
      value: stats?.totalRevenue
        ? `₦${Number(stats.totalRevenue).toLocaleString()}`
        : "₦0",
      icon: "trending-up",
      color: "#2D6A4F",
      bg: "#EAFAF1",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? "0",
      icon: "receipt-outline",
      color: "#2563EB",
      bg: "#EFF6FF",
    },
    {
      label: "Products Listed",
      value: stats?.totalProducts ?? "0",
      icon: "cube-outline",
      color: "#7C3AED",
      bg: "#F5F3FF",
    },
    {
      label: "Pending Orders",
      value: stats?.pendingOrders ?? "0",
      icon: "time-outline",
      color: "#D97706",
      bg: "#FFFBEB",
    },
  ];

  const STATUS_COLORS = {
    pending: { bg: "#FFFBEB", text: "#D97706" },
    processing: { bg: "#EFF6FF", text: "#2563EB" },
    shipped: { bg: "#F0FDF4", text: "#16A34A" },
    delivered: { bg: "#ECFDF5", text: "#059669" },
    cancelled: { bg: "#FEF2F2", text: "#DC2626" },
  };

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
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D6A4F" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back 👋</Text>
          <Text style={styles.storeName}>
            {vendorInfo?.storeName || "Your Store"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => navigation.navigate("Notifications")}
        >
          <Ionicons name="notifications-outline" size={22} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {STAT_CARDS.map((card, i) => (
          <View key={i} style={[styles.statCard, { backgroundColor: card.bg }]}>
            <View style={[styles.statIconWrap, { backgroundColor: card.color + "20" }]}>
              <Ionicons name={card.icon} size={20} color={card.color} />
            </View>
            <Text style={styles.statValue}>{card.value}</Text>
            <Text style={styles.statLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              navigation.navigate("AddProduct")
            }
          >
            <View style={[styles.actionIcon, { backgroundColor: "#EAFAF1" }]}>
              <Ionicons name="add-circle-outline" size={22} color="#2D6A4F" />
            </View>
            <Text style={styles.actionLabel}>Add Product</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate("VendorOrders")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="receipt-outline" size={22} color="#2563EB" />
            </View>
            <Text style={styles.actionLabel}>View Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate("Withdraw")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#FFFBEB" }]}>
              <Ionicons name="arrow-up-circle-outline" size={22} color="#D97706" />
            </View>
            <Text style={styles.actionLabel}>Withdraw</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate("VendorSettings")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#F5F3FF" }]}>
              <Ionicons name="storefront-outline" size={22} color="#7C3AED" />
            </View>
            <Text style={styles.actionLabel}>Store Setup</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate("VendorOrders")}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {recentOrders.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="receipt-outline" size={36} color="#D1D5DB" />
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        ) : (
          recentOrders.map((order, i) => {
            const statusStyle =
              STATUS_COLORS[order.status?.toLowerCase()] || STATUS_COLORS.pending;
            return (
              <TouchableOpacity
                key={order.id || i}
                style={styles.orderRow}
                onPress={() =>
                  navigation.navigate("OrderDetail", { orderId: order.id })
                }
              >
                <View style={styles.orderLeft}>
                  <Text style={styles.orderId}>
                    #{order.orderNumber || order.id?.slice(-6).toUpperCase()}
                  </Text>
                  <Text style={styles.orderMeta}>
                    {order.itemCount || order.items?.length || 1} item(s) ·{" "}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "—"}
                  </Text>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderAmount}>
                    ₦{Number(order.totalAmount || 0).toLocaleString()}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusStyle.bg },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {order.status || "Pending"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  greeting: { fontSize: 13, color: "#6B7280", marginBottom: 2 },
  storeName: { fontSize: 20, fontWeight: "700", color: "#111827" },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    width: "47%",
    borderRadius: 14,
    padding: 16,
  },
  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 4 },
  statLabel: { fontSize: 12, color: "#6B7280" },

  section: { paddingHorizontal: 20, paddingTop: 28 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 14 },
  seeAll: { fontSize: 13, color: "#2D6A4F", fontWeight: "600" },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionBtn: { alignItems: "center", gap: 6 },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: { fontSize: 11, color: "#374151", fontWeight: "500" },

  emptyBox: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    gap: 8,
  },
  emptyText: { fontSize: 13, color: "#9CA3AF" },

  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  orderLeft: { gap: 4 },
  orderId: { fontSize: 14, fontWeight: "600", color: "#111827" },
  orderMeta: { fontSize: 12, color: "#9CA3AF" },
  orderRight: { alignItems: "flex-end", gap: 6 },
  orderAmount: { fontSize: 14, fontWeight: "700", color: "#111827" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "600" },
});