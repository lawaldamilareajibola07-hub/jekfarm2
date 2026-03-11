import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from "react-native";

import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
} from "react-native-reanimated";

import { fetchBanks, resolveAccountNumber } from "../../api/bank";
import { getWalletBalances } from "../../api/wallet";

import AmountInput from "../../components/withdraw/AmountInput";
import BankSelectorModal from "../../components/withdraw/BankSelectorModal";

export default function WithdrawScreen({ navigation }) {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankModalVisible, setBankModalVisible] = useState(false);

  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const [amount, setAmount] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);

  const [loadingBanks, setLoadingBanks] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [resolving, setResolving] = useState(false);

  const [error, setError] = useState("");

  // Load banks and wallet balance
  useEffect(() => {
    loadBanks();
    loadBalance();
  }, []);

  const loadBanks = async () => {
    setLoadingBanks(true);
    try {
      const res = await fetchBanks();

      if (res.status === "success") {
        setBanks(res.data);
      } else {
        setError("Failed to load banks");
      }
    } catch (err) {
      console.log("Bank fetch error:", err);
      setError("Unable to load banks");
    } finally {
      setLoadingBanks(false);
    }
  };

  const loadBalance = async () => {
    setLoadingBalance(true);

    try {
      const res = await getWalletBalances();

      if (res.status === "success") {
        const balance = Array.isArray(res.data)
          ? res.data.reduce((sum, w) => sum + Number(w.balance || 0), 0)
          : Number(res.data.balance || 0);

        setWalletBalance(balance);
      }
    } catch (err) {
      console.log("Balance error:", err);
    } finally {
      setLoadingBalance(false);
    }
  };

  // Resolve account automatically
  useEffect(() => {
    if (selectedBank && accountNumber.length === 10) {
      resolveAccount(accountNumber);
    }
  }, [accountNumber, selectedBank]);

  const resolveAccount = async (number) => {
    if (!selectedBank) return;

    setResolving(true);
    setAccountName("");
    setError("");

    try {
      const res = await resolveAccountNumber(selectedBank.code, number);

      if (res.status === "success") {
        setAccountName(res.data.account_name);
      } else {
        setError("Invalid account number");
      }
    } catch (err) {
      console.log("Resolve error:", err);
      setError("Failed to resolve account");
    } finally {
      setResolving(false);
    }
  };

  const handleAccountNumberChange = (text) => {
    const sanitized = text.replace(/[^0-9]/g, "");

    setAccountNumber(sanitized);
    setAccountName("");
    setError("");

    if (sanitized.length === 10 && !selectedBank) {
      setBankModalVisible(true);
    }
  };

  const handleSelectBank = (bank) => {
    setSelectedBank(bank);
    setBankModalVisible(false);

    if (accountNumber.length === 10) {
      resolveAccount(accountNumber);
    }
  };

  const handleNext = () => {
    Keyboard.dismiss();
    setError("");

    if (!selectedBank) return setError("Please select a bank");
    if (!accountName) return setError("Invalid account number");
    if (!amount) return setError("Enter withdrawal amount");

    const numericAmount = Number(amount.replace(/,/g, ""));

    if (numericAmount <= 0) return setError("Invalid amount");

    if (numericAmount > walletBalance) {
      return setError("Insufficient wallet balance");
    }

    navigation.navigate("WithdrawReview", {
      amount: numericAmount,
      bankName: selectedBank.name,
      bankCode: selectedBank.code,
      accountNumber,
      accountName,
    });
  };

  const isDisabled =
    !selectedBank || !accountName || !amount || resolving;

  return (
    <View style={styles.container}>
      
      {/* Title */}
      <Animated.Text
        entering={FadeInDown.duration(500)}
        style={styles.title}
      >
        Withdraw Funds
      </Animated.Text>

      {/* Balance */}
      <Animated.View
        entering={FadeInUp.delay(100)}
        style={styles.balanceWrapper}
      >
        {loadingBalance ? (
          <ActivityIndicator color="#22c55e" />
        ) : (
          <Text style={styles.balanceText}>
            Balance: ₦{walletBalance.toLocaleString()}
          </Text>
        )}
      </Animated.View>

      {/* Account Input */}
      <Animated.View
        entering={FadeInUp.delay(200)}
        style={styles.accountInputWrapper}
      >
        {selectedBank && (
          <View style={styles.bankLogo}>
            <Text style={styles.bankLogoText}>
              {selectedBank.name.charAt(0)}
            </Text>
          </View>
        )}

        <TextInput
          placeholder="Account Number"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          maxLength={10}
          value={accountNumber}
          onChangeText={handleAccountNumberChange}
          style={styles.input}
        />
      </Animated.View>

      {/* Resolving Loader */}
      {resolving && (
        <Animated.View entering={FadeIn}>
          <ActivityIndicator
            color="#22c55e"
            style={{ marginBottom: 10 }}
          />
        </Animated.View>
      )}

      {/* Account Name */}
      {accountName !== "" && !resolving && (
        <Animated.Text
          entering={FadeInUp.duration(400)}
          style={styles.accountName}
        >
          {accountName}
        </Animated.Text>
      )}

      {/* Error */}
      {error !== "" && (
        <Animated.Text
          entering={FadeInDown.duration(300)}
          style={styles.error}
        >
          {error}
        </Animated.Text>
      )}

      {/* Amount */}
      <Animated.View entering={FadeInUp.delay(300)}>
        <AmountInput
          amount={amount}
          setAmount={setAmount}
          balance={walletBalance}
        />
      </Animated.View>

      {/* Continue Button */}
      <Animated.View entering={FadeInUp.delay(400)}>
        <TouchableOpacity
          style={[
            styles.button,
            isDisabled && styles.buttonDisabled,
          ]}
          onPress={handleNext}
          disabled={isDisabled}
        >
          <Text style={styles.buttonText}>
            Continue
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Bank Modal */}
      <BankSelectorModal
        visible={bankModalVisible}
        banks={banks}
        onClose={() => setBankModalVisible(false)}
        onSelectBank={handleSelectBank}
      />
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
  },

  balanceWrapper: {
    marginBottom: 20,
  },

  balanceText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#22c55e",
  },

  accountInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  bankLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  bankLogoText: {
    color: "#22c55e",
    fontWeight: "700",
  },

  input: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
  },

  accountName: {
    color: "#22c55e",
    marginBottom: 10,
    fontWeight: "600",
  },

  error: {
    color: "#ef4444",
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#22c55e",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },

  buttonDisabled: {
    backgroundColor: "#4ade80",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});