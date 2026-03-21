import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { getTransactions } from "../../../api/commerce/wallet";

export default function TransactionHistoryScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await getTransactions();
      setTransactions(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTransactions(); }} />
      }
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInUp.delay(index * 50)} style={styles.card}>
          <Text style={[styles.type, item.type === "debit" ? { color: "#d11a2a" } : { color: "#1a8917" }]}>
            {item.type.toUpperCase()}
          </Text>
          <Text style={styles.amount}>₦{parseFloat(item.amount).toLocaleString()}</Text>
          <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
        </Animated.View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  type: { fontWeight: "700", fontSize: 14 },
  amount: { marginTop: 4, fontSize: 16, fontWeight: "600" },
  date: { marginTop: 2, fontSize: 12, color: "#999" },
});