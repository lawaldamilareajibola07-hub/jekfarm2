import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { initiateWithdrawal } from "../../api/withdraw";

export default function WithdrawReviewScreen({ route, navigation }) {
  const {
    amount,
    bankName,
    bankCode,
    accountNumber,
    accountName,
  } = route.params;

  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);

    const payload = {
      currency: "NGN",
      amount,
      bank_code: bankCode,
      account_number: accountNumber,
      account_name: accountName,
      narration: "Wallet withdrawal",
      idempotency_key: `wd-${Date.now()}`,
    };

    try {
      const res = await initiateWithdrawal(payload);

      if (res.status === "success") {
        navigation.navigate("WithdrawPin", {
          reference: res.data.reference,
        });
      }

      else if (res.code === "TWO_FACTOR_REQUIRED") {
        navigation.navigate("SetTransactionPin");
      }

      else {
        Alert.alert("Error", res.message || "Withdrawal failed");
      }

    } catch (err) {
      Alert.alert("Error", "Network error");
    }

    setLoading(false);
  };

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.container}>
      
      <Animated.Text entering={FadeInUp.duration(400)} style={styles.title}>
        Review Withdrawal
      </Animated.Text>

      <View style={styles.card}>

        <Row label="Amount" value={`₦${amount}`} />
        <Row label="Bank" value={bankName} />
        <Row label="Account Number" value={accountNumber} />
        <Row label="Account Name" value={accountName} />

      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleConfirm}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Confirm Withdrawal</Text>
        )}
      </TouchableOpacity>

    </Animated.View>
  );
}

const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

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
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 20,
    marginBottom: 30,
  },

  row: {
    marginBottom: 16,
  },

  label: {
    color: "#94a3b8",
    fontSize: 13,
  },

  value: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  button: {
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonDisabled: {
    backgroundColor: "#4ade80",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});