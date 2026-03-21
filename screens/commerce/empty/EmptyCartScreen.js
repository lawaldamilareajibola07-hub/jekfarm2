import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

export default function EmptyCartScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.iconBox}>
        <Ionicons name="cart-outline" size={90} color="#2F80ED" />
      </Animated.View>

      <Animated.Text entering={FadeInDown.delay(200)} style={styles.title}>
        Your Cart is Empty
      </Animated.Text>

      <Animated.Text entering={FadeInDown.delay(350)} style={styles.subtitle}>
        Looks like you haven't added any products yet.
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(500)}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Marketplace")}
        >
          <Text style={styles.buttonText}>Start Shopping</Text>
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
    padding: 30,
  },

  iconBox: {
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
    marginBottom: 25,
  },

  button: {
    backgroundColor: "#2F80ED",
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 12,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});