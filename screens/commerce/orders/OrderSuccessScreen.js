import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

export default function OrderSuccessScreen({ route, navigation }) {
  const { orderId } = route.params;

  return (
    <View style={styles.container}>

      <Animated.Text entering={FadeInDown.duration(500)} style={styles.emoji}>
        🎉
      </Animated.Text>

      <Animated.Text entering={FadeInUp.delay(200)} style={styles.title}>
        Order Placed Successfully
      </Animated.Text>

      <Animated.Text entering={FadeInUp.delay(300)} style={styles.subtitle}>
        Your order has been received and is being processed.
      </Animated.Text>

      <Animated.Text entering={FadeInUp.delay(400)} style={styles.orderId}>
        Order ID: {orderId}
      </Animated.Text>

      <Animated.View entering={FadeInUp.delay(500)}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() =>
            navigation.navigate("OrderDetail", { orderId })
          }
        >
          <Text style={styles.primaryText}>View Order</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(600)}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate("Marketplace")}
        >
          <Text style={styles.secondaryText}>Continue Shopping</Text>
        </TouchableOpacity>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  emoji: {
    fontSize: 70,
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 10,
    textAlign: "center",
    color: "#666",
  },

  orderId: {
    marginTop: 15,
    fontWeight: "600",
  },

  primaryBtn: {
    marginTop: 30,
    backgroundColor: "#1a8917",
    padding: 15,
    borderRadius: 10,
    width: 220,
    alignItems: "center",
  },

  primaryText: {
    color: "#fff",
    fontWeight: "700",
  },

  secondaryBtn: {
    marginTop: 10,
    padding: 12,
  },

  secondaryText: {
    color: "#1a8917",
    fontWeight: "600",
  },
});