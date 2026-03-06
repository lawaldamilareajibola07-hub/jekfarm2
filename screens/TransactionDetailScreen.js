// /screens/TransactionDetailScreen.js

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import Animated, { FadeInRight } from "react-native-reanimated";

const TransactionDetailScreen = () => {
  const route = useRoute();
  const { transaction } = route.params || {};

  if (!transaction) {
    return (
      <View style={styles.center}>
        <Text>No transaction details found.</Text>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeInRight.duration(500)} style={styles.container}>
      <Text style={styles.title}>Transaction Details</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>{transaction.title}</Text>

        <Text style={styles.label}>Amount</Text>
        <Text style={[styles.value, { color: transaction.color }]}>
          ₦{Math.abs(transaction.amount).toLocaleString()}
        </Text>

        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>{transaction.time}</Text>

        {transaction.reference && (
          <>
            <Text style={styles.label}>Reference</Text>
            <Text style={styles.value}>{transaction.reference}</Text>
          </>
        )}
      </View>
    </Animated.View>
  );
};

export default TransactionDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
  },
  label: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});