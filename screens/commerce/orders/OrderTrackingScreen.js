import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import Animated, { FadeInUp } from "react-native-reanimated";

import { getOrderDetail } from "../../../api/commerce/orders";

const statuses = [
  "placed",
  "vendor_accepted",
  "inspection_approved",
  "awaiting_pickup",
  "in_transit",
  "delivered",
];

export default function OrderTrackingScreen({ route }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await getOrderDetail(orderId);
      setOrder(res.data.data);
    } catch (error) {
      console.log("Order tracking error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const currentIndex = statuses.indexOf(order.status);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Order Tracking</Text>

      {statuses.map((status, index) => {
        const isActive = index <= currentIndex;
        return (
          <Animated.View
            key={status}
            entering={FadeInUp.delay(index * 100)}
            style={styles.statusRow}
          >
            <View
              style={[
                styles.circle,
                { backgroundColor: isActive ? "#1a8917" : "#ccc" },
              ]}
            />
            <View style={styles.lineContainer}>
              <Text style={[styles.statusText, isActive && { fontWeight: "700", color: "#1a8917" }]}>
                {status.replace(/_/g, " ").toUpperCase()}
              </Text>
              {isActive && (
                <Text style={styles.date}>
                  {new Date(order.updated_at).toLocaleString()}
                </Text>
              )}
            </View>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  statusRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 20 },
  circle: { width: 20, height: 20, borderRadius: 10, marginTop: 5 },
  lineContainer: { marginLeft: 15 },
  statusText: { fontSize: 16, color: "#666" },
  date: { fontSize: 12, color: "#999", marginTop: 4 },
});