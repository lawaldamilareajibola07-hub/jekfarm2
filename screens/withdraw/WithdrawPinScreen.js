import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import PinInput from "../../components/security/PinInput";
import { confirmWithdrawal } from "../../api/withdraw";

export default function WithdrawPinScreen({ route, navigation }) {
  const { reference } = route.params;

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitWithdrawal = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await confirmWithdrawal(reference, pin);

      if (res.status === "success") {
        const status = res.data.status;

        if (status === "success") {
          navigation.replace("WithdrawSuccess", {
            reference: res.data.reference,
          });
        }

        else if (status === "processing") {
          Alert.alert("Processing", "Your withdrawal is processing.");
          navigation.popToTop();
        }

        else if (status === "queued") {
          Alert.alert("Queued", "Withdrawal queued. Please retry later.");
          navigation.popToTop();
        }

        else if (status === "reversed") {
          Alert.alert("Reversed", "Withdrawal failed. Funds returned to wallet.");
          navigation.popToTop();
        }

      } else {
        setError(res.message || "Withdrawal failed");
        setPin("");
      }

    } catch (err) {
      setError("Invalid PIN or network issue");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  // AUTO SUBMIT WHEN PIN = 6
  useEffect(() => {
    if (pin.length === 6 && !loading) {
      submitWithdrawal();
    }
  }, [pin]);

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.container}>
      
      <Animated.Text entering={FadeInUp.duration(400)} style={styles.title}>
        Confirm Withdrawal
      </Animated.Text>

      <Animated.Text entering={FadeInUp.delay(100)} style={styles.subtitle}>
        Enter your transaction PIN
      </Animated.Text>

      <PinInput pin={pin} setPin={setPin} />

      {loading && (
        <ActivityIndicator
          size="large"
          color="#22c55e"
          style={{ marginTop: 20 }}
        />
      )}

      {error !== "" && (
        <Text style={styles.error}>{error}</Text>
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
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 16,
    textAlign: "center",
  },

  error: {
    color: "#ef4444",
    textAlign: "center",
    marginTop: 15,
  },
});