import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Alert,
  ActivityIndicator,
} from "react-native";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

import { changeTransactionPin } from "../../api/userManager"; // We'll create this API call

export default function ChangePinScreen({ navigation }) {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChangePin = async () => {
    Keyboard.dismiss();
    setError("");

    // Basic validation
    if (!currentPin || !newPin || !confirmPin) {
      return setError("All fields are required");
    }
    if (newPin !== confirmPin) {
      return setError("New PIN and confirmation do not match");
    }
    if (newPin.length !== 6 || currentPin.length !== 6) {
      return setError("PIN must be 6 digits");
    }

    setLoading(true);

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
      }
    } catch (e) {
      console.log("Change PIN Error:", e);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.container}>
      <Animated.Text entering={FadeInUp.duration(400)} style={styles.title}>
        Change Transaction PIN
      </Animated.Text>

      <Animated.View entering={FadeInUp.delay(100)}>
        <TextInput
          style={styles.input}
          placeholder="Current PIN"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          secureTextEntry
          maxLength={6}
          value={currentPin}
          onChangeText={(text) => setCurrentPin(text.replace(/[^0-9]/g, ""))}
        />

        <TextInput
          style={styles.input}
          placeholder="New PIN"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          secureTextEntry
          maxLength={6}
          value={newPin}
          onChangeText={(text) => setNewPin(text.replace(/[^0-9]/g, ""))}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm New PIN"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          secureTextEntry
          maxLength={6}
          value={confirmPin}
          onChangeText={(text) => setConfirmPin(text.replace(/[^0-9]/g, ""))}
        />
      </Animated.View>

      {error !== "" && (
        <Animated.Text entering={FadeInDown.duration(300)} style={styles.error}>
          {error}
        </Animated.Text>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleChangePin}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Change PIN</Text>
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
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 12,
    color: "#fff",
    fontSize: 18,
    marginBottom: 15,
  },
  error: {
    color: "#ef4444",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "500",
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