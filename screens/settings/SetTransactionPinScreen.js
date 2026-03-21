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
import { Ionicons } from "@expo/vector-icons";

import PinInput from "../../components/security/PinInput";
import { setTransactionPin } from "../../api/userManager";

export default function SetTransactionPinScreen({ navigation, route }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("pin"); // "pin" | "confirm"

  const { redirectTo } = route?.params || {};

  useEffect(() => {
    if (pin.length === 6 && step === "pin") setStep("confirm");
    if (confirmPin.length === 6 && step === "confirm") submitPin();
  }, [pin, confirmPin]);

  const submitPin = async () => {
    Keyboard.dismiss();
    setError("");

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
          {
            text: "OK",
            onPress: () => {
              if (redirectTo) {
                navigation.replace(redirectTo);
              } else {
                navigation.goBack();
              }
            },
          },
        ]);
      } else if (res.code === "INTERNAL_ERROR") {
        if (res.message.toLowerCase().includes("already")) {
          Alert.alert(
            "PIN already set",
            "You already have a transaction PIN. Please use Change PIN instead.",
            [
              {
                text: "Go to Change PIN",
                onPress: () => navigation.navigate("ChangePinScreen"),
              },
            ]
          );
        } else {
          setError(res.message || "Something went wrong. Please try again.");
        }
        resetPin();
      } else {
        setError(res.message || "Failed to set PIN");
        resetPin();
      }
    } catch (e) {
      console.log("Set PIN Error:", e.response?.data || e.message);
      setError("Network error. Please try again.");
      resetPin();
    } finally {
      setLoading(false);
    }
  };

  const resetPin = () => {
    setPin("");
    setConfirmPin("");
    setStep("pin");
  };

  return (
    <Animated.View entering={SlideInUp.duration(400)} style={styles.container}>
      {/* Title */}
      <Animated.Text entering={FadeInUp.duration(400)} style={styles.title}>
        Set Transaction PIN
      </Animated.Text>

      {/* Step subtitle */}
      <Animated.Text entering={FadeInUp.delay(150)} style={styles.subtitle}>
        {step === "pin" ? "Enter new PIN" : "Confirm your PIN"}
      </Animated.Text>

      {/* Pin Input */}
      <PinInput
        pin={step === "pin" ? pin : confirmPin}
        setPin={step === "pin" ? setPin : setConfirmPin}
      />

      {/* Password Input */}
      <Animated.View entering={FadeInUp.delay(250)} style={{ marginTop: 20 }}>
        <Text style={styles.passwordLabel}>Account Password</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter password"
            placeholderTextColor="#94a3b8"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.toggleButton}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color="#94a3b8"
            />
          </TouchableOpacity>
        </View>
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
          <Text style={styles.buttonText}>{step === "pin" ? "Next" : "Set PIN"}</Text>
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
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    color: "#fff",
    fontSize: 16,
  },
  toggleButton: {
    marginLeft: 8,
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