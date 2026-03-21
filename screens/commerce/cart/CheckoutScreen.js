import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";

import Animated, { FadeInUp } from "react-native-reanimated";

import { getCartItems } from "../../../api/commerce/cart";
import { createOrder } from "../../../api/commerce/orders";

export default function CheckoutScreen({ navigation }) {
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await getCartItems();
      setCart(res.data.data);
    } catch (error) {
      console.log("Checkout cart error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const logisticsFee = 2000;
  const total = subtotal + logisticsFee;

  const handleCheckout = async () => {
    try {
      const res = await createOrder({
        address,
      });

      navigation.navigate("OrderSuccess", {
        orderId: res.data.data.id,
      });
    } catch (error) {
      console.log("Order error", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>Checkout</Text>

      {/* Delivery Address */}
      <Animated.View entering={FadeInUp.delay(100)}>
        <Text style={styles.label}>Delivery Address</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter delivery address"
          value={address}
          onChangeText={setAddress}
        />
      </Animated.View>

      {/* Order Summary */}
      <Animated.View entering={FadeInUp.delay(200)} style={styles.summary}>
        <Text style={styles.summaryTitle}>Order Summary</Text>

        {cart.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text>{item.product.name}</Text>
            <Text>
              ₦{(item.price * item.quantity).toLocaleString()}
            </Text>
          </View>
        ))}

        <View style={styles.row}>
          <Text>Logistics</Text>
          <Text>₦{logisticsFee.toLocaleString()}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.total}>Total</Text>
          <Text style={styles.total}>
            ₦{total.toLocaleString()}
          </Text>
        </View>
      </Animated.View>

      {/* Confirm Order */}
      <Animated.View entering={FadeInUp.delay(300)}>
        <TouchableOpacity style={styles.button} onPress={handleCheckout}>
          <Text style={styles.buttonText}>Confirm Order</Text>
        </TouchableOpacity>
      </Animated.View>

    </ScrollView>
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
    marginBottom: 20,
  },

  label: {
    fontWeight: "600",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },

  summary: {
    marginBottom: 20,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  total: {
    fontWeight: "700",
  },

  button: {
    backgroundColor: "#1a8917",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});