import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { getWalletBalance } from "../../../api/commerce/wallet";

export default function WalletScreen({ navigation }) {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await getWalletBalance();
      setBalance(res.data.balance);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Animated.View entering={FadeInUp.duration(500)} style={styles.container}>
      <Text style={styles.title}>Wallet Balance</Text>
      <View style={styles.card}>
        <Text style={styles.balance}>₦{parseFloat(balance).toLocaleString()}</Text>
      </View>

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>Fund Wallet</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, { backgroundColor: "#ddd" }]}>
        <Text style={[styles.btnText, { color: "#333" }]}>Withdraw</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, { marginTop: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: "#1a8917" }]}
        onPress={() => navigation.navigate("TransactionHistory")}
      >
        <Text style={{ color: "#1a8917", fontWeight: "700" }}>Transaction History</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  card: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#f1f7f2",
    marginBottom: 20,
    alignItems: "center",
  },
  balance: { fontSize: 28, fontWeight: "700", color: "#1a8917" },
  btn: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#1a8917",
    marginBottom: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
});