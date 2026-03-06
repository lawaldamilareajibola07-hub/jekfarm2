import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const WalletBalanceCard = ({ balance, loading }) => {
  return (
    <Animated.View entering={FadeInDown.duration(600)} style={styles.card}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.label}>Total Balance</Text>

        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Balance */}
      {loading ? (
        <ActivityIndicator color="#22c55e" size="small" />
      ) : (
        <Text style={styles.balance}>
          ₦{balance?.toLocaleString() || "0.00"}
        </Text>
      )}

      {/* Buttons */}
      <View style={styles.actions}>

        <TouchableOpacity style={styles.action}>
          <View style={[styles.iconCircle, { backgroundColor: "#14532d" }]}>
            <Ionicons name="arrow-down" size={18} color="#fff" />
          </View>
          <Text style={styles.actionText}>Add Funds</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action}>
          <View style={[styles.iconCircle, { backgroundColor: "#1e3a8a" }]}>
            <Ionicons name="arrow-up" size={18} color="#fff" />
          </View>
          <Text style={styles.actionText}>Transfer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action}>
          <View style={[styles.iconCircle, { backgroundColor: "#4c1d95" }]}>
            <Ionicons name="refresh" size={18} color="#fff" />
          </View>
          <Text style={styles.actionText}>Exchange</Text>
        </TouchableOpacity>

      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0f172a",
    margin: 16,
    borderRadius: 20,
    padding: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    color: "#cbd5f5",
    fontSize: 14,
  },

  liveBadge: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },

  liveText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  balance: {
    fontSize: 34,
    color: "#fff",
    fontWeight: "700",
    marginTop: 10,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },

  action: {
    alignItems: "center",
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  actionText: {
    color: "#e5e7eb",
    fontSize: 12,
  },
});

export default WalletBalanceCard;