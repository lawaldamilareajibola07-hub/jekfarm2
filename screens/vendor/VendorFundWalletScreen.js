import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { getOrCreateVirtualAccount } from "../../api/vendor/wallet";

const FundWalletScreen = () => {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    loadVirtualAccount();
  }, []);

  const loadVirtualAccount = async () => {
    try {
      const response = await getOrCreateVirtualAccount();

      console.log("VA RESPONSE:", response);

      if (response?.status === "success" && response?.data) {
        setAccount(response.data);
      } else {
        setAccount(null);
      }
    } catch (error) {
      console.error("Virtual account error:", error);
      setAccount(null);
    } finally {
      setLoading(false);
    }
  };

  const copyAccountNumber = async () => {
    if (!account?.accounts?.[0]?.accountNumber) return;

    await Clipboard.setStringAsync(account.accounts[0].accountNumber);
    Alert.alert("Copied", "Account number copied.");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Fund Your Wallet</Text>

      {account?.accounts?.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.label}>Bank Name</Text>
          <Text style={styles.value}>{account.accounts[0].bankName}</Text>

          <Text style={styles.label}>Account Name</Text>
          <Text style={styles.value}>{account.accounts[0].accountName}</Text>

          <Text style={styles.label}>Account Number</Text>
          <Text style={styles.accountNumber}>
            {account.accounts[0].accountNumber}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={copyAccountNumber}
          >
            <Text style={styles.buttonText}>Copy Account Number</Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            Transfer money from your bank app to this account.
            Your wallet will be credited automatically.
          </Text>
        </View>
      ) : (
        <Text>No virtual account available.</Text>
      )}
    </ScrollView>
  );
};

export default FundWalletScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  label: { fontSize: 12, color: "#9CA3AF", marginTop: 12 },
  value: { fontSize: 16, fontWeight: "600", marginTop: 4 },
  accountNumber: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
    letterSpacing: 2,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#10b981",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  note: {
    marginTop: 16,
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});