import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { requestOrderCancellation, requestOrderRefund } from "../../../api/commerce/orders";

export default function OrderCancelRefundScreen({ route, navigation }) {
  const { order } = route.params;
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    if (!reason.trim()) return Alert.alert("Error", "Please select a reason");
    
    try {
      if (order.status === "delivered") {
        await requestOrderRefund(order.id, { reason, notes });
        Alert.alert("Success", "Refund request submitted");
      } else {
        await requestOrderCancellation(order.id, { reason, notes });
        Alert.alert("Success", "Order cancellation requested");
      }
      navigation.goBack();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to submit request");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order #{order.id}</Text>
      <Text style={styles.subTitle}>Total: ₦{order.total}</Text>

      <TextInput
        style={styles.input}
        placeholder="Reason for cancellation/refund"
        value={reason}
        onChangeText={setReason}
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Additional notes (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Request</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  subTitle: { fontSize: 16, marginBottom: 12 },
  input: {
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  submitBtn: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#1a8917",
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "700" },
});