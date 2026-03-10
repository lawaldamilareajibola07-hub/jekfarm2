import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  withRepeat,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const WalletBalanceCard = ({ balance, loading }) => {
  const navigation = useNavigation();

  const [displayBalance, setDisplayBalance] = useState(0);
  const [hideBalance, setHideBalance] = useState(false);

  const flashOpacity = useSharedValue(0);
  const balanceOpacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const pulse = useSharedValue(1);

  const flashStyle = useAnimatedStyle(() => {
    return {
      opacity: flashOpacity.value,
    };
  });

  const balanceStyle = useAnimatedStyle(() => {
    return {
      opacity: balanceOpacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
      opacity: pulse.value,
    };
  });

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const toggleBalance = () => {
    balanceOpacity.value = withTiming(0, { duration: 150 }, () => {
      balanceOpacity.value = withTiming(1, { duration: 150 });
    });

    setHideBalance(!hideBalance);
  };

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    let start = displayBalance;
    let end = Number(balance || 0);

    if (end > start) {
      flashOpacity.value = withTiming(0.4, { duration: 300 });
      scale.value = withSequence(
        withSpring(1.06),
        withSpring(1)
      );

      setTimeout(() => {
        flashOpacity.value = withTiming(0, { duration: 500 });
      }, 600);
    }

    let duration = 600;
    let stepTime = 20;
    let steps = duration / stepTime;
    let increment = (end - start) / steps;

    let timer = setInterval(() => {
      start += increment;

      if (
        (increment > 0 && start >= end) ||
        (increment < 0 && start <= end)
      ) {
        start = end;
        clearInterval(timer);
      }

      setDisplayBalance(start);
    }, stepTime);

    return () => clearInterval(timer);
  }, [balance]);

  return (
    <Animated.View entering={FadeInDown.duration(600)} style={styles.card}>
      <Animated.View style={[styles.flashOverlay, flashStyle]} />

      <LinearGradient
        colors={["#0f172a", "#1e293b"]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.label}>Total Balance</Text>

          <View style={styles.liveContainer}>
            <Animated.View style={[styles.liveDot, pulseStyle]} />
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
        </View>

        {/* Balance + Toggle */}
        {loading ? (
          <View style={styles.shimmer} />
        ) : (
          <View style={styles.balanceRow}>
            <Animated.Text style={[styles.balance, balanceStyle]}>
              {hideBalance ? "₦••••••" : `₦${formatMoney(displayBalance)}`}
            </Animated.Text>

            <TouchableOpacity onPress={toggleBalance} style={styles.eyeButton}>
              <Ionicons
                name={hideBalance ? "eye-off" : "eye"}
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.action}
            onPress={() => navigation.navigate("FundWallet")}
          >
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
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    borderRadius: 20,
    overflow: "hidden",
  },

  gradient: {
    padding: 20,
    borderRadius: 20,
  },

  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#22c55e",
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

  liveContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: "#22c55e",
    marginRight: 6,
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

  shimmer: {
    height: 40,
    width: 180,
    backgroundColor: "#1e293b",
    borderRadius: 8,
    marginTop: 10,
  },

  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  balance: {
    fontSize: 34,
    color: "#fff",
    fontWeight: "700",
  },

  eyeButton: {
    marginLeft: 10,
    padding: 6,
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