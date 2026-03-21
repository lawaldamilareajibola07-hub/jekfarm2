import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { addPaymentMethod, updatePaymentMethod } from "../../../api/commerce/payment";

export default function AddEditPaymentMethodScreen({ navigation, route }) {
  const method = route.params?.method;
  const [type, setType] = useState(method?.type || "card");
  const [cardNumber, setCardNumber] = useState(method?.card_number || "");
  const [expiry, setExpiry] = useState(method?.expiry || "");
  const [cvv, setCvv] = useState(method?.cvv || "");
  const [bankName, setBankName] = useState(method?.bank_name || "");
  const [accountNumber, setAccountNumber] = useState(method?.account_number || "");

  const handleSave = async () => {
    try {
      if (method) {
        await updatePaymentMethod(method.id, { type, card_number: cardNumber, expiry, cvv, bank_name: bankName, account_number: accountNumber });
      } else {
        await addPaymentMethod({ type, card_number: cardNumber, expiry, cvv, bank_name: bankName, account_number: accountNumber });
      }
      Alert.alert("Success", "Payment method saved");
      navigation.goBack();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to save payment method");
    }
  };

  return (
    <View style={styles.container}>
      {/* Simplified: Only card example, can expand to bank account form */}
      <TextInput style={styles.input} placeholder="Card Number" value={cardNumber} onChangeText={setCardNumber} keyboardType="number-pad" />
      <TextInput style={styles.input} placeholder="Expiry MM/YY" value={expiry} onChangeText={setExpiry} />
      <TextInput style={styles.input} placeholder="CVV" value={cvv} onChangeText={setCvv} keyboardType="number-pad" />
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Save Payment Method</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  input: {
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  saveBtn: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#1a8917",
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "700" },
});