import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";

import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { setTransactionPin } from "../../api/userManager";
import PinInput from "../../components/security/PinInput";

export default function SetTransactionPinScreen({ navigation }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSetPin = async () => {
    Keyboard.dismiss();

    if (!pin || !confirmPin) {
      return setError("Enter PIN");
    }

    if (pin !== confirmPin) {
      return setError("PINs do not match");
    }

    if (!password) {
      return setError("Enter account password");
    }

    setLoading(true);
    setError("");

    try {
      const res = await setTransactionPin(pin, password);

      if (res.status === "success") {
        Alert.alert("Success", "Transaction PIN set successfully");

        navigation.goBack();
      } else {
        setError(res.message || "Failed to set PIN");
      }
    } catch (e) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.Text entering={FadeInDown.duration(400)} style={styles.title}>
        Set Transaction PIN
      </Animated.Text>

      <Animated.Text entering={FadeInUp.delay(100)} style={styles.subtitle}>
        This PIN will be required for withdrawals
      </Animated.Text>
<PinInput pin={pin} setPin={setPin} />
<PinInput pin={confirmPin} setPin={setConfirmPin} />
      <TextInput
        style={styles.input}
        placeholder="Enter PIN"
        placeholderTextColor="#94a3b8"
        keyboardType="numeric"
        secureTextEntry
        maxLength={6}
        value={pin}
        onChangeText={(text) => setPin(text.replace(/[^0-9]/g, ""))}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm PIN"
        placeholderTextColor="#94a3b8"
        keyboardType="numeric"
        secureTextEntry
        maxLength={6}
        value={confirmPin}
        onChangeText={(text) => setConfirmPin(text.replace(/[^0-9]/g, ""))}
      />

      <TextInput
        style={styles.input}
        placeholder="Account Password"
        placeholderTextColor="#94a3b8"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error !== "" && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSetPin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Set PIN</Text>
        )}
      </TouchableOpacity>
    </View>
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

  input: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 12,
    color: "#fff",
    marginBottom: 15,
  },

  error: {
    color: "#ef4444",
    marginBottom: 10,
    textAlign: "center",
  },

  button: {
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
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