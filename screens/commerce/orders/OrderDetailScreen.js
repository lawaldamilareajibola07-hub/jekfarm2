import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

import { getOrderDetail } from "../../../api/commerce/orders";

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await getOrderDetail(orderId);
      setOrder(res.data.data);
    } catch (error) {
      console.log("Order detail error", error);
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

  const totalItems = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <ScrollView style={styles.container}>

      <Animated.Text entering={FadeInDown.duration(500)} style={styles.orderId}>
        Order #{order.id}
      </Animated.Text>

      <Animated.View entering={FadeInUp.delay(100)} style={styles.section}>
        <Text style={styles.sectionTitle}>Vendor</Text>
        <Text>{order.vendor.first_name} {order.vendor.last_name}</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <Text>{order.delivery_address}</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
        <Text style={styles.sectionTitle}>Items ({totalItems})</Text>

        {order.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text>{item.product.name} x{item.quantity}</Text>
            <Text>₦{(item.price * item.quantity).toLocaleString()}</Text>
          </View>
        ))}

        <View style={styles.itemRow}>
          <Text>Logistics</Text>
          <Text>₦{order.logistics_fee.toLocaleString()}</Text>
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.total}>Total</Text>
          <Text style={styles.total}>₦{(subtotal + order.logistics_fee).toLocaleString()}</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400)} style={styles.section}>
        <Text style={styles.sectionTitle}>Order Status</Text>
        <Text style={styles.status}>{order.status}</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(500)} style={styles.buttons}>
        {order.status === "delivered" ? null : (
          <TouchableOpacity style={styles.confirmBtn}>
            <Text style={styles.confirmText}>Confirm Delivery</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.disputeBtn}>
          <Text style={styles.disputeText}>Raise Dispute</Text>
        </TouchableOpacity>
      </Animated.View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  orderId: { fontSize: 22, fontWeight: "700", marginBottom: 20 },

  section: { marginBottom: 20 },

  sectionTitle: { fontWeight: "700", marginBottom: 6 },

  itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },

  total: { fontWeight: "700", color: "#1a8917" },

  status: {
    backgroundColor: "#1a8917",
    color: "#fff",
    padding: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },

  buttons: { marginTop: 20 },

  confirmBtn: {
    backgroundColor: "#1a8917",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  confirmText: { color: "#fff", fontWeight: "700" },

  disputeBtn: {
    borderWidth: 1,
    borderColor: "#1a8917",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  disputeText: { color: "#1a8917", fontWeight: "700" },
});