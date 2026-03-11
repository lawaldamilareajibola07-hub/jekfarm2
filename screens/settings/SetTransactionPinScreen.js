import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import Animated, { FadeInUp, FadeInDown, SlideInUp } from "react-native-reanimated";

import PinInput from "../../components/security/PinInput";
import { setTransactionPin } from "../../api/userManager";

export default function SetTransactionPinScreen({ navigation }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("pin"); // "pin" or "confirm"

  // Auto move to confirm step or submit
  useEffect(() => {
    if (pin.length === 6 && step === "pin") setStep("confirm");
    if (confirmPin.length === 6 && step === "confirm") submitPin();
  }, [pin, confirmPin]);

  const submitPin = async () => {
    Keyboard.dismiss();
    setError("");

    // Validation
    if (!pin || !confirmPin) {
      setError("Enter PIN and confirmation");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs do not match");
      setConfirmPin("");
      setStep("confirm");
      return;
    }
    if (!password) {
      setError("Enter account password");
      return;
    }

    setLoading(true);
    try {
      const res = await setTransactionPin(pin, password);

      if (res.status === "success") {
        Alert.alert("Success", "Transaction PIN set successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        setError(res.message || "Failed to set PIN");
        setPin("");
        setConfirmPin("");
        setStep("pin");
      }
    } catch (e) {
      console.log("Set PIN Error:", e);
      setError("Network error. Please try again.");
      setPin("");
      setConfirmPin("");
      setStep("pin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View entering={SlideInUp.duration(400)} style={styles.container}>
      <Animated.Text entering={FadeInUp.duration(400)} style={styles.title}>
        Set Transaction PIN
      </Animated.Text>

      <Animated.Text entering={FadeInUp.delay(150)} style={styles.subtitle}>
        {step === "pin" ? "Enter new PIN" : "Confirm your PIN"}
      </Animated.Text>

      <PinInput
        pin={step === "pin" ? pin : confirmPin}
        setPin={step === "pin" ? setPin : setConfirmPin}
      />

      {/* Password Input */}
      <Animated.View entering={FadeInUp.delay(250)} style={{ marginTop: 20 }}>
        <Text style={styles.passwordLabel}>Account Password</Text>
        <TextInput
          style={styles.passwordInput}
          placeholder="Enter password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </Animated.View>

      {/* Error Message */}
      {error !== "" && (
        <Animated.Text entering={FadeInDown.duration(300)} style={styles.error}>
          {error}
        </Animated.Text>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={submitPin}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {step === "pin" ? "Next" : "Set PIN"}
          </Text>
        )}
      </TouchableOpacity>
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
    textAlign: "center",
    marginBottom: 30,
  },
  passwordLabel: {
    color: "#94a3b8",
    marginBottom: 8,
  },
  passwordInput: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 12,
    color: "#fff",
    fontSize: 16,
  },
  error: {
    color: "#ef4444",
    marginTop: 15,
    textAlign: "center",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
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