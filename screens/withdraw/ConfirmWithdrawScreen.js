import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";

const ConfirmWithdrawScreen = ({ route, navigation }) => {
  const { amount, bankCode, accountNumber, accountName } = route.params;

  const handleContinue = () => {
    // Pass all necessary params to OTP screen
    navigation.navigate("WithdrawOtp", {
      amount,
      bankCode,
      accountNumber,
      accountName,
    });
  };

  // Format amount with commas
  const formatAmount = (amt) => {
    if (!amt) return "";
    return amt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(500)}
      style={styles.container}
    >
      <Text style={styles.title}>Confirm Withdrawal</Text>

      <Animated.View layout={Layout.springify()} entering={FadeInUp.delay(100)}>
        <View style={styles.card}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.value}>₦{formatAmount(amount)}</Text>
        </View>
      </Animated.View>

      <Animated.View layout={Layout.springify()} entering={FadeInUp.delay(200)}>
        <View style={styles.card}>
          <Text style={styles.label}>Account Number</Text>
          <Text style={styles.value}>{accountNumber}</Text>
        </View>
      </Animated.View>

      <Animated.View layout={Layout.springify()} entering={FadeInUp.delay(300)}>
        <View style={styles.card}>
          <Text style={styles.label}>Account Name</Text>
          <Text style={styles.value}>{accountName}</Text>
        </View>
      </Animated.View>

      <Animated.View layout={Layout.springify()} entering={FadeInUp.delay(400)}>
        <View style={styles.card}>
          <Text style={styles.label}>Bank Code</Text>
          <Text style={styles.value}>{bankCode}</Text>
        </View>
      </Animated.View>

      <TouchableOpacity style={styles.button} onPress={handleContinue} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Proceed to OTP</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ConfirmWithdrawScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    color: "#fff",
    marginBottom: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  label: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 12,
    marginTop: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});