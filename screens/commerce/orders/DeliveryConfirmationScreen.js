import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { confirmDelivery } from "../../../api/commerce/orders";

export default function DeliveryConfirmationScreen({ route, navigation }) {
  const { order } = route.params;
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirmDelivery = async () => {
    setLoading(true);
    try {
      await confirmDelivery(order.id, { notes });
      Alert.alert("Success", "Delivery confirmed! Thank you.");
      navigation.navigate("OrdersScreen");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to confirm delivery");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View entering={FadeInUp}>
        <Text style={styles.title}>Confirm Delivery</Text>
        <Text style={styles.subTitle}>Order #{order.id}</Text>

        {order.items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
            <Text style={styles.itemPrice}>₦{item.price}</Text>
          </View>
        ))}

        <Text style={styles.total}>Total: ₦{order.total}</Text>

        <TextInput
          style={styles.notes}
          placeholder="Notes or feedback (optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <TouchableOpacity
          style={[styles.confirmBtn, loading && { opacity: 0.6 }]}
          onPress={handleConfirmDelivery}
          disabled={loading}
        >
          <Text style={styles.confirmText}>{loading ? "Confirming..." : "Confirm Delivery"}</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff", flexGrow: 1 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  subTitle: { fontSize: 16, marginBottom: 16 },
  itemCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
  },
  itemName: { fontSize: 16, fontWeight: "600" },
  itemQty: { fontSize: 14, color: "#555", marginTop: 4 },
  itemPrice: { fontSize: 14, color: "#1a8917", marginTop: 4 },
  total: { fontSize: 18, fontWeight: "700", marginVertical: 12 },
  notes: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    height: 80,
    marginBottom: 20,
  },
  confirmBtn: {
    backgroundColor: "#1a8917",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});