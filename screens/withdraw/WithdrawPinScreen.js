import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Animated as RNAnimated,
} from "react-native";

import Animated, { FadeInDown, FadeInUp, SlideInUp } from "react-native-reanimated";

import PinInput from "../../components/security/PinInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { confirmWithdrawalPin } from "../../api/withdraw";

export default function WithdrawPinScreen({ route, navigation }) {

  let { reference } = route.params || {};

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pinSet, setPinSet] = useState(false); // Tracks if user has set a PIN before

  const requestLock = useRef(false);
  const shakeAnim = useRef(new RNAnimated.Value(0)).current;

  // Load PIN state from storage
  useEffect(() => {
    AsyncStorage.getItem("transaction_pin_set").then((val) => {
      if (val === "true") setPinSet(true);
    });
  }, []);

  const shake = () => {
    RNAnimated.sequence([
      RNAnimated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      RNAnimated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      RNAnimated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      RNAnimated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      RNAnimated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const submitWithdrawal = useCallback(async () => {
    if (!reference || loading || requestLock.current || pin.length !== 6) return;

    requestLock.current = true;
    setLoading(true);
    setError("");

    try {
      const res = await confirmWithdrawalPin(reference, pin);

      if (res.status === "success") {
        const { status, reference: txRef } = res.data;
        switch (status) {
          case "success":
            navigation.replace("WithdrawSuccess", { reference: txRef });
            break;
          case "processing":
            Alert.alert("Processing", "Your withdrawal is currently being processed.");
            navigation.popToTop();
            break;
          case "queued":
            Alert.alert("Queued", "Your withdrawal is queued and will be processed shortly.");
            navigation.popToTop();
            break;
          case "reversed":
            Alert.alert("Reversed", "Withdrawal failed. Funds have been returned to your wallet.");
            navigation.popToTop();
            break;
          default:
            setError("Unknown withdrawal status");
            setPin("");
            shake();
            reference = null;
        }
      } else {
        if (res.code === "PIN_NOT_SET") {
          // Show "Set PIN" button instead of error
          setError("");
          return;
        }

        if (res.code === "INSUFFICIENT_BALANCE") {
          setError("Your wallet balance is insufficient for this withdrawal.");
          setPin("");
          shake();
          reference = null;
          return;
        }

        setError(res.message || "Invalid transaction PIN");
        setPin("");
        shake();
        reference = null;
      }

    } catch (err) {
      console.log("Withdrawal confirm error:", err);
      setError("Invalid PIN or network issue");
      setPin("");
      shake();
      reference = null;
    } finally {
      requestLock.current = false;
      setLoading(false);
    }
  }, [pin, loading, reference, navigation]);

  // Auto-submit PIN
  useEffect(() => {
    if (pin.length === 6) submitWithdrawal();
    return () => { reference = null; };
  }, [pin, submitWithdrawal]);

  // Handlers for PIN setup & change
  const handleSetPin = () => {
    navigation.replace("SetTransactionPin", {
      redirectTo: "WithdrawPin",
      reference,
    });
  };

  const handleForgotPin = () => {
    navigation.replace("ChangePinScreen");
  };

  return (
    <Animated.View entering={SlideInUp.duration(450)} style={styles.container}>
      <Animated.Text entering={FadeInUp.duration(500)} style={styles.title}>
        Confirm Withdrawal
      </Animated.Text>
      <Animated.Text entering={FadeInUp.delay(150)} style={styles.subtitle}>
        Enter your transaction PIN
      </Animated.Text>

      <RNAnimated.View style={{ transform: [{ translateX: shakeAnim }] }}>
        <PinInput pin={pin} setPin={setPin} />
      </RNAnimated.View>

      {loading && (
        <Animated.View entering={FadeInDown.delay(100)} style={styles.loader}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Verifying transaction...</Text>
        </Animated.View>
      )}

      {error !== "" && !loading && (
        <Animated.Text entering={FadeInDown.duration(300)} style={styles.error}>
          {error}
        </Animated.Text>
      )}

      {!pinSet && !loading && error === "" && (
        <Animated.View entering={FadeInUp.delay(200)} style={styles.actionWrapper}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSetPin}>
            <Text style={styles.actionText}>Set Transaction PIN</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {pinSet && !loading && (
        <Animated.View entering={FadeInUp.delay(200)} style={styles.actionWrapper}>
          <TouchableOpacity style={styles.actionButton} onPress={handleForgotPin}>
            <Text style={styles.actionText}>Forgot PIN?</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 20, justifyContent: "center" },
  title: { color: "#fff", fontSize: 28, fontWeight: "700", marginBottom: 10, textAlign: "center" },
  subtitle: { color: "#94a3b8", fontSize: 16, textAlign: "center", marginBottom: 20 },
  loader: { marginTop: 25, alignItems: "center" },
  loadingText: { color: "#94a3b8", marginTop: 10, fontSize: 14 },
  error: { color: "#ef4444", textAlign: "center", marginTop: 18, fontSize: 14 },
  actionWrapper: { marginTop: 25, alignItems: "center" },
  actionButton: { padding: 12, backgroundColor: "#22c55e", borderRadius: 12 },
  actionText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});