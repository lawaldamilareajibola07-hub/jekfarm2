import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

// Format number to Naira format
const formatCurrency = (value) => {
  if (!value) return "";
  const number = value.replace(/[^0-9]/g, "");
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const quickAmounts = [5000, 10000, 20000, 50000];

const AmountInput = ({ amount, setAmount, balance = 0 }) => {
  const [focused, setFocused] = useState(false);

  // Handle input change
  const handleChange = (text) => {
    const numeric = text.replace(/[^0-9]/g, "");
    if (Number(numeric) > Number(balance)) {
      setAmount(balance.toString()); // clamp to wallet balance
    } else {
      setAmount(numeric);
    }
  };

  // Quick buttons
  const setQuickAmount = (value) => {
    setAmount(Math.min(value, balance).toString());
  };

  // MAX button
  const setMax = () => {
    setAmount(balance.toString());
  };

  const insufficient = Number(amount) > Number(balance);

  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.container}>
      {/* Label */}
      <View style={styles.labelRow}>
        <Text style={styles.label}>Amount</Text>
        <Text style={styles.balance}>
          Balance: ₦{formatCurrency(balance.toString())}
        </Text>
      </View>

      {/* Input */}
      <View style={[styles.inputWrapper, focused && styles.inputFocused]}>
        <Text style={styles.currency}>₦</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#64748b"
          value={formatCurrency(amount)}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={12}
        />
        <TouchableOpacity onPress={setMax}>
          <Text style={styles.maxBtn}>MAX</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Amount Buttons */}
      <View style={styles.quickRow}>
        {quickAmounts.map((amt) => (
          <TouchableOpacity
            key={amt}
            style={styles.quickBtn}
            onPress={() => setQuickAmount(amt)}
          >
            <Text style={styles.quickText}>
              ₦{formatCurrency(Math.min(amt, balance).toString())}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Insufficient Balance Error */}
      {insufficient && (
        <Animated.Text entering={FadeInUp.duration(200)} style={styles.error}>
          Insufficient wallet balance
        </Animated.Text>
      )}
    </Animated.View>
  );
};

export default AmountInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontWeight: "600",
    color: "#cbd5f5",
    fontSize: 14,
  },
  balance: {
    color: "#94a3b8",
    fontSize: 13,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: "#22c55e",
  },
  currency: {
    color: "#22c55e",
    fontSize: 20,
    fontWeight: "700",
    marginRight: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
  },
  maxBtn: {
    color: "#22c55e",
    fontWeight: "700",
  },
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  quickBtn: {
    backgroundColor: "#1e293b",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  quickText: {
    color: "#fff",
    fontSize: 13,
  },
  error: {
    color: "#ef4444",
    marginTop: 10,
    fontWeight: "500",
  },
});