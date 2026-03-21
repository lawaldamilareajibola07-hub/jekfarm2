import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function TransferReviewScreen({ route, navigation }) {

  const { recipient, amount, currency, purpose } = route.params;

  return (
    <View style={styles.container}>

      <Animated.Text entering={FadeInUp.duration(400)} style={styles.title}>
        Review Transfer
      </Animated.Text>

      <View style={styles.card}>
        <Text style={styles.label}>Recipient</Text>
        <Text style={styles.value}>{recipient}</Text>

        <Text style={styles.label}>Amount</Text>
        <Text style={styles.value}>
          {currency} {Number(amount).toLocaleString()}
        </Text>

        {purpose !== "" && (
          <>
            <Text style={styles.label}>Purpose</Text>
            <Text style={styles.value}>{purpose}</Text>
          </>
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("TransferPin", {
            recipient,
            amount,
            currency,
            purpose
          })
        }
      >
        <Text style={styles.buttonText}>Confirm Transfer</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
    justifyContent: "center",
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 25,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 20,
  },

  label: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 10,
  },

  value: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },

  button: {
    marginTop: 30,
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#0f172a",
  },
});