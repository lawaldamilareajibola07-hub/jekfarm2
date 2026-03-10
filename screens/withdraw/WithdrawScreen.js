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
import Animated, { FadeIn, FadeInUp, FadeInDown } from "react-native-reanimated";

import { getBanks, resolveAccount } from "../../api/bank";
import { getWalletBalances } from "../../api/wallet"; // updated function name
import AmountInput from "../../components/withdraw/AmountInput";
import BankSelectorModal from "../../components/withdraw/BankSelectorModal";

export default function WithdrawScreen({ navigation }) {
  const [banks, setBanks] = useState([]);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [bank, setBank] = useState(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [error, setError] = useState("");

  // Load banks and wallet balance on mount
  useEffect(() => {
    loadBanks();
    fetchWalletBalance();
  }, []);

  const loadBanks = async () => {
    setLoadingBanks(true);
    try {
      const res = await getBanks();
      if (res.status === "success" && Array.isArray(res.data)) {
        setBanks(res.data);
      } else {
        setError("Failed to load banks");
      }
    } catch (e) {
      console.log("Error fetching banks:", e);
      setError("Failed to load banks. Please try again.");
    } finally {
      setLoadingBanks(false);
    }
  };

  const fetchWalletBalance = async () => {
    setLoadingBalance(true);
    try {
      const res = await getWalletBalances(); // updated
      if (res.status === "success") {
        // Backend might return array or object
        const balance = Array.isArray(res.data)
          ? res.data.reduce((sum, w) => sum + Number(w.balance || 0), 0)
          : Number(res.data.balance || 0);
        setWalletBalance(balance);
      }
    } catch (e) {
      console.log("Error fetching wallet balance:", e);
    } finally {
      setLoadingBalance(false);
    }
  };

  // Auto resolve account when bank selected & account complete
  useEffect(() => {
    if (selectedBank && accountNumber.length === 10) {
      handleResolve(accountNumber);
    }
  }, [selectedBank, accountNumber]);

  const handleResolve = async (number) => {
    if (!selectedBank || number.length !== 10) return;

    setResolving(true);
    setAccountName("");
    setError("");

    try {
      const res = await resolveAccount(selectedBank.code, number);
      if (res.status === "success") {
        setAccountName(res.data.account_name);
      } else {
        setError("Invalid account number");
      }
    } catch (e) {
      console.log("Error resolving account:", e);
      setError("Failed to resolve account");
    } finally {
      setResolving(false);
    }
  };

  const handleAccountNumberChange = (text) => {
    const sanitized = text.replace(/[^0-9]/g, ""); // ✅ Only numbers
    setAccountNumber(sanitized);
    setAccountName("");
    setError("");

    // Auto open bank modal if account is 10 digits and no bank selected
    if (sanitized.length === 10 && !selectedBank) {
      setBankModalVisible(true);
    }
  };

  const handleSelectBank = (bank) => {
    setSelectedBank(bank);
    setBank(bank);
    setBankModalVisible(false);

    if (accountNumber.length === 10) handleResolve(accountNumber);
  };

  const handleNext = () => {
    Keyboard.dismiss();
    if (!bank) return setError("Select a bank");
    if (!accountName) return setError("Invalid account");
    if (!amount) return setError("Enter amount");

    navigation.navigate("ConfirmWithdraw", {
      amount: amount.replace(/,/g, ""),
      bankCode: bank.code,
      accountNumber,
      accountName,
    });
  };

  const isButtonDisabled = !bank || !accountName || !amount || resolving;

  return (
    <View style={styles.container}>
      {/* Title */}
      <Animated.Text entering={FadeInDown.duration(500)} style={styles.title}>
        Withdraw Funds
      </Animated.Text>

      {/* Wallet Balance */}
      <Animated.View entering={FadeInUp.delay(100)} style={styles.balanceWrapper}>
        {loadingBalance ? (
          <ActivityIndicator color="#22c55e" />
        ) : (
          <Text style={styles.balanceText}>
            Balance: #{Number(walletBalance).toLocaleString()}
          </Text>
        )}
      </Animated.View>

      {/* Account Input */}
      <Animated.View entering={FadeInUp.delay(150)} style={styles.accountInputWrapper}>
        {selectedBank && (
          <View style={styles.bankLogoSmall}>
            <Text style={styles.bankLogoText}>{selectedBank.name.charAt(0)}</Text>
          </View>
        )}
        <TextInput
          style={styles.inputWithLogo}
          placeholder="Account Number"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          maxLength={10}
          value={accountNumber}
          onChangeText={handleAccountNumberChange} // ✅ fixed
        />
      </Animated.View>

      {/* Resolving Indicator */}
      {resolving && (
        <Animated.View entering={FadeIn}>
          <ActivityIndicator color="#22c55e" style={{ marginBottom: 10 }} />
        </Animated.View>
      )}

      {/* Account Name */}
      {accountName !== "" && !resolving && (
        <Animated.Text entering={FadeInUp.duration(400)} style={styles.accountName}>
          {accountName}
        </Animated.Text>
      )}

      {/* Error Message */}
      {error !== "" && !resolving && (
        <Animated.Text entering={FadeInDown.duration(300)} style={styles.error}>
          {error}
        </Animated.Text>
      )}

      {/* Bank Selector Modal */}
      <BankSelectorModal
        visible={bankModalVisible}
        onClose={() => setBankModalVisible(false)}
        banks={banks}
        onSelectBank={handleSelectBank}
      />

      {/* Amount Input */}
      <Animated.View entering={FadeInUp.delay(200)}>
        <AmountInput amount={amount} setAmount={setAmount} balance={walletBalance} />
      </Animated.View>

      {/* Continue Button */}
      <Animated.View entering={FadeInUp.delay(300)}>
        <TouchableOpacity
          style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={isButtonDisabled}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>{resolving ? "Resolving..." : "Continue"}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
  navigation.navigate("WithdrawPin", {
  reference: res.data.reference
});
navigation.navigate("WithdrawReview", {
  amount,
  bankName,
  bankCode,
  accountNumber,
  accountName
});
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 20 },
  title: { fontSize: 26, color: "#fff", fontWeight: "700", marginBottom: 15 },
  balanceWrapper: { marginBottom: 15 },
  balanceText: { fontSize: 18, color: "#22c55e", fontWeight: "600" },
  accountInputWrapper: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  bankLogoSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bankLogoText: { color: "#22c55e", fontWeight: "700", fontSize: 16 },
  inputWithLogo: { flex: 1, backgroundColor: "#1e293b", borderRadius: 12, padding: 16, color: "#fff", fontSize: 15 },
  accountName: { color: "#22c55e", marginBottom: 10, fontWeight: "600", fontSize: 15 },
  error: { color: "#ef4444", marginBottom: 10, fontWeight: "500" },
  button: { backgroundColor: "#22c55e", padding: 18, borderRadius: 14, marginTop: 20, alignItems: "center", shadowColor: "#22c55e", shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  buttonDisabled: { backgroundColor: "#4ade80" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});