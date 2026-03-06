import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";

const TransactionItem = ({ transaction }) => {
  const { title, time, amount, color, icon, source, reference } = transaction;

  return (
    <Animated.View entering={FadeInRight.duration(500)}>
      <TouchableOpacity style={styles.container} activeOpacity={0.7}>
        <Image source={icon} style={styles.icon} />
        <View style={styles.details}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.time}>{time}</Text>
          {source && <Text style={styles.source}>Via {source}</Text>}
          {reference && reference !== "N/A" && (
            <Text style={styles.reference}>Ref: {reference}</Text>
          )}
        </View>
        <Text style={[styles.amount, { color }]}>{amount > 0 ? "+" : ""}₦{Math.abs(amount).toLocaleString()}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f3f2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  icon: { width: 40, height: 40, borderRadius: 10, marginRight: 12 },
  details: { flex: 1 },
  title: { fontSize: 14, fontWeight: "600", color: "#1F2937", marginBottom: 2 },
  time: { fontSize: 12, color: "#9CA3AF" },
  source: { fontSize: 11, color: "#6B7280" },
  reference: { fontSize: 10, color: "#9CA3AF" },
  amount: { fontSize: 15, fontWeight: "700" },
});

export default TransactionItem;