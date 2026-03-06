import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInUp } from "react-native-reanimated";
import * as Clipboard from "expo-clipboard";

import { createVirtualAccount } from "../api/wallet";

const CreateVirtualAccountScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchVirtualAccount();
  }, []);

  const fetchVirtualAccount = async () => {
    try {
      setLoading(true);

      const response = await createVirtualAccount();

      if (response.status === "success") {
        if (response.data?.accounts?.length > 0) {
          setAccountData(response.data);
        } else {
          // Backend might not include accounts, show info
          Alert.alert(
            "Info",
            "Virtual account exists but account details were not returned. Contact support if this persists."
          );
        }
      } else {
        Alert.alert("Error", response.message || "Could not retrieve account.");
      }
    } catch (error) {
      console.error("Virtual Account Error:", error);
      Alert.alert(
        "Error",
        "Something went wrong while fetching the virtual account."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const copyToClipboard = async () => {
    if (!accountData?.accounts?.[0]?.accountNumber) return;

    await Clipboard.setStringAsync(accountData.accounts[0].accountNumber);
    Alert.alert("Copied", "Account number copied to clipboard.");
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVirtualAccount();
  };

  if (loading && !accountData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={{ marginTop: 10 }}>Loading Virtual Account...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#10b981"]}
        />
      }
    >
      <Text style={styles.title}>Your Virtual Account</Text>

      {accountData && accountData.accounts?.length > 0 ? (
        <Animated.View entering={FadeInUp.duration(500)} style={styles.card}>
          <Text style={styles.label}>Bank Name</Text>
          <Text style={styles.value}>{accountData.accounts[0].bankName}</Text>

          <Text style={styles.label}>Account Name</Text>
          <Text style={styles.value}>{accountData.accounts[0].accountName}</Text>

          <Text style={styles.label}>Account Number</Text>
          <Text style={styles.accountNumber}>
            {accountData.accounts[0].accountNumber}
          </Text>

          <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
            <Text style={styles.copyText}>Copy Account Number</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <Text style={styles.noAccountText}>
          No virtual account available. Pull down to retry.
        </Text>
      )}
    </ScrollView>
  );
};

export default CreateVirtualAccountScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  label: { fontSize: 12, color: "#9CA3AF", marginTop: 12 },
  value: { fontSize: 16, fontWeight: "600", marginTop: 4 },
  accountNumber: { fontSize: 20, fontWeight: "700", marginTop: 4, letterSpacing: 2 },
  copyButton: {
    marginTop: 20,
    backgroundColor: "#10b981",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  copyText: { color: "#fff", fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  noAccountText: { textAlign: "center", marginTop: 50, fontSize: 14, color: "#6B7280" },
});