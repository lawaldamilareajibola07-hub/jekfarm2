import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { getPaymentMethods, deletePaymentMethod } from "../../../api/commerce/payment";
import { Ionicons } from "@expo/vector-icons";

export default function PaymentMethodsScreen({ navigation }) {
  const [methods, setMethods] = useState([]);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const res = await getPaymentMethods();
      setMethods(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this payment method?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePaymentMethod(id);
            fetchMethods();
          } catch (err) {
            console.log(err);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 50)} style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.type === "card" ? `**** **** **** ${item.last4}` : item.bank_name}</Text>
        <Text style={styles.details}>{item.type === "card" ? `Expires ${item.expiry}` : item.account_number}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.navigate("AddEditPaymentMethod", { method: item })}>
          <Ionicons name="pencil" size={20} color="#1a8917" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ marginTop: 10 }}>
          <Ionicons name="trash" size={20} color="#d11a2a" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={methods}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate("AddEditPaymentMethod")}
      >
        <Text style={styles.addText}>Add Payment Method</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  name: { fontWeight: "700", fontSize: 16 },
  details: { marginTop: 4, color: "#555" },
  actions: { marginLeft: 10, justifyContent: "center" },
  addBtn: {
    margin: 16,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#1a8917",
    alignItems: "center",
  },
  addText: { color: "#fff", fontWeight: "700" },
});