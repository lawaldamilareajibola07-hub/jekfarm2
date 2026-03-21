import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import Animated, { FadeInUp } from "react-native-reanimated";

import { getOrders } from "../../../api/commerce/orders";

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
      setOrders(res.data.data);
    } catch (error) {
      console.log("Orders error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const renderItem = ({ item, index }) => {
    return (
      <Animated.View
        entering={FadeInUp.delay(index * 80)}
        style={styles.card}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("OrderDetail", { orderId: item.id })
          }
        >
          <Text style={styles.orderId}>Order #{item.id}</Text>

          <Text style={styles.vendor}>
            Vendor: {item.vendor?.first_name}
          </Text>

          <Text style={styles.total}>
            ₦{parseFloat(item.total_amount).toLocaleString()}
          </Text>

          <View style={styles.statusRow}>
            <Text style={styles.status}>{item.status}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Orders</Text>

      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 3,
  },

  orderId: {
    fontWeight: "700",
  },

  vendor: {
    marginTop: 5,
    color: "#666",
  },

  total: {
    marginTop: 5,
    fontWeight: "700",
    color: "#1a8917",
  },

  statusRow: {
    marginTop: 10,
  },

  status: {
    fontSize: 12,
    color: "#fff",
    backgroundColor: "#1a8917",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});