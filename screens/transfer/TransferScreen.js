import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Keyboard,
  Animated as RNAnimated,
} from "react-native";

import Animated, { FadeInUp, FadeInDown, SlideInUp } from "react-native-reanimated";
import { generateIdempotencyKey, transferFunds } from "../../api/transfer";
import TransferSuccessModal from "./TransferSuccessModal";

export default function TransferScreen({ navigation }) {

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");

  const shakeAnim = useRef(new RNAnimated.Value(0)).current;
  const requestLock = useRef(false);

  const shake = () => {
    RNAnimated.sequence([
      RNAnimated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      RNAnimated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      RNAnimated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      RNAnimated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      RNAnimated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const submitTransfer = useCallback(async () => {
    if (!recipient || !amount || Number(amount) <= 0 || requestLock.current) return;

    requestLock.current = true;
    setLoading(true);
    setError("");
    Keyboard.dismiss();

    try {
      const idempotency_key = generateIdempotencyKey();
      const res = await transferFunds({ recipient, amount, currency, purpose, idempotency_key });

      if (res.status === "success") {
        if (res.code === "TWO_FACTOR_REQUIRED") {
          // User hasn’t set PIN → redirect to set PIN screen
          Alert.alert(
            "Transaction PIN Required",
            "You need to set a transaction PIN before making transfers.",
            [{
              text: "Set PIN",
              onPress: () =>
                navigation.navigate("SetTransactionPinScreen", {
                  redirectTo: "TransferScreen",
                  recipient,
                  amount,
                  currency,
                  purpose
                }),
            }]
          );
          return;
        }
        setSuccessData(res.data);
      } else {
        if (res.code === "INSUFFICIENT_BALANCE") {
          setError("Your wallet balance is insufficient for this transfer.");
        } else if (res.code === "NOT_FOUND") {
          setError("Recipient not found. Check phone/email.");
        } else if (res.code === "PIN_LOCKED") {
          Alert.alert(
            "PIN Locked",
            "Your transaction PIN is temporarily locked.",
            [{ text: "Forgot PIN?", onPress: () => navigation.navigate("ChangeTransactionPinScreen") }]
          );
        } else {
          setError(res.message || "Transfer failed. Try again.");
        }
        shake();
      }

    } catch (err) {
      console.log("Transfer error:", err);
      setError("Network or server error. Try again.");
      shake();
    } finally {
      requestLock.current = false;
      setLoading(false);
    }

  }, [recipient, amount, currency, purpose]);

  const confirmWithPin = useCallback(async () => {
    if (!pin || pin.length !== 6) return;

    setLoading(true);
    setError("");

    try {
      const res = await transferFunds({ recipient, amount, currency, purpose, pin, confirm: true });

      if (res.status === "success") {
        setSuccessData(res.data);
        setShowPin(false);
        setPin("");
      } else {
        setError(res.message || "Invalid PIN. Try again.");
        shake();
        setPin("");
      }
    } catch (err) {
      console.log("PIN confirm error:", err);
      setError("Invalid PIN or network issue");
      shake();
      setPin("");
    } finally {
      setLoading(false);
    }
  }, [pin, recipient, amount, currency, purpose]);

  return (
    <Animated.View entering={SlideInUp.duration(500)} style={styles.container}>
      <Animated.Text entering={FadeInUp.duration(500)} style={styles.title}>
        Wallet Transfer
      </Animated.Text>

      <RNAnimated.View style={{ transform: [{ translateX: shakeAnim }] }}>
        <TextInput
          placeholder="Recipient phone/email"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={recipient}
          onChangeText={setRecipient}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Amount"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Purpose (optional)"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={purpose}
          onChangeText={setPurpose}
        />
      </RNAnimated.View>

      {error !== "" && <Animated.Text entering={FadeInDown.duration(300)} style={styles.error}>{error}</Animated.Text>}

      {loading && (
        <Animated.View entering={FadeInDown.delay(100)} style={styles.loader}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Processing transfer...</Text>
        </Animated.View>
      )}

      {showPin && !loading && (
        <View style={styles.pinContainer}>
          <Text style={styles.subtitle}>Enter your transaction PIN</Text>
          <TextInput
            placeholder="******"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={pin}
            onChangeText={setPin}
            keyboardType="numeric"
            secureTextEntry
            maxLength={6}
          />
          <TouchableOpacity style={styles.submitButton} onPress={confirmWithPin}>
            <Text style={styles.submitButtonText}>Confirm Transfer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.forgotPinButton} onPress={() => navigation.navigate("ChangeTransactionPinScreen")}>
            <Text style={styles.forgotPinText}>Forgot PIN?</Text>
          </TouchableOpacity>
        </View>
      )}

      {!showPin && !loading && (
        <TouchableOpacity style={styles.submitButton} onPress={submitTransfer}>
          <Text style={styles.submitButtonText}>Send Transfer</Text>
        </TouchableOpacity>
      )}

      {successData && (
        <TransferSuccessModal
          data={successData}
          onClose={() => setSuccessData(null)}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 20, justifyContent: "center" },
  title: { color: "#fff", fontSize: 28, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  subtitle: { color: "#94a3b8", fontSize: 16, textAlign: "center", marginBottom: 10 },
  input: { backgroundColor: "#1e293b", color: "#fff", padding: 15, borderRadius: 10, marginVertical: 8, fontSize: 16 },
  submitButton: { backgroundColor: "#22c55e", padding: 15, borderRadius: 10, marginTop: 20, alignItems: "center" },
  submitButtonText: { color: "#0f172a", fontSize: 16, fontWeight: "700" },
  loader: { marginTop: 25, alignItems: "center" },
  loadingText: { color: "#94a3b8", marginTop: 10, fontSize: 14 },
  error: { color: "#ef4444", textAlign: "center", marginTop: 10, fontSize: 14 },
  pinContainer: { marginTop: 20 },
  forgotPinButton: { marginTop: 10, alignItems: "center" },
  forgotPinText: { color: "#facc15", fontSize: 14, textDecorationLine: "underline" },
});