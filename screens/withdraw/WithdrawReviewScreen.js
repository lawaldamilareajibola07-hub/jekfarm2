import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInRight,
} from "react-native-reanimated";

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

  const formattedAmount = Number(amount).toLocaleString();

  const handleConfirm = async () => {
    if (loading) return;

    setLoading(true);

    const payload = {
      currency: "NGN",
      amount,
      bank_code: bankCode,
      account_number: accountNumber,
      account_name: accountName,
      narration: "Wallet withdrawal",
      idempotency_key: `wd-${Date.now()}-${Math.random().toString(36).substring(2,8)}`,
    };

    try {

      const res = await initiateWithdrawal(payload);

      if (res.status === "success") {

        const reference = res.data.reference;

        navigation.navigate("WithdrawPin", {
          reference,
          amount,
          bankName,
          accountNumber,
          accountName,
        });

      } 
      
      else if (res.code === "TWO_FACTOR_REQUIRED") {

        Alert.alert(
          "Transaction PIN Required",
          "You need to set a transaction PIN before making withdrawals.",
          [
            {
              text: "Set PIN",
              onPress: () => navigation.navigate("SetTransactionPin"),
            },
          ]
        );

      } 
      
      else {

        Alert.alert("Withdrawal Failed", res.message || "Unable to process withdrawal");

      }

    } catch (error) {

      console.log("Withdrawal error:", error);

      Alert.alert(
        "Network Error",
        "Please check your internet connection and try again."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <View style={styles.container}>

      {/* Title */}
      <Animated.Text
        entering={FadeInDown.duration(500)}
        style={styles.title}
      >
        Review Withdrawal
      </Animated.Text>

      {/* Summary Card */}
      <Animated.View
        entering={FadeInUp.delay(100)}
        style={styles.card}
      >

        <Row label="Amount" value={`₦${formattedAmount}`} />

        <Row label="Bank" value={bankName} />

        <Row label="Account Number" value={accountNumber} />

        <Row label="Account Name" value={accountName} />

      </Animated.View>

      {/* Confirm Button */}
      <Animated.View entering={FadeInUp.delay(200)}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              Confirm Withdrawal
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Cancel Button */}
      <Animated.View entering={FadeInRight.delay(250)}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelText}>Go Back</Text>
        </TouchableOpacity>
      </Animated.View>

    </View>
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
    padding: 24,
    justifyContent: "center",
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 30,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 22,
    marginBottom: 30,
  },

  row: {
    marginBottom: 18,
  },

  label: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 3,
  },

  value: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  button: {
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonDisabled: {
    backgroundColor: "#4ade80",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  cancelButton: {
    marginTop: 18,
    alignItems: "center",
  },

  cancelText: {
    color: "#94a3b8",
    fontSize: 15,
  },

});