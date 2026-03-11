import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Alert,
} from "react-native";

import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";

import PinInput from "../../components/security/PinInput";
import { confirmWithdrawal } from "../../api/withdraw";

export default function ConfirmWithdrawScreenPin({ route, navigation }) {

  const {
    reference,
    amount,
    bankName,
    accountNumber,
    accountName,
  } = route.params;

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitWithdrawal = async () => {
    if (!reference || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await confirmWithdrawal(reference, pin);

      if (res.status === "success") {
        const { status, reference: txRef } = res.data;

        switch (status) {
          case "success":
            navigation.replace("WithdrawSuccess", {
              reference: txRef,
              amount,
              bankName,
              accountNumber,
            });
            break;
          case "processing":
            Alert.alert("Processing", "Your withdrawal is processing.");
            navigation.popToTop();
            break;
          case "queued":
            Alert.alert("Queued", "Withdrawal queued. Please retry later.");
            navigation.popToTop();
            break;
          case "reversed":
            Alert.alert("Failed", "Withdrawal reversed. Funds returned.");
            navigation.popToTop();
            break;
          default:
            setError("Unknown withdrawal status");
            setPin("");
        }
      } else {
        setError(res.message || "Invalid transaction PIN");
        setPin("");
      }
    } catch (err) {
      console.log("Confirm withdrawal error:", err);
      setError("Invalid PIN or network issue");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when PIN reaches 6 digits
  useEffect(() => {
    if (pin.length === 6 && !loading) {
      submitWithdrawal();
    }
  }, [pin]);

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={styles.container}
    >
      <Animated.View layout={Layout.springify()}>

        <Animated.Text
          entering={FadeInUp.duration(400)}
          style={styles.title}
        >
          Confirm Withdrawal
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.delay(100)}
          style={styles.subtitle}
        >
          Amount: ₦{Number(amount).toLocaleString()}{"\n"}
          Bank: {bankName}{"\n"}
          Account: {accountNumber} - {accountName}
        </Animated.Text>

        {/* PIN Input */}
        <PinInput
          pin={pin}
          setPin={setPin}
        />

        {loading && (
          <ActivityIndicator
            size="large"
            color="#22c55e"
            style={{ marginTop: 20 }}
          />
        )}

        {error !== "" && !loading && (
          <Animated.Text
            entering={FadeInUp.duration(400)}
            style={styles.error}
          >
            {error}
          </Animated.Text>
        )}

      </Animated.View>
    </Animated.View>
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
    fontSize: 26,
    fontWeight: "700",
    color: "#22c55e",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    color: "#cbd5f5",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },

  error: {
    color: "#ef4444",
    textAlign: "center",
    marginTop: 15,
    fontSize: 14,
  },
});