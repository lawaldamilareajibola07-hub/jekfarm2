import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  Alert,
  ActivityIndicator,
} from "react-native";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

import PinInput from "../../components/security/PinInput"; // Circle-style input
import { changeTransactionPin } from "../../api/userManager";

export default function ChangePinScreen({ navigation }) {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("current"); // current | new | confirm

  // Auto-move between steps
  useEffect(() => {
    if (currentPin.length === 6 && step === "current") setStep("new");
    if (newPin.length === 6 && step === "new") setStep("confirm");
    if (confirmPin.length === 6 && step === "confirm") submitPinChange();
  }, [currentPin, newPin, confirmPin]);

  const submitPinChange = async () => {
    Keyboard.dismiss();
    setError("");
    setLoading(true);

    // Validation
    if (newPin !== confirmPin) {
      setError("New PIN and confirmation do not match");
      setConfirmPin("");
      setLoading(false);
      return;
    }

    try {
      const res = await changeTransactionPin({
        current_pin: currentPin,
        new_pin: newPin,
        new_pin_confirmation: confirmPin,
      });

      if (res.status === "success") {
        Alert.alert("Success", res.message, [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        setError(res.message || "Something went wrong");
        setCurrentPin("");
        setNewPin("");
        setConfirmPin("");
        setStep("current");
      }
    } catch (e) {
      console.log("Change PIN Error:", e);
      setError("Network error. Please try again.");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setStep("current");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.container}>
      <Animated.Text entering={FadeInUp.duration(400)} style={styles.title}>
        Change Transaction PIN
      </Animated.Text>

      <Animated.Text entering={FadeInUp.delay(100)} style={styles.subtitle}>
        {step === "current"
          ? "Enter your current PIN"
          : step === "new"
          ? "Enter new PIN"
          : "Confirm new PIN"}
      </Animated.Text>

      {/* PIN Input */}
      <PinInput
        pin={step === "current" ? currentPin : step === "new" ? newPin : confirmPin}
        setPin={
          step === "current"
            ? setCurrentPin
            : step === "new"
            ? setNewPin
            : setConfirmPin
        }
      />

      {/* Loading Indicator */}
      {loading && (
        <ActivityIndicator
          size="large"
          color="#22c55e"
          style={{ marginTop: 20 }}
        />
      )}

      {/* Error Message */}
      {error !== "" && (
        <Animated.Text entering={FadeInDown.duration(300)} style={styles.error}>
          {error}
        </Animated.Text>
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
    marginBottom: 30,
  },

  error: {
    color: "#ef4444",
    textAlign: "center",
    marginTop: 15,
    fontWeight: "500",
  },
});