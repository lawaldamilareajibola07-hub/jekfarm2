import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const BASE_URL = "https://productionbackend2.agreonpay.com.ng/api";

const STATUS_CONFIG = {
  pending: { bg: "#FFFBEB", text: "#D97706", label: "Pending" },
  processing: { bg: "#EFF6FF", text: "#2563EB", label: "Processing" },
  shipped: { bg: "#F0FDF4", text: "#16A34A", label: "Shipped" },
  delivered: { bg: "#ECFDF5", text: "#059669", label: "Delivered" },
  cancelled: { bg: "#FEF2F2", text: "#DC2626", label: "Cancelled" },
};

const FILTERS = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

export default function VendorOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const res = await axios.get(`${BASE_URL}/commerce/vendor/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data?.data?.orders || res.data?.data || []);
    } catch (err) {
      console.log("Fetch orders error:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const handleUpdateStatus = (order, newStatus) => {
    Alert.alert(
      "Update Order Status",
      `Mark order #${order.orderNumber || order.id?.slice(-6).toUpperCase()} as "${newStatus}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setUpdatingId(order.id);
            try {
              const token = await SecureStore.getItemAsync("token");
              await axios.patch(
                `${BASE_URL}/commerce/vendor/orders/${order.id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              setOrders((prev) =>
                prev.map((o) =>
                  o.id === order.id ? { ...o, status: newStatus } : o
                )
              );
            } catch (err) {
              Alert.alert("Error", "Could not update order status.");
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ]
    );
  };

  const getNextStatus = (current) => {
    const flow = ["pending", "processing", "shipped", "delivered"];
    const idx = flow.indexOf(current?.toLowerCase());
    return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  const filteredOrders = orders.filter(
    (o) => filter === "all" || o.status?.toLowerCase() === filter
  );

  const renderOrder = ({ item }) => {
    const statusCfg =
      STATUS_CONFIG[item.status?.toLowerCase()] || STATUS_CONFIG.pending;
    const nextStatus = getNextStatus(item.status);
    const isUpdating = updatingId === item.id;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.orderTop}>
          <View>
            <Text style={styles.orderId}>
              #{item.orderNumber || item.id?.slice(-6).toUpperCase()}
            </Text>
            <Text style={styles.orderDate}>
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </Text>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}
          >
            <Text style={[styles.statusText, { color: statusCfg.text }]}>
              {statusCfg.label}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.orderMid}>
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={14} color="#9CA3AF" />
            <Text style={styles.metaText}>
              {item.customer?.name || item.customerName || "Customer"}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="cube-outline" size={14} color="#9CA3AF" />
            <Text style={styles.metaText}>
              {item.itemCount || item.items?.length || 1} item(s)
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={14} color="#9CA3AF" />
            <Text style={styles.metaText}>
              ₦{Number(item.totalAmount || 0).toLocaleString()}
            </Text>
          </View>
        </View>

        {nextStatus &&
          item.status?.toLowerCase() !== "cancelled" && (
            <TouchableOpacity
              style={[
                styles.advanceBtn,
                isUpdating && { opacity: 0.6 },
              ]}
              onPress={() => handleUpdateStatus(item, nextStatus)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#2D6A4F" />
              ) : (
                <>
                  <Text style={styles.advanceBtnText}>
                    Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color="#2D6A4F" />
                </>
              )}
            </TouchableOpacity>
          )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{orders.length}</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(f) => f}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === f && styles.filterChipTextActive,
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2D6A4F" />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item, i) => item.id || String(i)}
          renderItem={renderOrder}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchOrders();
          }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No {filter} orders</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  countBadge: {
    backgroundColor: "#2D6A4F",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },

  filterRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  filterChipActive: { backgroundColor: "#2D6A4F" },
  filterChipText: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  filterChipTextActive: { color: "#FFFFFF" },

  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  orderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderId: { fontSize: 15, fontWeight: "700", color: "#111827" },
  orderDate: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: "600" },

  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 12 },

  orderMid: { flexDirection: "row", gap: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: "#6B7280" },

  advanceBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    backgroundColor: "#EAFAF1",
    borderRadius: 10,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "#B7E4C7",
  },
  advanceBtnText: { fontSize: 13, fontWeight: "600", color: "#2D6A4F" },

  emptyWrap: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: "#9CA3AF" },
});