import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

import PinInput from "../../components/security/PinInput";
import { confirmWithdrawal } from "../../api/withdraw";

export default function WithdrawPinScreen({ route, navigation }) {

  const { reference } = route.params || {};

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
            });
            break;

          case "processing":
            Alert.alert(
              "Processing",
              "Your withdrawal is currently being processed."
            );
            navigation.popToTop();
            break;

          case "queued":
            Alert.alert(
              "Queued",
              "Your withdrawal is queued and will be processed shortly."
            );
            navigation.popToTop();
            break;

          case "reversed":
            Alert.alert(
              "Reversed",
              "Withdrawal failed. Funds have been returned to your wallet."
            );
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

      console.log("Withdrawal confirm error:", err);

      setError("Invalid PIN or network issue");
      setPin("");

    } finally {

      setLoading(false);

    }

  };


  // Auto submit when PIN reaches 6 digits
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

      {/* Title */}
      <Animated.Text
        entering={FadeInUp.duration(400)}
        style={styles.title}
      >
        Confirm Withdrawal
      </Animated.Text>

      {/* Subtitle */}
      <Animated.Text
        entering={FadeInUp.delay(100)}
        style={styles.subtitle}
      >
        Enter your transaction PIN
      </Animated.Text>

      {/* PIN Input */}
      <PinInput
        pin={pin}
        setPin={setPin}
      />

      {/* Loader */}
      {loading && (
        <ActivityIndicator
          size="large"
          color="#22c55e"
          style={styles.loader}
        />
      )}

      {/* Error Message */}
      {error !== "" && !loading && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}

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
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },

  loader: {
    marginTop: 20,
  },

  error: {
    color: "#ef4444",
    textAlign: "center",
    marginTop: 15,
    fontSize: 14,
  },

});